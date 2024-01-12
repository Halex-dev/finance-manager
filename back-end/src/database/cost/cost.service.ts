import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Cost } from './cost.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Category } from '../category/category.entity';
import { AmortizationService } from '../amortization/amortization.service';
import { Amortization } from '../amortization/amortization.entity';

@Injectable()
export class CostService {
  constructor(
    @InjectRepository(Cost)
    //private readonly costRepository: Repository<Cost>,
    private costRepository: Repository<Cost>,

    @InjectRepository(Wallet) // Inietta il repository dell'entità Wallet
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Category) // Inietta il repository dell'entità Category
    private readonly categoryRepository: Repository<Category>,

    private readonly amortizationService: AmortizationService
  ) {}

  async findAllCost(): Promise<Cost[]> {
    return this.costRepository.find({
      relations: ['category', 'wallet'], //Relations
    });
  }

  async findAllCostByDate(startDate: Date, endDate: Date): Promise<Cost[]> {
    return this.costRepository.find({
      relations: ['category', 'wallet'],
      where: {
        date: Between(startDate, endDate)
      }
    });
  }

  async findCostById(id: number): Promise<Cost> {
    return this.costRepository.findOne({
      relations: ['category', 'wallet'], //Relations
    });
  }

  //TODO SOLO SE IL COSTO VIENE OGGI O PRECEDENTE
  async createCost(cost: Cost): Promise<Cost> {
    try {
        await this.validateInput(cost);
        
        const wallet = await this.walletRepository.findOne({ where: { id:  Number(cost.wallet) } });
        const today = new Date();
        const categoryToAssociate = await this.categoryRepository.findOne({ where: { id:  Number(cost.category) } });

        if (!wallet) {
            throw new NotFoundException('Portafoglio non trovato.');
        }

        if (wallet.money < cost.price) {
            throw new BadRequestException('Fondi insufficienti nel portafoglio.');
        }

        if(cost.checkAmortization === true && cost.selectedMonths > 1){

          const monthlyCost = cost.price / cost.selectedMonths;

          if( cost.date <= today ){
            wallet.money -= monthlyCost; // Sottrai il costo dal saldo del portafoglio
            wallet.money = parseFloat(wallet.money.toFixed(2));
            await this.walletRepository.update(wallet.id, wallet);  // Salva l'entità Wallet modificata
          }

          const amortization = {
            description: cost.description,
            dateStart: today,
            months: cost.selectedMonths,
            price: cost.price,
          }; // Clona l'oggetto costo

          //await this.amortizationService.createAmortization(amortization, cost.category, cost.wallet);

          await this.amortizationService.createAmortization(amortization, cost.category, cost.wallet)
          //await this.costRepository.save(cost)
          return; 
        }
        else{

          //TODO SOLO SE IL COSTO VIENE OGGI O PRECEDENTE

          if( cost.date <= today ){
            wallet.money -= cost.price; // Sottrai il costo dal saldo del portafoglio
            wallet.money = parseFloat(wallet.money.toFixed(2));
            await this.walletRepository.update(wallet.id, wallet);  // Salva l'entità Wallet modificata
          }

          return await this.costRepository.save(cost); 
        }

    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
          throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione del nuovo costo.');
    }
  }

  async updateCost(id: number, cost: Cost): Promise<Cost> {
    try {
      await this.validateInput(cost);

      const oldCost = await this.costRepository.findOne({ where: { id }, relations: ['category', 'wallet']});

      if (!oldCost) {
        throw new NotFoundException('Portafoglio non trovato.');
      }

      if (oldCost.checkAmortization === true && oldCost.selectedMonths > 1) {
        throw new BadRequestException('Non puoi modificare un costo ammortizzato.');
      }

      const walletToAssociate = await this.walletRepository.findOne({ where: { id:  Number(cost.wallet) } });
      const categoryToAssociate = await this.categoryRepository.findOne({ where: { id:  Number(cost.category) } });

      if (!walletToAssociate) {
        throw new NotFoundException('Portafoglio non trovato.');
      }

      if (!categoryToAssociate) {
        throw new NotFoundException('Categoria non trovata.');
      }

      //Il wallet è uguale
      if( oldCost.wallet.id === walletToAssociate.id){
        const diff = (cost.price - oldCost.price); //calcolo la differenza rispetto al costo precedente
        
        if (walletToAssociate.money < diff) {
          throw new BadRequestException('Fondi insufficienti nel portafoglio.');
        }

        walletToAssociate.money -= diff; // Sottrai il costo dal saldo del portafoglio
        walletToAssociate.money = parseFloat(walletToAssociate.money.toFixed(2));

        await this.walletRepository.update(walletToAssociate.id, walletToAssociate); // Salva l'entità Wallet modificata
      }
      else{ //Il wallet è diverso
        const oldWallet = await this.walletRepository.findOne({ where: { id: oldCost.wallet.id } });

        if (walletToAssociate.money < cost.price) {
          throw new BadRequestException('Fondi insufficienti nel portafoglio.');
        }

        oldWallet.money += oldCost.price;
        walletToAssociate.money -= cost.price;

        await this.walletRepository.update(walletToAssociate.id, walletToAssociate); // Salva l'entità Wallet modificata
        await this.walletRepository.update(oldWallet.id, oldWallet); // Salva l'entità Wallet modificata
      }
    
      cost.wallet  = walletToAssociate;
      cost.category = categoryToAssociate;

      // Salva le modifiche nell'istanza del record Cost
      const updatedCost = await this.costRepository.update(id, cost);
      
      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCost.affected === 0) {
        throw new NotFoundException(`Cost con ID ${id} non trovata.`);
      }

      return cost;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      console.log(error);
      throw new BadRequestException('Errore durante la modifica del wallet.');
    }
  }
  

  //TODO Elimino anche gli altri ammortizzati (Se elimino il padre), altrimenti non posso eliminarli
  async deleteCost(id: number): Promise<void> {
    try {

      const oldCost = await this.costRepository.findOne({ where: { id }, relations: ['wallet'] });

      if (!oldCost.wallet) {
          throw new NotFoundException('Portafoglio non trovato.');
      }

      oldCost.wallet.money += oldCost.price; // Aggiungo il costo dal saldo del portafoglio
      oldCost.wallet.money = parseFloat(oldCost.wallet.money.toFixed(2));
      
      oldCost

      await this.walletRepository.update(oldCost.wallet.id, oldCost.wallet);  // Salva l'entità Wallet modificata
      await this.costRepository.delete(id); 
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Errore durante la rimozione del costo.');
    }
    
  }

  async validateInput(cost: Cost): Promise<void> {
    
    if (!cost.price || cost.price <= 0) {
      throw new BadRequestException('Errore, il prezzo non può essere negativo o nullo.');
    }

    // Arrotonda il valore money a due decimali
    cost.price = parseFloat(cost.price.toFixed(2));
  }

  
}