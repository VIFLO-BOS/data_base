/**
 * TypeORM Data Source
 * Used for CLI migrations and seeding.
 */
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../modules/*/entities/*.entity.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
