const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error('Set TEST_DATABASE_URL to an isolated local PostgreSQL database ending in _test');
const parsed = new URL(url);
if (!['localhost', '127.0.0.1', 'postgres'].includes(parsed.hostname) || !parsed.pathname.endsWith('_test')) throw new Error('Integration tests require an isolated local _test database');
Object.assign(process.env, {
  NODE_ENV: 'test', DATABASE_URL: url, DATABASE_MIGRATION_URL: url, DATABASE_SSL: 'false',
  JWT_SECRET: 'integration_test_secret_32_chars_minimum_only', JWT_ACCESS_EXPIRATION: '15m', JWT_REFRESH_EXPIRATION: '7d',
  FRONTEND_URL: 'http://localhost:3000', SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-anon-key',
  VERCEL: '0',
});
