import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, parentId?: number) {
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        name,
        parentId,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findTree() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }
  async delete(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with children');
    }

    if (category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
