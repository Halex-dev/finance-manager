import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amortization } from './amortization.entity';
import { logger } from '../../module/logger';

@Injectable()
export class AmortizationService {
  constructor(
    @InjectRepository(Amortization)
    private readonly amortizationRepository: Repository<Amortization>,
  ) {}

  async findAll(): Promise<Amortization[]> {
    try {
      return await this.amortizationRepository.find();
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
    try {
      const amortization = this.amortizationRepository.create(amortizationData);
      return await this.amortizationRepository.save(amortization);
    } catch (error) {
      logger.error(`Error while creating amortization data: ${error}`);
      throw new BadRequestException('Error while creating amortization data');
    }
  }

  async update(
    id: number,
    amortizationData: Partial<Amortization>,
  ): Promise<Amortization> {
    try {
      await this.amortizationRepository.update(id, amortizationData);
      const updatedAmortization = await this.amortizationRepository.findOne({
        where: { id: id },
      });
      if (!updatedAmortization) {
        throw new NotFoundException(
          `Amortization data with id ${id} not found`,
        );
      }
      return updatedAmortization;
    } catch (error) {
      logger.error(
        `Error while updating amortization data with id ${id}: ${error}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while updating amortization data with id ${id}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.amortizationRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Amortization data with id ${id} not found`,
        );
      }
    } catch (error) {
      logger.error(
        `Error while deleting amortization data with id ${id}: ${error}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while deleting amortization data with id ${id}`,
      );
    }
  }
}
