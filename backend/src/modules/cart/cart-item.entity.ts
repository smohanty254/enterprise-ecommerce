import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
@Entity('cart_items')
@Unique(['userId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @Column({ name: 'product_id' }) productId!: string;
  @Column() quantity!: number;
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user!: User;
}
