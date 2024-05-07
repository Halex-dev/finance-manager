import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { logger } from '../../module/logger';
import * as fs from 'fs';
import * as path from 'path';
import { appConfig } from '../../module/config';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async findAllWallet(): Promise<Wallet[]> {
    try {
      return await this.walletRepository.find();
    } catch (error) {
      logger.error(`Error while fetching all wallets: ${error}`);
      throw new BadRequestException('Error while fetching all wallets');
    }
  }

  async findWalletById(id: number): Promise<Wallet> {
    try {
      return this.walletRepository.findOne({ where: { id } });
    } catch (error) {
      logger.error(`Error while fetching all wallets: ${error}`);
      throw new BadRequestException(
        `Error while fetching wallet with ID: ${id}`,
      );
    }
  }

  async createWallet(wallet: Partial<Wallet>): Promise<Wallet> {
    try {
      await this.validateInput(wallet);

      if (wallet.id) {
        throw new BadRequestException('No.');
      }

      return await this.walletRepository.save(wallet);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      logger.error(`Error while creating a new wallet: ${error}`);
      throw new BadRequestException('Error while creating a new wallet');
    }
  }

  async updateWallet(id: number, wallet: Wallet): Promise<Wallet> {
    try {
      await this.validateInput(wallet, id);

      const updatedCategory = await this.walletRepository.update(id, wallet);

      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCategory.affected === 0) {
        logger.error(`Error wallet don't found ID: ${id}`);
        throw new NotFoundException(`Wallet con ID ${id} non trovato.`);
      }
      return wallet;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      logger.error(`Error while updating a new wallet: ${error}`);
      throw new BadRequestException('Error while updating a wallet');
    }
  }

  //TODO GESTIRE BADREQUESTEXCEPTION se voglio eliminare tutto il wallet con i costi o no
  async deleteWallet(id: number): Promise<void> {
    try {
      const wallet = await this.walletRepository.findOne({ where: { id } });

      if (!wallet) {
        throw new NotFoundException('Portafoglio non trovato');
      }

      const fileName = path.basename(wallet.avatar);
      await this.walletRepository.delete(id);

      if (fileName) {
        const fullPath = path.join(appConfig.uploadPath, fileName);

        if (!fs.existsSync(fullPath)) {
          throw new NotFoundException('Immagine non trovata');
        }

        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('FOREIGN KEY constraint failed')
      ) {
        throw new BadRequestException(
          'Impossibile eliminare il wallet: è ancora referenziata a qualche cost o income, elimina quelli prima.',
        );
      }

      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }

      logger.error(`Error while deleting a wallet: ${error}`);
      throw new BadRequestException('Error while deleting a wallet');
    }
  }

  async validateUniqueness(wallet: Partial<Wallet>, id = null): Promise<void> {
    const name = wallet.name;
    const existingWallet = await this.walletRepository.findOne({
      where: [{ name }, { name: Like(`%${name}%`) }],
    });

    if (existingWallet && id != existingWallet.id) {
      throw new BadRequestException('The name must be unique');
    }
  }

  async validateInput(wallet: Partial<Wallet>, id = null): Promise<void> {
    if (!wallet.name || wallet.name.trim() === '') {
      throw new BadRequestException('The name cannot be invalid.');
    }

    // Controlla se wallet.currency è un numero decimale
    if (
      isNaN(parseFloat(wallet.currency.toString())) ||
      !isFinite(wallet.currency)
    ) {
      throw new BadRequestException('Currency must be a decimal number.');
    }

    // Converte wallet.currency in un numero decimale
    wallet.currency = parseFloat(wallet.currency.toString());

    if (wallet.currency < 0) {
      throw new BadRequestException('Currency cannot be negative.');
    }

    // Arrotonda il valore currency a due decimali
    wallet.currency = parseFloat(wallet.currency.toFixed(2));

    //Checking uniquiness
    await this.validateUniqueness(wallet, id);
  }
}
