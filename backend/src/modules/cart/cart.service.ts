import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Injectable()
export class CartService {
  constructor(@InjectRepository(CartItem) private repo: Repository<CartItem>) {}
  list(userId: string) {
    return this.repo.find({ where: { userId } });
  }
  async add(userId: string, productId: string, quantity: number) {
    const existing = await this.repo.findOneBy({ userId, productId });
    if (existing) {
      existing.quantity += quantity;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ userId, productId, quantity }));
  }
  remove(userId: string, id: string) {
    return this.repo.delete({ userId, id });
  }
  clear(userId: string) {
    return this.repo.delete({ userId });
  }
}
