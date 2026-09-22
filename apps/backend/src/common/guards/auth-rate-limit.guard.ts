import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createHmac } from 'crypto';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private readonly db: DataSource, private readonly config: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (req.method === 'OPTIONS') return true;
    const path = req.path as string;
    const isRefresh = path === '/api/v1/auth/refresh';
    const isAuth = path.startsWith('/api/v1/auth/') && req.method === 'POST';
    const isInvitation = path.startsWith('/api/v1/admins/invite');
    if (!isAuth && !isInvitation) return true;
    const bucket = isRefresh ? 'refresh' : isInvitation ? 'invitation' : 'login';
    const limit = isRefresh ? 60 : isInvitation ? 10 : 20;
    const key = createHmac('sha256', this.config.getOrThrow<string>('jwt.secret')).update(bucket + ':' + req.ip).digest('hex');
    // PostgreSQL UPSERT is atomic and shared by every function instance.
    const [row] = await this.db.query(
      `INSERT INTO auth_rate_limits (key, hits, expires_at) VALUES ($1, 1, now() + interval '15 minutes')
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN auth_rate_limits.expires_at <= now() THEN 1 ELSE auth_rate_limits.hits + 1 END,
         expires_at = CASE WHEN auth_rate_limits.expires_at <= now() THEN now() + interval '15 minutes' ELSE auth_rate_limits.expires_at END
       RETURNING hits, expires_at`, [key],
    );
    // Bounded cleanup prevents unbounded growth without timers/background work.
    await this.db.query('DELETE FROM auth_rate_limits WHERE key IN (SELECT key FROM auth_rate_limits WHERE expires_at < now() LIMIT 100)');
    if (row.hits > limit) {
      context.switchToHttp().getResponse().setHeader('Retry-After', Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 1000)));
      throw new HttpException('Too many authentication attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
