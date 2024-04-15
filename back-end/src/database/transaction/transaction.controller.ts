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
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /*
  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
  }*/

  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAllWithRelations();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findOne(+id);
  }

  @Post()
  async create(
    @Body() transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionService.create(transactionData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionService.update(+id, transactionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.transactionService.delete(+id);
  }

  @Get('date')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Transaction[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return this.transactionService.findByDateRange(start, end);
    } catch (error) {
      throw error;
    }
  }
}
