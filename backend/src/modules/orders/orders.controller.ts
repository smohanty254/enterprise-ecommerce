import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type JwtUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrdersController {
  constructor(private orders: OrdersService) {}
  @Get() list(@CurrentUser() u: JwtUser) {
    return this.orders.list(u.sub);
  }
  @Post('checkout') checkout(@CurrentUser() u: JwtUser) {
    return this.orders.checkout(u.sub);
  }
}
