export function isHosted(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === 'production' || env.VERCEL === '1';
}

export function origin(value: string | undefined, name: string, hosted = isHosted()): string {
  if (!value) throw new Error(name + ' is required');
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(name + ' must be an origin'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value || url.username || url.password ||
      (hosted && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error(name + ' must be an HTTPS origin without a path or trailing slash');
  }
  return value;
}

export function positiveInt(value: string | undefined, fallback: number, name: string, max = 65535) {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) throw new Error(name + ' must be a valid positive integer');
  return number;
}

export function validateEnvironment(env: Record<string, string>) {
  const hosted = isHosted(env);
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || /default|change[-_ ]?me|placeholder|replace_with/i.test(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET must contain at least 32 random characters');
  }
  for (const name of ['JWT_ACCESS_EXPIRATION', 'JWT_REFRESH_EXPIRATION']) {
    if (env[name] && !/^[1-9]\d*(s|m|h|d)$/.test(env[name])) throw new Error(name + ' must be a duration such as 15m or 7d');
  }
  origin(env.FRONTEND_URL || (hosted ? undefined : 'http://localhost:3000'), 'FRONTEND_URL', hosted);
  for (const item of (env.CORS_ORIGINS || '').split(',').filter(Boolean)) origin(item.trim(), 'CORS_ORIGINS', hosted);
  if (hosted) {
    for (const name of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']) {
      if (!env[name] || /placeholder|your-/i.test(env[name])) throw new Error(name + ' is required for production');
    }
    origin(env.SUPABASE_URL, 'SUPABASE_URL', true);
    if (env.DATABASE_SSL === 'false') throw new Error('Hosted database connections require verified TLS');
    if (env.VERCEL_ENV === 'preview' && env.DATABASE_ENV !== 'preview') {
      throw new Error('Preview deployments require DATABASE_ENV=preview and a separate preview database');
    }
  }
  positiveInt(env.SMTP_PORT, 587, 'SMTP_PORT');
  return env;
}
