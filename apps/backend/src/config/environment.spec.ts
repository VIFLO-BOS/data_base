import { validateEnvironment } from './environment';
import { databaseOptions } from './database.config';
const valid = {
  NODE_ENV: 'production', DATABASE_URL: 'postgresql://user:pass@db.example.test/app',
  JWT_SECRET: 'a-secure-test-secret-with-at-least-32-chars', FRONTEND_URL: 'https://app.example.test',
  SMTP_HOST: 'smtp.example.test', SMTP_USER: 'user', SMTP_PASS: 'pass', SMTP_FROM: 'Sender <sender@example.test>',
  SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'public-test-key',
};
describe('production configuration', () => {
  it('rejects missing secrets, unsafe origins and incomplete mail', () => {
    for (const env of [{ ...valid, JWT_SECRET: '' }, { ...valid, FRONTEND_URL: 'https://app.example.test/' }, { ...valid, SMTP_PASS: '' }]) {
      expect(() => validateEnvironment(env)).toThrow();
    }
    expect(() => validateEnvironment(valid)).not.toThrow();
  });
  it('requires preview database isolation and verified TLS', () => {
    expect(() => validateEnvironment({ ...valid, VERCEL_ENV: 'preview' })).toThrow('separate preview database');
    expect(databaseOptions(valid).ssl).toEqual({ rejectUnauthorized: true });
    expect(() => databaseOptions({ ...valid, DATABASE_SSL: 'false' })).toThrow();
    expect(() => databaseOptions({ ...valid, DATABASE_URL: valid.DATABASE_URL + '?sslmode=no-verify' })).toThrow();
  });
});
