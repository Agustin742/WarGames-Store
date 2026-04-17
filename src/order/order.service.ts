import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async generateWhatsappMessage(
    items: { productId: number; quantity: number }[],
    user?: JwtPayload | null,
    customerName?: string,
    notes?: string,
  ) {
    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== items.length) {
      throw new NotFoundException('Some products not found');
    }

    let finalName = 'Cliente';

    if (user) {
      const dbUser = await this.prisma.user.findUnique({
        where: {
          id: user.sub,
        },
      });

      finalName = dbUser?.userName || user.email;
    } else if (customerName) {
      finalName = customerName;
    }

    let message = `Hola, soy ${finalName}.\n\n`;
    message += `Quiero consultar por:\n\n`;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      message += `- ${product?.name} (x${item.quantity})\n`;
    }

    if (notes) {
      message += `\nNotas: ${notes}`;
    }

    return message;
  }

  generateWhatsappLink(message: string) {
    const phone = process.env.PHONE_NUMBER;

    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }
}
