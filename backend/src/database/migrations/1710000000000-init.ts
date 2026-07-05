import { MigrationInterface, QueryRunner } from 'typeorm';
export class Init1710000000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    console.log('Migration is starting.....');
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`CREATE TYPE user_role AS ENUM ('ADMIN','CUSTOMER')`);
    await q.query(
      `CREATE TYPE order_status AS ENUM ('PENDING','PAID','FULFILLED','CANCELLED')`,
    );
    await q.query(
      `CREATE TABLE users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), email varchar(255) UNIQUE NOT NULL, password_hash varchar(255) NOT NULL, role user_role NOT NULL DEFAULT 'CUSTOMER', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE refresh_tokens (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid REFERENCES users(id) ON DELETE CASCADE, token_hash varchar(255) NOT NULL, revoked boolean NOT NULL DEFAULT false, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE products (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), name varchar(180) NOT NULL, slug varchar(200) UNIQUE NOT NULL, description text NOT NULL, price_cents int NOT NULL, stock int NOT NULL DEFAULT 0, image_url text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE cart_items (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid REFERENCES users(id) ON DELETE CASCADE, product_id uuid REFERENCES products(id) ON DELETE CASCADE, quantity int NOT NULL, UNIQUE(user_id, product_id))`,
    );
    await q.query(
      `CREATE TABLE orders (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid REFERENCES users(id), status order_status NOT NULL DEFAULT 'PENDING', total_cents int NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE order_items (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), order_id uuid REFERENCES orders(id) ON DELETE CASCADE, product_id uuid REFERENCES products(id), quantity int NOT NULL, price_cents int NOT NULL)`,
    );
    await q.query(
      `CREATE TABLE audit_logs (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), actor_id uuid, action varchar(120) NOT NULL, entity varchar(120) NOT NULL, entity_id varchar(120), metadata jsonb NOT NULL DEFAULT '{}', correlation_id varchar(80), created_at timestamptz NOT NULL DEFAULT now())`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      `DROP TABLE audit_logs, order_items, orders, cart_items, products, refresh_tokens, users`,
    );
    await q.query(`DROP TYPE order_status`);
    await q.query(`DROP TYPE user_role`);
  }
}
