import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movement } from './movement.entity';
import { logger } from '../../module/logger';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
  ) {}

  async findAll(): Promise<Movement[]> {
    try {
      return await this.movementRepository.find();
    } catch (error) {
      logger.error(`Error while fetching all movement: ${error}`);
      throw new BadRequestException('Error while fetching all movement');
    }
  }

  async findOne(id: number): Promise<Movement> {
    try {
      const movement = await this.movementRepository.findOne({
        relations: ['wallet'],
        where: { id: id },
      });
      if (!movement) {
        throw new NotFoundException(`Movement with id ${id} not found`);
      }
      return movement;
    } catch (error) {
      logger.error(`Error while fetching movement with id ${id}: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while fetching movement with id ${id}`,
      );
    }
  }

  async create(movementData: Partial<Movement>): Promise<Movement> {
    try {
      const movement = this.movementRepository.create(movementData);
      return await this.movementRepository.save(movement);
    } catch (error) {
      logger.error(`Error while creating movement: ${error}`);
      throw new BadRequestException('Error while creating movement');
    }
  }

  async update(id: number, movementData: Partial<Movement>): Promise<Movement> {
    try {
      await this.movementRepository.update(id, movementData);
      const updatedMovement = await this.movementRepository.findOne({
        relations: ['wallet'],
        where: { id: id },
      });
      if (!updatedMovement) {
        throw new NotFoundException(`Movement with id ${id} not found`);
      }
      return updatedMovement;
    } catch (error) {
      logger.error(`Error while updating movement with id ${id}: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while updating movement with id ${id}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.movementRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Movement with id ${id} not found`);
      }
    } catch (error) {
      logger.error(`Error while deleting movement with id ${id}: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error while deleting movement with id ${id}`,
      );
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Movement[]> {
    try {
      return await this.movementRepository.find({
        where: {
          date: Between(startDate, endDate),
        },
      });
    } catch (error) {
      logger.error(`Error while finding movements by date range: ${error}`);
      throw new BadRequestException(
        'Error while finding movements by date range',
      );
    }
  }
}
