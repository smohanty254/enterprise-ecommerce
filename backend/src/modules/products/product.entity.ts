import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column({ unique: true }) slug!: string;
  @Column('text') description!: string;
  @Column({ name: 'price_cents' }) priceCents!: number;
  @Column() stock!: number;
  @Column({ name: 'image_url', nullable: true }) imageUrl?: string;
  @Column({ default: true }) active!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
