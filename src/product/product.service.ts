import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/createProduct.dto';
import { UpdateProductoDto } from './dto/updateProducto.dto';
import { CategoryService } from 'src/category/category.service';
import { Prisma } from 'generated/prisma/client';
import { UploadsService } from 'src/uploads/uploads.service';
import { MulterFile } from './interfaces/multer-file.interface';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly uploadService: UploadsService,
  ) {}

  async create(data: CreateProductoDto, file?: MulterFile) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (file) {
      const uploaded = await this.uploadService.uploadImage(file);
      imageUrl = uploaded.url;
      imagePublicId = uploaded.public_id;
    }

    return this.prisma.product.create({
      data: {
        ...data,
        imageUrl,
        imagePublicId,
      },
    });
  }

  async findAll(name?: string, categoryId?: number) {
    const where: Prisma.ProductWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (categoryId) {
      const ids = await this.categoryService.getAllChildrenIds(categoryId);

      where.categoryId = {
        in: ids,
      };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductoDto, file?: MulterFile) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    let imageUrl = product.imageUrl;
    let imagePublicId = product.imagePublicId;

    if (file) {
      const uploaded = await this.uploadService.uploadImage(file);

      imageUrl = uploaded.url;
      imagePublicId = uploaded.public_id;

      if (product.imagePublicId) {
        await this.uploadService.deleteImage(product.imagePublicId);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        imageUrl,
        imagePublicId,
      },
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.imagePublicId) {
      await this.uploadService.deleteImage(product.imagePublicId);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
