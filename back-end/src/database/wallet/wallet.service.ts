import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    //private readonly costRepository: Repository<Cost>,
    private walletRepository: Repository<Wallet>,
  ) {}

  async findAllWallet(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async findWalletById(id: number): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { id } });
  }

  async createWallet(wallet: Wallet): Promise<Wallet> {
    try {
        await this.validateUniqueness(wallet);
        await this.validateInput(wallet);
        return await this.walletRepository.save(wallet); 
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione del wallet.');
    }
  }

  async updateWallet(id: number, wallet: Wallet): Promise<Wallet> {
    try {
      await this.validateInput(wallet);
      const updatedCategory = await this.walletRepository.update(id, wallet);

      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCategory.affected === 0) {
        throw new NotFoundException(`Wallet con ID ${id} non trovata.`);
      }
      return wallet;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la modifica del wallet.');
    }
  }
  

  //GESTIRE BADREQUESTEXCEPTION se voglio eliminare tutto il wallet con i costi o no
  async deleteWallet(id: number): Promise<void> {
    try {
      await this.walletRepository.delete(id);
    } catch (error) {
  
      if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
        throw new BadRequestException('Impossibile eliminare il wallet: è ancora referenziata a qualche cost o income, elimina quelli prima.');
      }
  
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
  
      throw new BadRequestException('Errore durante la eliminazione del wallet.');
    }
  }
  
  

  async validateUniqueness(wallet: Wallet): Promise<void> {
    const description = wallet.description;
    const existingCategory = await this.walletRepository.findOne({
      where: { description },
    });
  
    if (existingCategory) {
      throw new BadRequestException('Errore, la descrizione deve essere univoca.');
    }
  }

  async validateInput(wallet: Wallet): Promise<void> {
    if (!wallet.description || wallet.description.trim() === '') {
      throw new BadRequestException('Errore, la descrizione non può essere nulla.');
    }
    
    if (!wallet.money || wallet.money < 0) {
      throw new BadRequestException('Errore, i soldi non possono essere negativi.');
    }

    // Arrotonda il valore money a due decimali
    wallet.money = parseFloat(wallet.money.toFixed(2));
  }

}