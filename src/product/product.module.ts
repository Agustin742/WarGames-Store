import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from 'src/category/category.module';
import { UploadsService } from 'src/uploads/uploads.service';

@Module({
  imports: [CategoryModule],
  controllers: [ProductController],
  providers: [ProductService, UploadsService],
})
export class ProductModule {}
