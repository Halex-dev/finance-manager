import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from './income.entity';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  async getIncome(@Query('startDate') startDate: string, @Query('endDate') endDate: string): Promise<Income[]> {

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      return this.incomeService.findAllIncomeByDate(parsedStartDate, parsedEndDate);
    } 
    else {
      return this.incomeService.findAllIncome();
    }
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getIncomeById(@Param('id') id: number): Promise<Income> {
    return this.incomeService.findIncomeById(id);
  }

  @Post()
  async createIncome(@Body() income: Income): Promise<Income> {
    return this.incomeService.createIncome(income);
  }

  @Post(':id')
  async updateIncome(@Param('id') id: number, @Body() income: Income): Promise<Income> {
    return this.incomeService.updateIncome(id, income);
  }
  
  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteIncomeById(@Param('id') id: number): Promise<void> {
    await this.incomeService.deleteIncome(id);
  }

}