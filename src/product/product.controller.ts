import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductoDto } from './dto/createProduct.dto';
import { UpdateProductoDto } from './dto/updateProducto.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multerFileInterface from './interfaces/multer-file.interface';
import { imageFileFilter } from 'src/uploads/image-filter';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  createProduct(
    @Body() dto: CreateProductoDto,
    @UploadedFile() file?: multerFileInterface.MulterFile,
  ) {
    return this.productService.create(dto, file);
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
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @UploadedFile() file?: multerFileInterface.MulterFile,
  ) {
    return this.productService.update(Number(id), dto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteProduct(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
