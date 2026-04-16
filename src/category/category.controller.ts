import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(
      createCategoryDto.name,
      createCategoryDto.parentId,
    );
  }

  @Get()
  findAllCategories() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  findTreeCategory() {
    return this.categoryService.findTree();
  }

  @Get('tree-recursive')
  findTreeRecursive() {
    return this.categoryService.findTreeRecursive();
  }

  @Patch(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
