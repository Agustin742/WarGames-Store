import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(Number(id), updateCategoryDto);
  }
}
