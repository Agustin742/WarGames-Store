import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateWhatsappOrder } from './dto/createWhatsappOrder.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('whatsapp-preview')
  async generate(@Body() createWhatsappOrder: CreateWhatsappOrder) {
    const message = await this.orderService.generateWhatsappMessage(
      createWhatsappOrder.items,
    );

    const whatsappUrl = this.orderService.generateWhatsappLink(message);

    return {
      message,
      whatsappUrl,
    };
  }
}
