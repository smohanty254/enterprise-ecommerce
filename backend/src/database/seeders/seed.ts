import dataSource from '../data-source';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/users/user.entity';
import { Product } from '../../modules/products/product.entity';

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const products = dataSource.getRepository(Product);
  for (const [email, password, role] of [
    ['admin@example.com', 'Admin123!', UserRole.ADMIN],
    ['customer@example.com', 'Customer123!', UserRole.CUSTOMER],
  ] as const) {
    if (!(await users.findOneBy({ email })))
      await users.save(
        users.create({
          email,
          passwordHash: await bcrypt.hash(password, 12),
          role,
        }),
      );
  }

  const rows = [
    [
      'Everyday Backpack',
      'everyday-backpack',
      'Durable 24L backpack for commuting.',
      8999,
      42,
    ],
    [
      'Noise Canceling Headphones',
      'noise-canceling-headphones',
      'Wireless headphones with long battery life.',
      19999,
      20,
    ],
    [
      'Mechanical Keyboard',
      'mechanical-keyboard',
      'Hot-swappable keyboard for focused work.',
      12999,
      30,
    ],
  ] as const;

  for (const [name, slug, description, priceCents, stock] of rows) {
    if (!(await products.findOneBy({ slug })))
      await products.save(
        products.create({
          name,
          slug,
          description,
          priceCents,
          stock,
          imageUrl: `https://picsum.phots/seed/${slug}/900/700`,
        }),
      );
  }
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
