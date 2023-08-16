import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './income.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    //private readonly incomeRepository: Repository<Income>,
    private incomeRepository: Repository<Income>,

    @InjectRepository(Wallet) // Inietta il repository dell'entità Wallet
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async findAllIncome(): Promise<Income[]> {
    return this.incomeRepository.find({
      relations: ['wallet'], //Relations
    });
  }

  async findIncomeById(id: number): Promise<Income> {
    return this.incomeRepository.findOne({ where: { id }, relations: ['wallet']});
  }

  async createIncome(income: Income): Promise<Income> {
    try {
      await this.validateInput(income);

      const wallet = await this.walletRepository.findOne({ where: { id:  Number(income.wallet) } });

      if (!wallet) {
        throw new NotFoundException('Portafoglio non trovato.');
      }

      wallet.money += income.income; // Sottrai il costo dal saldo del portafoglio
      wallet.money = parseFloat(wallet.money.toFixed(2));
      await this.walletRepository.update(wallet.id, wallet);  // Salva l'entità Wallet modificata

      return await this.incomeRepository.save(income); 

    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
          throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione del nuovo costo.');
    }
  }

  async updateIncome(id: number, income: Income): Promise<Income> {
    try {
      await this.validateInput(income);

      const oldIncome = await this.incomeRepository.findOne({ where: { id }, relations: ['wallet']});

      if (!oldIncome) {
        throw new NotFoundException('Income non trovato.');
      }

      const walletToAssociate = await this.walletRepository.findOne({ where: { id:  Number(income.wallet) } });

      if (!walletToAssociate) {
        throw new NotFoundException('Portafoglio non trovato.');
      }

      //Il wallet è uguale
      if( oldIncome.wallet.id === walletToAssociate.id){
        const diff = (income.income - oldIncome.income); //calcolo la differenza rispetto al costo precedente
        
        walletToAssociate.money += diff; // Sottrai il costo dal saldo del portafoglio
        walletToAssociate.money = parseFloat(walletToAssociate.money.toFixed(2));

        await this.walletRepository.update(walletToAssociate.id, walletToAssociate); // Salva l'entità Wallet modificata
      }
      else{ //Il wallet è diverso
        const oldWallet = await this.walletRepository.findOne({ where: { id: oldIncome.wallet.id } });

        oldWallet.money -= oldIncome.income;
        walletToAssociate.money += income.income;

        await this.walletRepository.update(walletToAssociate.id, walletToAssociate); // Salva l'entità Wallet modificata
        await this.walletRepository.update(oldWallet.id, oldWallet); // Salva l'entità Wallet modificata
      }

      // Salva le modifiche nell'istanza del record Income
      const updatedCost = await this.incomeRepository.update(id, income);
      
      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCost.affected === 0) {
        throw new NotFoundException(`Cost con ID ${id} non trovata.`);
      }

      return income;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      console.log(error);
      throw new BadRequestException('Errore durante la modifica del wallet.');
    }
  }
  
  async deleteIncome(id: number): Promise<void> {
    try {
      const oldIncome = await this.incomeRepository.findOne({ where: { id }, relations: ['wallet'] });

      if (!oldIncome.wallet) {
          throw new NotFoundException('Portafoglio non trovato.');
      }

      oldIncome.wallet.money -= oldIncome.income; // Sottrai il costo dal saldo del portafoglio
      oldIncome.wallet.money = parseFloat(oldIncome.wallet.money.toFixed(2));
      
      await this.walletRepository.update(oldIncome.wallet.id, oldIncome.wallet);  // Salva l'entità Wallet modificata
      await this.incomeRepository.delete(id); 
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Errore durante la rimozione del costo.');
    }
    
  }
 
  async validateInput(income: Income): Promise<void> {
    
    if (!income.income || income.income <= 0) {
      throw new BadRequestException('Errore, il prezzo non può essere negativo o nullo.');
    }

    // Arrotonda il valore money a due decimali
    income.income = parseFloat(income.income.toFixed(2));
  }
}