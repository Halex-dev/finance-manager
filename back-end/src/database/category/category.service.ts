import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    //private readonly categoryRepository: Repository<Cost>,
    private categoryRepository: Repository<Category>,
  ) {}

  async findAllCategory(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findCategoryById(id: number): Promise<Category> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      await this.validateUniqueness(category);
      await this.validateInput(category);
      return await this.categoryRepository.save(category); 
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione della categoria.');
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      await this.validateInput(category);
      const updatedCategory = await this.categoryRepository.update(id, category);

      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCategory.affected === 0) {
        throw new NotFoundException(`Categoria con ID ${id} non trovata.`);
      }
      return category;
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      throw new BadRequestException('Errore durante la creazione della categoria.');
    }
  }

  async deleteCategory(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
  
  async validateUniqueness(category: Category): Promise<void> {
    const description = category.description;
    const existingCategory = await this.categoryRepository.findOne({
      where: { description },
    });
  
    if (existingCategory) {
      throw new BadRequestException('Errore, la descrizione deve essere univoca.');
    }
  }

  async validateInput(category: Category): Promise<void> {
    if (!category.description || category.description.trim() === '') {
      throw new BadRequestException('Errore, la descrizione non può essere nulla.');
    }
  }


}