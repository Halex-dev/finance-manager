import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from './type.entity';

@Injectable()
export class TypeService {
  constructor(
    @InjectRepository(Type)
    //private readonly costRepository: Repository<Cost>,
    private typeRepository: Repository<Type>,
  ) {}

  async findAllType(): Promise<Type[]> {
    return this.typeRepository.find();
  }

  async findTypeById(id: number): Promise<Type> {
    return this.typeRepository.findOne({ where: { id } });
  }

  async createType(type: Type): Promise<Type> {
    return this.typeRepository.save(type);
  }

  async updateType(id: number, type: Type): Promise<Type> {
    try {
      await this.validateInput(type);
      const updatedCategory = await this.typeRepository.update(id, type);

      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCategory.affected === 0) {
        throw new NotFoundException(`Categoria con ID ${id} non trovata.`);
      }
      
      return type;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione della categoria.');
    }
    return this.typeRepository.save(type);
  }
  
  async deleteType(id: number): Promise<void> {
    await this.typeRepository.delete(id);
  }
  

  async validateUniqueness(description: string): Promise<void> {
    const existingCategory = await this.typeRepository.findOne({
      where: { description },
    });
  
    if (existingCategory) {
      throw new BadRequestException('Errore, la descrizione deve essere univoca.');
    }
  }

  async validateInput(type: Type): Promise<void> {
    if (!type.description || type.description.trim() === '') {
      throw new BadRequestException('Errore, la descrizione non può essere nulla.');
    }
  }
}