import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { Category } from '../category/category.entity';
import { Amortization } from './amortization.entity';
import { Cost } from '../cost/cost.entity';

@Injectable()
export class AmortizationService {
  constructor(
    @InjectRepository(Amortization)
    //private readonly amortizationRepository: Repository<Amortization>,
    private amortizationRepository: Repository<Amortization>,

    @InjectRepository(Wallet) // Inietta il repository dell'entità Wallet
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Category) // Inietta il repository dell'entità Category
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Cost) // Inietta il repository dell'entità Category
    private readonly costRepository: Repository<Cost>
  ) {}

  async findAllAmortization(): Promise<Amortization[]> {
    return this.amortizationRepository.find({
      relations: ['childCosts'], //Relations
    });
  }

  async findAllAmortizationByDate(startDate: Date, endDate: Date): Promise<Amortization[]> {
    try {  
      const result = await this.amortizationRepository.find({
        relations: ['childCosts'],
        where: [
          {
            dateStart: LessThanOrEqual(endDate),  // La data di inizio è prima o uguale alla data di fine fornita
            dateEnd: MoreThanOrEqual(startDate),  // La data di fine è dopo o uguale alla data di inizio fornita
          },
          {
            dateStart: Between(startDate, endDate),  // Le date sono comprese nell'intervallo fornito
          },
        ],
      });
  
      console.log('Query Result:', result);
  
      return result;
    } catch (error) {
      console.error('Error in findAllAmortizationByDate:', error);
      throw error;
    }
  }

  async findAmortizationById(id: number): Promise<Amortization> {
    return this.amortizationRepository.findOne({
      relations: ['childCosts'], //Relations
    });
  }

  async createAmortization(amortization , category , wallet): Promise<Amortization> {
    try {
        await this.validateInput(amortization);       

        if(amortization.months > 1){

          const monthlyCost = amortization.price / amortization.months;

          const startDate = new Date(amortization.dateStart);
          const endDate = new Date(amortization.dateStart);
          endDate.setMonth(startDate.getMonth() + amortization.months);

          amortization.dateEnd = endDate; 
          const AmortCreated = await this.amortizationRepository.save(amortization);

          const newCosts : Cost[] = [];

          for (let i = 0; i < amortization.months; i++) {

            // Calcola la nuova data aggiungendo i mesi correnti
            const newDate = new Date(amortization.dateStart);
          
            const newCost = {
              description: amortization.description,
              date: newDate,
              status: 0,
              price: monthlyCost,
              wallet: wallet,
              category: category,
              amortization: amortization,
            }; // Clona l'oggetto costo

            newDate.setMonth(newDate.getMonth() + i);
            let cost =  await this.costRepository.save(newCost);
            newCosts.push(cost);
          }

          //TODO NON LI COLLEGA, RISOLVERE
          AmortCreated.childCosts = newCosts;
          return AmortCreated;
        }
        else{
          return; 
        }
        
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
          throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione del nuovo costo.');
    }
  }

  async updateAmortization(id: number, amortization: Amortization): Promise<Amortization> {
    try {
      await this.validateInput(amortization);

      const oldCost = await this.amortizationRepository.findOne({ where: { id }, relations: ['category', 'wallet']});

      if (!oldCost) {
        throw new NotFoundException('Portafoglio non trovato.');
      }

      if (oldCost.months > 1) {
        throw new BadRequestException('Non puoi modificare un costo ammortizzato.');
      }

      // Salva le modifiche nell'istanza del record Amortization
      const updatedCost = await this.amortizationRepository.update(id, amortization);
      
      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCost.affected === 0) {
        throw new NotFoundException(`Amortization con ID ${id} non trovata.`);
      }

      return amortization;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      console.log(error);
      throw new BadRequestException('Errore durante la modifica del wallet.');
    }
  }
  

  //TODO Elimino anche i costi ammortizzati (Se elimino il padre), altrimenti non posso eliminarli
  async deleteAmortization(id: number): Promise<void> {
    try {
      await this.amortizationRepository.delete(id); 
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Errore durante la rimozione del costo.');
    }
    
  }

  async validateInput(amortization: Amortization): Promise<void> {
    
    if (!amortization.price || amortization.price <= 0) {
      throw new BadRequestException('Errore, il prezzo non può essere negativo o nullo.');
    }

    // Arrotonda il valore money a due decimali
    amortization.price = parseFloat(amortization.price.toFixed(2));
  }
}