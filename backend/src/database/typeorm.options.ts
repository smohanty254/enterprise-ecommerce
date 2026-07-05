import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from '../modules/users/user.entity';
import { RefreshToken } from '../modules/auth/refresh-token.entity';
import { Product } from '../modules/products/product.entity';
import { CartItem } from '../modules/cart/cart-item.entity';
import { Order } from '../modules/orders/order.entity';
import { OrderItem } from '../modules/orders/order-item.entity';
import { AuditLog } from '../modules/audit/audit-log.entity';

export const entities = [
  User,
  RefreshToken,
  Product,
  CartItem,
  Order,
  OrderItem,
  AuditLog,
];

export const typeOrmOptions = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities,
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  migrationsRun: process.env.NODE_ENV === 'production',
});
