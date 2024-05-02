import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { logger } from '../../module/logger';

import { Wallet } from '../wallet/wallet.entity';
import { Category } from '../category/category.entity';

import { CategoryType } from '../category/category.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.find();
    } catch (error) {
      logger.error(`Error while fetching all transactions: ${error}`);
      throw new BadRequestException('Error while fetching all transactions');
    }
  }

  async findAllWithRelations(): Promise<Transaction[]> {
    try {
      return this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
      });
    } catch (error) {
      logger.error(`Error while fetching all transactions: ${error}`);
      throw new BadRequestException('Error while fetching all transactions');
    }
  }

  async findOne(id: number): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        relations: ['category', 'transaction', 'amortization'],
        where: { id: id },
      });
      if (!transaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }
      return transaction;
    } catch (error) {
      logger.error(`Error while fetching transaction with id ${id}: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while fetching transaction with id ${id}`,
      );
    }
  }

  async createAmort(
    transactionData: Partial<Transaction>,
    queryRunner: QueryRunner,
  ): Promise<Transaction> {
    try {
      let transaction: Transaction;
      await this.validateInput(transactionData);

      if (transactionData.id) {
        throw new BadRequestException('No.');
      }

      if (!transactionData.wallet) {
        throw new BadRequestException('wallet is required for transaction');
      }

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: transactionData.wallet.id },
      });

      // Se la categoria è una spesa, controlla se ci sono abbastanza soldi nel portafoglio
      if (wallet.currency < transactionData.amount) {
        throw new BadRequestException('Not enough money in the wallet');
      }

      wallet.currency -= transactionData.amount;

      await queryRunner.manager.save(wallet);

      transaction = this.entityManager.create(Transaction, transactionData);
      transaction = await queryRunner.manager.save(transaction);

      //await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      logger.error(`Error while creating (amortization) transaction: ${error}`);
      throw new Error(error);
    }
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    let transaction: Transaction;
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateInput(transactionData);

      if (transactionData.id) {
        throw new BadRequestException('No.');
      }

      if (!transactionData.category || !transactionData.wallet) {
        throw new BadRequestException(
          'Category and wallet are required for transaction',
        );
      }

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: transactionData.wallet.id },
      });

      const category = await queryRunner.manager.findOneOrFail(Category, {
        where: { id: transactionData.category.id },
      });

      await this.operationCheck(wallet, category, transactionData);

      await queryRunner.manager.save(wallet);

      transaction = this.entityManager.create(Transaction, transactionData);
      transaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error while creating transaction: ${error}`);
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    let updatedTransaction: Transaction;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateInput(transactionData);

      if (!id) {
        throw new BadRequestException('Transaction ID is required');
      }

      // Controllo se la transazione esiste
      const existingTransaction = await queryRunner.manager.findOne(
        Transaction,
        {
          where: { id: transactionData.id },
          relations: ['category', 'wallet', 'amortization'],
        },
      );

      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      // Controllo se l'attributo 'amount', 'category' o 'wallet' sono stati modificati
      if (
        (transactionData.amount !== undefined &&
          existingTransaction.amount !== transactionData.amount) ||
        (transactionData.category !== undefined &&
          existingTransaction.category.id !== transactionData.category.id) ||
        (transactionData.wallet !== undefined &&
          existingTransaction.wallet.id !== transactionData.wallet.id)
      ) {
        //ANNULLO OPERAZIONI PRECEDENTI
        const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
          where: { id: existingTransaction.wallet.id },
        });

        const category = await queryRunner.manager.findOneOrFail(Category, {
          where: { id: existingTransaction.category.id },
        });

        await this.rollbackTransition(wallet, category, existingTransaction);

        await queryRunner.manager.save(wallet);

        //INIZIO NUOVA OPERAZIONE
        const newWallet = await queryRunner.manager.findOneOrFail(Wallet, {
          where: { id: transactionData.wallet.id },
        });

        const newCategory = await queryRunner.manager.findOneOrFail(Category, {
          where: { id: transactionData.category.id },
        });

        await this.operationCheck(newWallet, newCategory, transactionData);

        // Salvataggio del portafoglio
        await queryRunner.manager.save(newWallet);
      }

      await queryRunner.manager.update(Transaction, id, transactionData);

      // Recupero della transazione aggiornata
      updatedTransaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionData.id },
      });

      // Controllo se la transazione aggiornata esiste
      if (!updatedTransaction) {
        throw new NotFoundException(
          `Updated transaction with id ${id} not found`,
        );
      }

      // Commit della transazione
      await queryRunner.commitTransaction();

      return updatedTransaction;
    } catch (error) {
      logger.error(`Error while updating transaction with id ${id}: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error);
    } finally {
      // Rilascio del queryRunner
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingTransaction = await queryRunner.manager.findOne(
        Transaction,
        {
          where: { id: id },
          relations: ['category', 'wallet', 'amortization'],
        },
      );

      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: existingTransaction.wallet.id },
      });

      if (!existingTransaction.category)
        wallet.currency += existingTransaction.amount; //It was an amortization, add money
      else {
        const category = await queryRunner.manager.findOneOrFail(Category, {
          where: { id: existingTransaction.category.id },
        });

        await this.rollbackTransition(wallet, category, existingTransaction);
      }

      await queryRunner.manager.save(wallet);

      // Eliminazione della transazione
      const result = await queryRunner.manager.delete(Transaction, id);

      // Controllo se la transazione è stata eliminata correttamente
      if (result.affected === 0) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }
      // Commit della transazione
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback in caso di errore
      await queryRunner.rollbackTransaction();
      logger.error(`Error while deleting transaction with id ${id}: ${error}`);
      throw new BadRequestException(error);
    } finally {
      // Rilascio del queryRunner
      await queryRunner.release();
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
        where: {
          date: Between(startDate, endDate),
        },
      });
    } catch (error) {
      logger.error(`Error while finding transactions by date range: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error while finding transactions by date range',
      );
    }
  }

  async findByStartDate(startDate: Date): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
        where: {
          date: MoreThanOrEqual(startDate),
        },
      });
    } catch (error) {
      logger.error(`Error while finding transactions by start date: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error while finding transactions by start date',
      );
    }
  }

  async findByEndDate(endDate: Date): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
        where: {
          date: Between(new Date(0), endDate),
        },
      });
    } catch (error) {
      logger.error(`Error while finding transactions by end date: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error while finding transactions by end date',
      );
    }
  }

  async findAllByYear(year: number): Promise<Transaction[]> {
    try {
      const startDate = new Date(year, 0, 1); // Inizio dell'anno corrente
      const endDate = new Date(year, 11, 31); // Fine dell'anno corrente
      return this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
        where: {
          date: Between(startDate, endDate),
        },
      });
    } catch (error) {
      logger.error(
        `Error while finding transactions with relations by year: ${error}`,
      );
      throw new BadRequestException('Error while finding transactions by year');
    }
  }

  async findAllByMonth(month: number): Promise<Transaction[]> {
    try {
      const currentYear = new Date().getFullYear(); // Ottiene l'anno corrente
      const startDate = new Date(currentYear, month - 1, 1); // Inizio del mese specificato
      const endDate = new Date(currentYear, month, 0); // Fine del mese specificato
      return this.transactionRepository.find({
        relations: ['category', 'wallet', 'amortization'],
        where: {
          date: Between(startDate, endDate),
        },
      });
    } catch (error) {
      logger.error(
        `Error while finding transactions with relations by month: ${error}`,
      );
      throw new BadRequestException(
        'Error while finding transactions by month',
      );
    }
  }

  async validateInput(transaction: Partial<Transaction>): Promise<void> {
    // Controlla se transaction.currency è un numero decimale
    if (
      isNaN(parseFloat(transaction.amount.toString())) ||
      !isFinite(transaction.amount)
    ) {
      throw new BadRequestException('Amount must be a decimal number.');
    }

    // Converte transaction.currency in un numero decimale
    transaction.amount = parseFloat(transaction.amount.toString());

    if (transaction.amount <= 0) {
      throw new BadRequestException('Amount cannot be negative or zero.');
    }

    // Arrotonda il valore currency a due decimali
    transaction.amount = parseFloat(transaction.amount.toFixed(2));
  }

  async rollbackTransition(
    wallet: Wallet,
    category: Category,
    data: Partial<Transaction>,
  ) {
    if (!wallet) {
      throw new BadRequestException('Invalid wallet');
    }

    if (!category) {
      throw new BadRequestException('Invalid wallet');
    }

    if (category.category_type === CategoryType.INCOME) {
      if (wallet.currency < data.amount) {
        throw new BadRequestException('Not enough money in the wallet');
      }
      wallet.currency -= data.amount; //Era un ingresso, levo i soldi
    } else {
      wallet.currency += data.amount; //Era una spesa, aggiungo i soldi
    }
  }

  async operationCheck(
    wallet: Wallet,
    category: Category,
    data: Partial<Transaction>,
  ) {
    if (!wallet) {
      throw new BadRequestException('Invalid wallet');
    }

    if (!category) {
      throw new BadRequestException('Invalid wallet');
    }

    if (category.category_type === CategoryType.INCOME) {
      wallet.currency += data.amount;
    } else {
      // Se la categoria è una spesa, controlla se ci sono abbastanza soldi nel portafoglio
      if (wallet.currency < data.amount) {
        throw new BadRequestException('Not enough money in the wallet');
      }

      wallet.currency -= data.amount;
    }
  }
}
