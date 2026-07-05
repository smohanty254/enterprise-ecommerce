/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'order_id' }) orderId!: string;
  @Column({ name: 'product_id' }) productId!: string;
  @Column() quantity!: number;
  @Column({ name: 'price_cents' }) priceCents!: number;
  @ManyToOne(() => Order, (order: any) => order.items)
  @JoinColumn({ name: 'order_id' })
  order!: Order;
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
