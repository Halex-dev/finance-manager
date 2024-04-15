import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { Amortization } from './amortization.entity';
import { AmortizationService } from './amortization.service';

@Controller('amortization')
export class AmortizationController {
  constructor(private readonly amortizationService: AmortizationService) {}

  @Get()
  async findAll(): Promise<Amortization[]> {
    try {
      return await this.amortizationService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Amortization> {
    try {
      return await this.amortizationService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  async create(
    @Body() amortizationData: Partial<Amortization>,
  ): Promise<Amortization> {
    try {
      return await this.amortizationService.create(amortizationData);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() amortizationData: Partial<Amortization>,
  ): Promise<Amortization> {
    try {
      return await this.amortizationService.update(+id, amortizationData);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.amortizationService.delete(+id);
    } catch (error) {
      throw error;
    }
  }
}
