import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { Movement } from './movement.entity';
import { MovementService } from './movement.service';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Get()
  async findAll(): Promise<Movement[]> {
    return await this.movementService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Movement> {
    return await this.movementService.findOne(+id);
  }

  @Post()
  async create(@Body() movementData: Partial<Movement>): Promise<Movement> {
    return await this.movementService.create(movementData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() movementData: Partial<Movement>,
  ): Promise<Movement> {
    return await this.movementService.update(+id, movementData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.movementService.delete(+id);
  }

  @Get('date')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Movement[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return await this.movementService.findByDateRange(start, end);
    } catch (error) {
      throw error;
    }
  }
}
