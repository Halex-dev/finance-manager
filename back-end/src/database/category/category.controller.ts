import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAllCategory();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Category> {
    return this.categoryService.findCategoryById(id);
  }

  @Post()
  async create(@Body() category: Partial<Category>): Promise<Category> {
    return this.categoryService.createCategory(category);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() category: Category,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, category);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }
}
