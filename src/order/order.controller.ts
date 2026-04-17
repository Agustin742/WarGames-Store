import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CreateWhatsappOrder } from './dto/createWhatsappOrder.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('whatsapp-preview')
  async generate(
    @Request() req: { user?: JwtPayload | null },
    @Body() dto: CreateWhatsappOrder,
  ) {
    const message = await this.orderService.generateWhatsappMessage(
      dto.items,
      req.user ?? null,
      dto.customerName,
      dto.notes,
    );

    const whatsappUrl = this.orderService.generateWhatsappLink(message);

    return {
      message,
      whatsappUrl,
    };
  }
}
