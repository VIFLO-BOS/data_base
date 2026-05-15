/**
 * Database Configuration
 * Reada DATABASE_URL from .env and configures TypeORM
  **/

import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'annotator',
  password: process.env.DB_PASSWORD || 'annotator_dev',
  database: process.env.DB_NAME || 'annotator_platform',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));