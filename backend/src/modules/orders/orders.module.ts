import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { Product } from '../products/product.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, CartItem, Product])],
  controllers: [],
  providers: [],
})
export class OrdersModule {}
