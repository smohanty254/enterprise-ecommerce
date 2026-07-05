/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { envSchema } from './config/env';
import { typeOrmOptions } from './database/typeorm.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (c) => envSchema.parse(c),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({ useFactory: () => typeOrmOptions }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
