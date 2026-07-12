/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { PaginationDto } from './pagination.dto';

@Injectable()
export class ProductsService {
  private redis = new Redis(process.env.REDIS_URL!);
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}
  async list(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Dynamic page-specific Redis caching keyspace string mapping
    const cacheKey = `products:active:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [products, total] = await this.repo.findAndCount({
      where: { active: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    const responsePayload = {
      data: products,
      meta: {
        totalItems: total,
        itemCount: products.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
        nextPage: nextPage,
      },
    };

    // Cache page window array entries for 60 seconds
    await this.redis.set(cacheKey, JSON.stringify(responsePayload), 'EX', 60);
    return responsePayload;
  }

  async get(id: string) {
    const p = await this.repo.findOneBy({ id });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async create(dto: CreateProductDto) {
    const p = await this.repo.save(this.repo.create(dto));
    await this.clearProductCache();
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.repo.update(id, dto);
    await this.clearProductCache();
    return this.get(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { active: false });
    await this.clearProductCache();
    return { ok: true };
  }

  // Clear all page entries in Redis accross pagination keyspaces on mutation
  private async clearProductCache() {
    const keys = await this.redis.keys('products:active:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
