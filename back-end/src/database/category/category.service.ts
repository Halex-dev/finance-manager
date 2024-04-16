import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';
import { logger } from '../../module/logger';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAllCategory(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      logger.error(`Error while fetching all wallets: ${error}`);
      throw new BadRequestException('Error while fetching all wallets');
    }
  }

  async findCategoryById(id: number): Promise<Category> {
    try {
      return this.categoryRepository.findOne({ where: { id } });
    } catch (error) {
      logger.error(`Error while fetching all wallets: ${error}`);
      throw new BadRequestException(
        `Error while fetching wallet with ID: ${id}`,
      );
    }
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    try {
      await this.validateInput(category);

      if (category.id) {
        throw new BadRequestException('No.');
      }

      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      logger.error(`Error while creating a new wallet: ${error}`);
      throw new BadRequestException('Error while creating a new wallet');
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      await this.validateInput(category, id);
      const updatedCategory = await this.categoryRepository.update(
        id,
        category,
      );

      // Verifica se l'aggiornamento ha avuto successo
      if (updatedCategory.affected === 0) {
        throw new NotFoundException(`Categoria con ID ${id} non trovata.`);
      }
      return category;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }
      logger.error(`Error while updating a new wallet: ${error}`);
      throw new BadRequestException('Error while updating a wallet');
    }
  }

  //TODO GESTIRE BADREQUESTEXCEPTION se voglio eliminare tutto il wallet con i costi o no
  async deleteCategory(id: number): Promise<void> {
    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('FOREIGN KEY constraint failed')
      ) {
        throw new BadRequestException(
          'Impossibile eliminare la categoria: è ancora referenziata a qualche costo, elimina quelli prima.',
        );
      }

      if (error instanceof BadRequestException) {
        throw error; // L'eccezione di univocità è già stata gestita, rilanciala
      }

      logger.error(`Error while deleting a wallet: ${error}`);
      throw new BadRequestException('Error while deleting a wallet');
    }
  }

  async validateUniqueness(
    category: Partial<Category>,
    id = null,
  ): Promise<void> {
    const name = category.name;
    const existingCategory = await this.categoryRepository.findOne({
      where: [{ name }, { name: Like(`%${name}%`) }],
    });

    if (existingCategory && id != existingCategory.id) {
      throw new BadRequestException('The name must be unique');
    }
  }

  async validateInput(category: Partial<Category>, id = null): Promise<void> {
    if (!category.date) {
      throw new BadRequestException('The date cannot be invalid.');
    }

    if (!category.name || category.name.trim() === '') {
      throw new BadRequestException('The name cannot be invalid.');
    }

    if (!Object.values(CategoryType).includes(category.category_type)) {
      throw new BadRequestException(
        'You must enter what type of expense the category belongs to',
      );
    }

    await this.validateUniqueness(category, id);
  }
}
