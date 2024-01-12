import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { AmortizationService } from './amortization.service';
import { Amortization } from './amortization.entity';

@Controller('amortizations')
export class AmortizationController {
  constructor(private readonly amortizationService: AmortizationService) {}

  @Get()
  async getAmortization(@Query('startDate') startDate: string, @Query('endDate') endDate: string): Promise<Amortization[]> {
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      return this.amortizationService.findAllAmortizationByDate(parsedStartDate, parsedEndDate);
    } 
    else {
      return this.amortizationService.findAllAmortization();
    }
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getAmortizationById(@Param('id') id: number): Promise<Amortization> {
    return this.amortizationService.findAmortizationById(id);
  }

  @Post(':id')
  async updateAmortization(@Param('id') id: number, @Body() amortization: Amortization): Promise<Amortization> {
    return this.amortizationService.updateAmortization(id, amortization);
  }
  
  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteAmortizationById(@Param('id') id: number): Promise<void> {
    await this.amortizationService.deleteAmortization(id);
  }

}