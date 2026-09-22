import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { databaseOptions } from '../config/database.config';

config({ path: resolve(__dirname, '../../.env'), quiet: true } as Parameters<typeof config>[0]);
config({ path: resolve(process.cwd(), '.env'), quiet: true } as Parameters<typeof config>[0]);

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...databaseOptions(process.env, true),
  entities: [__dirname + '/../modules/*/entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
