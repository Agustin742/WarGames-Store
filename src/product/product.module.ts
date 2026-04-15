import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from 'src/category/category.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CategoryService],
})
export class ProductModule {}
