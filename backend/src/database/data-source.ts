/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { entities } from './typeorm.options';
config();
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/database/migrations/*.ts'],
});
