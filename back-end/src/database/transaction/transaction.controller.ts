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

  /*@Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionService.findAllWithRelations();
  }*/

  @Get()
  async findAll(): Promise<Transaction[]> {
    // Ottieni l'anno corrente
    const currentYear = new Date().getFullYear();
    // Utilizza il service per ottenere le transazioni dell'anno corrente
    return this.transactionService.findAllByYear(currentYear);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    console.log('ah?');
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

  @Get('date/range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Transaction[]> {
    // Parse the ISO strings to Date objects as UTC
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Use the converted dates for the search
    return this.transactionService.findByDateRange(start, end);
  }

  @Get('date/start')
  async findByStartDate(
    @Query('startDate') startDate: string,
  ): Promise<Transaction[]> {
    const start = new Date(startDate);
    return this.transactionService.findByStartDate(start);
  }

  @Get('date/end')
  async findByEndDate(
    @Query('endDate') endDate: string,
  ): Promise<Transaction[]> {
    const end = new Date(endDate);
    return this.transactionService.findByEndDate(end);
  }

  @Get('year/:year')
  async findByYear(@Param('year') year: number): Promise<Transaction[]> {
    return this.transactionService.findAllByYear(year);
  }

  @Get('month/:month')
  async findByMonth(@Param('month') month: number): Promise<Transaction[]> {
    return this.transactionService.findAllByMonth(month);
  }
}
