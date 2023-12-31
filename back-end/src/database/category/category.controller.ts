import { Controller, Get, Post, Delete, Body, Param, BadRequestException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService) {}

  @Get()
  async getCategory(): Promise<Category[]> {
    return this.categoryService.findAllCategory();
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getCategoryById(@Param('id') id: number): Promise<Category> {
    return this.categoryService.findCategoryById(id);
  }

  @Post()
  async createCategory(@Body() category: Category): Promise<Category> {
      return this.categoryService.createCategory(category);
  }

  @Post(':id')
  async updateCategory(@Param('id') id: number, @Body() category: Category): Promise<Category> {
    return this.categoryService.updateCategory(id, category);
  }
  
  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteCategoryById(@Param('id') id: number): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }

}