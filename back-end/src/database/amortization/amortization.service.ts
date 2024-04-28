import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryRunner, Repository, MoreThan } from 'typeorm';
import { Amortization } from './amortization.entity';
import { logger } from '../../module/logger';
import { addMonths, differenceInMonths, endOfDay, startOfDay } from 'date-fns';
import { TransactionService } from '../transaction/transaction.service';
import { Transaction } from '../transaction/transaction.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class AmortizationService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Amortization)
    private readonly amortizationRepository: Repository<Amortization>,
    private readonly transactionService: TransactionService,
  ) {}

  async findAll(): Promise<Amortization[]> {
    try {
      return await this.amortizationRepository.find({
        relations: ['wallet', 'transactions'],
      });
    } catch (error) {
      logger.error(`Error while fetching all amortization data: ${error}`);
      throw new BadRequestException(
        'Error while fetching all amortization data',
      );
    }
  }

  async findAllActive(): Promise<Amortization[]> {
    try {
      return await this.amortizationRepository.find({
        relations: ['wallet', 'transactions'],
        where: { residualValue: MoreThan(0) },
      });
    } catch (error) {
      logger.error(`Error while fetching all amortization data: ${error}`);
      throw new BadRequestException(
        'Error while fetching all amortization data',
      );
    }
  }

  async findOne(id: number): Promise<Amortization> {
    try {
      const amortization = await this.amortizationRepository.findOne({
        where: { id: id },
        relations: ['wallet', 'transactions'],
      });
      if (!amortization) {
        throw new NotFoundException(
          `Amortization data with id ${id} not found`,
        );
      }
      return amortization;
    } catch (error) {
      logger.error(
        `Error while fetching amortization data with id ${id}: ${error}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while fetching amortization data with id ${id}`,
      );
    }
  }

  async create(amortizationData: Partial<Amortization>): Promise<Amortization> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    let amortization: Amortization;
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateInput(amortizationData);

      if (amortizationData.id) {
        throw new BadRequestException('No.');
      }

      if (!amortizationData.wallet) {
        throw new BadRequestException('Wallet are required for amortization');
      }

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: amortizationData.wallet.id },
      });

      if (!wallet) {
        throw new BadRequestException('Invalid wallet');
      }

      amortization = this.entityManager.create(Amortization, amortizationData);
      amortization = await queryRunner.manager.save(amortization);

      await this.createMonthlyTransaction(amortization, queryRunner);

      amortization = await queryRunner.manager.save(amortization);
      await queryRunner.commitTransaction();

      return amortization;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error while creating amortization: ${error}`);
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    amortizationData: Partial<Amortization>,
  ): Promise<Amortization> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let updatedAmortization: Amortization;

    try {
      await this.validateInput(amortizationData);

      if (!id) {
        throw new BadRequestException('Amortization ID is required');
      }

      // Controllo se la transazione esiste
      const existingAmortization = await queryRunner.manager.findOne(
        Amortization,
        {
          where: { id: amortizationData.id },
          relations: ['wallet', 'transactions'],
        },
      );

      if (!existingAmortization) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: existingAmortization.wallet.id },
      });

      if (!wallet) {
        throw new BadRequestException('Invalid wallet');
      }

      //Elimino tutte le transizioni collegate all'ammortamento fatte fino ad oggi
      await this.deleteAllTransactions(existingAmortization, queryRunner);

      //TODO fare in un altro modo
      existingAmortization.description = amortizationData.description;
      existingAmortization.date = amortizationData.date;
      existingAmortization.durationMonths = amortizationData.durationMonths;
      existingAmortization.initialAmount = amortizationData.initialAmount;
      existingAmortization.initialAmount = amortizationData.residualValue;
      existingAmortization.startDate = amortizationData.startDate;
      existingAmortization.wallet = amortizationData.wallet;

      //Rifaccio gli ammortamenti
      await this.createMonthlyTransaction(existingAmortization, queryRunner);

      //await queryRunner.manager.update(Amortization, id, existingAmortization);
      await queryRunner.manager.save(Amortization, existingAmortization);

      // Recupero della transazione aggiornata
      updatedAmortization = await queryRunner.manager.findOne(Amortization, {
        where: { id: amortizationData.id },
      });

      // Controllo se la transazione aggiornata esiste
      if (!updatedAmortization) {
        throw new NotFoundException(
          `Updated transaction with id ${id} not found`,
        );
      }

      // Commit della transazione
      await queryRunner.commitTransaction();

      return updatedAmortization;
    } catch (error) {
      logger.error(
        `Error while updating amortization data with id ${id}: ${error}`,
      );
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while updating amortization data with id ${id}`,
      );
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
      const existingAmortization = await queryRunner.manager.findOne(
        Amortization,
        { where: { id: id }, relations: ['wallet', 'transactions'] },
      );

      if (!existingAmortization) {
        throw new NotFoundException(`Amortization with id ${id} not found`);
      }

      await this.deleteAllTransactions(existingAmortization, queryRunner);

      // Eliminazione della ammortamento
      const result = await queryRunner.manager.delete(Amortization, id);

      // Controllo se l'ammortamento è stato eliminao correttamente
      if (result.affected === 0) {
        throw new NotFoundException(`Amortization with id ${id} not found`);
      }

      // Commit della transazione
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback in caso di errore
      await queryRunner.rollbackTransaction();
      logger.error(`Error while deleting amortization with id ${id}: ${error}`);
      throw new BadRequestException(error);
    } finally {
      // Rilascio del queryRunner
      await queryRunner.release();
    }
  }

  async validateInput(amortization: Partial<Amortization>): Promise<void> {
    // Controlla se amortization.currency è un numero decimale
    if (
      isNaN(parseFloat(amortization.initialAmount.toString())) ||
      !isFinite(amortization.initialAmount)
    ) {
      throw new BadRequestException('Amount must be a decimal number.');
    }

    // Converte amortization.currency in un numero decimale
    amortization.initialAmount = parseFloat(
      amortization.initialAmount.toString(),
    );

    if (amortization.initialAmount <= 0) {
      throw new BadRequestException('Amount cannot be negative or zero.');
    }

    if (
      isNaN(parseInt(amortization.durationMonths.toString())) ||
      !isFinite(amortization.durationMonths)
    ) {
      throw new BadRequestException('Months must be an integer number.');
    }

    if (amortization.durationMonths <= 1) {
      throw new BadRequestException('Months has to be more than 1.');
    }

    amortization.residualValue = amortization.initialAmount;
    amortization.transactions = [] as Transaction[];
  }

  async createMonthlyTransaction(
    amortization: Amortization,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const today = endOfDay(new Date());
    const startDate = startOfDay(amortization.startDate);

    if (today.getTime() >= startDate.getTime()) {
      const monthsPassed = differenceInMonths(today, startDate);

      const monthsToPay = Math.min(amortization.durationMonths, monthsPassed);

      for (let i = 0; i <= monthsToPay; i++) {
        const toPay = amortization.initialAmount / amortization.durationMonths;

        // Calculate the month
        const currentMonthDate = addMonths(startDate, i);

        const transaction: Partial<Transaction> = {
          amount: toPay,
          description: `Amortization: ${amortization.description}`,
          date: currentMonthDate,
          wallet: amortization.wallet,
          amortization: amortization,
        };

        const newTrans = await this.transactionService.createAmort(
          transaction,
          queryRunner,
        );
        amortization.transactions.push(newTrans);
        amortization.residualValue -= toPay;

        if (amortization.residualValue < 0) amortization.residualValue = 0;
      }
    }
  }

  async deleteAllTransactions(
    amortization: Amortization,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
      where: { id: amortization.wallet.id },
    });

    if (!wallet) {
      throw new BadRequestException('Invalid wallet');
    }

    amortization.residualValue = amortization.initialAmount;
    amortization.transactions.forEach(async (transaction) => {
      wallet.currency += transaction.amount;
      const result = await queryRunner.manager.delete(
        Transaction,
        transaction.id,
      );
      if (result.affected === 0) {
        throw new NotFoundException(
          `Transaction with id ${transaction.id} not found`,
        );
      }
    });

    amortization.transactions = [];
    await queryRunner.manager.save(wallet);
  }
}
