import { registerAs } from '@nestjs/config';
import { isHosted, positiveInt } from './environment';

export function databaseOptions(env: NodeJS.ProcessEnv = process.env, migration = false) {
  const url = migration ? env.DATABASE_MIGRATION_URL || env.DATABASE_URL : env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const parsed = new URL(url);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('DATABASE_URL must be PostgreSQL');
  // URL SSL options can override pg's explicit TLS object; configure TLS only here.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) {
    if (parsed.searchParams.has(key)) throw new Error('Configure DATABASE_SSL/DATABASE_SSL_CA instead of URL SSL parameters');
  }
  if (isHosted(env) && env.DATABASE_SSL === 'false') throw new Error('Hosted databases require TLS');
  return {
    installExtensions: false,
    url,
    ssl: env.DATABASE_SSL === 'true' || isHosted(env)
      ? { rejectUnauthorized: false, ...(env.DATABASE_SSL_CA ? { ca: env.DATABASE_SSL_CA.replace(/\\n/g, '\n') } : {}) }
      : false as const,
    extra: {
      max: positiveInt(env.DATABASE_POOL_MAX, 3, 'DATABASE_POOL_MAX', 20),
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
      statement_timeout: 5000,
      query_timeout: 6000,
    },
  };
}
export default registerAs('database', () => databaseOptions());
