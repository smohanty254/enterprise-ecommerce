import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Redis from 'ioredis';
import { CartItem } from '../cart/cart-item.entity';
import { Product } from '../products/product.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
  private redis = new Redis(process.env.REDIS_URL!);
  constructor(
    @InjectDataSource() private ds: DataSource,
    @InjectRepository(Order) private orders: Repository<Order>,
    private realtime: RealtimeGateway,
  ) {}
  list(userId: string) {
    return this.orders.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async checkout(userId: string) {
    const lock = `lock:checkout:${userId}`;
    if ((await this.redis.set(lock, '1', 'PX', 10000, 'NX')) !== 'OK')
      throw new BadRequestException('Checkout is already in progress');
    try {
      const order = await this.ds.transaction(async (m) => {
        const cart = await m.find(CartItem, {
          where: { userId },
          relations: { product: true },
        });
        if (!cart.length) throw new BadRequestException('Cart is empty');
        let total = 0;
        for (const item of cart) {
          if (item.product.stock < item.quantity)
            throw new BadRequestException(
              `${item.product.name} is out of stock`,
            );
          total += item.product.priceCents * item.quantity;
          await m.decrement(
            Product,
            { id: item.productId },
            'stock',
            item.quantity,
          );
        }

        const saved = await m.save(
          Order,
          m.create(Order, {
            userId,
            totalCents: total,
            items: cart.map((c) =>
              m.create(OrderItem, {
                productId: c.productId,
                quantity: c.quantity,
                priceCents: c.product.priceCents,
              }),
            ),
          }),
        );
        await m.delete(CartItem, { userId });
        return saved;
      });
      this.realtime.broadcast('analytics:update', {
        type: 'order.created',
        orderId: order.id,
        totalCents: order.totalCents,
      });
      return order;
    } finally {
      await this.redis.del(lock);
    }
  }
}
