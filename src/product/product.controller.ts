import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductoDto } from './dto/createProduct.dto';
import { UpdateProductoDto } from './dto/updateProducto.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductoDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAllProducts(
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productService.findAll(
      name,
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductoDto,
  ) {
    return this.productService.update(Number(id), updateProductDto);
  }

  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
