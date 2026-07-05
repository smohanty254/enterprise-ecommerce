import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;
  @Column({ name: 'total_cents' }) totalCents!: number;
  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true, eager: true })
  items!: OrderItem[];
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
