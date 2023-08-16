import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TypeService } from './type.service';
import { Type } from './type.entity';

@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Get()
  async getType(): Promise<Type[]> {
    return this.typeService.findAllType();
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getTypeById(@Param('id') id: number): Promise<Type> {
    return this.typeService.findTypeById(id);
  }

  @Post()
  async createType(@Body() type: Type): Promise<Type> {
    return this.typeService.createType(type);
  }

  @Post(':id')
  async updateType(@Param('id') id: number, @Body() type: Type): Promise<Type> {
    return this.typeService.updateType(id, type);
  }
  
  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteTypeById(@Param('id') id: number): Promise<void> {
    await this.typeService.deleteType(id);
  }

}