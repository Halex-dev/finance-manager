import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { CostService } from './cost.service';
import { Cost } from './cost.entity';

@Controller('costs')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get() //TODO aggiungere controlli se ho startDate e non endDate e viceversa, controllare anche negli altri
  async getCost(@Query('startDate') startDate: string, @Query('endDate') endDate: string): Promise<Cost[]> {

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      return this.costService.findAllCostByDate(parsedStartDate, parsedEndDate);
    } 
    else {
      return this.costService.findAllCost();
    }
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getCostById(@Param('id') id: number): Promise<Cost> {
    return this.costService.findCostById(id);
  }

  @Post()
  async createCost(@Body() cost: Cost): Promise<Cost> {
    return this.costService.createCost(cost);
  }

  @Post(':id')
  async updateCost(@Param('id') id: number, @Body() cost: Cost): Promise<Cost> {
    return this.costService.updateCost(id, cost);
  }
  
  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteCostById(@Param('id') id: number): Promise<void> {
    await this.costService.deleteCost(id);
  }

}