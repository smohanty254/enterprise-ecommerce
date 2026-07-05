/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  private redis = new Redis(process.env.REDIS_URL!);
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}
  async list() {
    const key = 'products:active';
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    const products = await this.repo.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
    await this.redis.set(key, JSON.stringify(products), 'EX', 60);
    return products;
  }

  async get(id: string) {
    const p = await this.repo.findOneBy({ id });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async create(dto: CreateProductDto) {
    const p = await this.repo.save(this.repo.create(dto));
    await this.redis.del('products:active');
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.repo.update(id, dto);
    await this.redis.del('products:active');
    return this.get(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { active: false });
    await this.redis.del('products: active');
    return { ok: true };
  }
}
