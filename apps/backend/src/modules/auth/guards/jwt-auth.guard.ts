/**
 * JwtAuthGuard
 * Verifies the JWT token and loads the user from the database.
 * Distinguishes between auth failures (401) and infrastructure errors (503)
 * so that network/database outages do NOT log users out.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/modules/users/entities/user.entity';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked @public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('No token provided');

    // Step 1: Verify the JWT signature and expiration.
    // If this fails, the token is genuinely invalid → 401.
    let payload: { sub: string };
    try {
      const secret = this.config.get<string>('jwt.secret')!;
      payload = jwt.verify(token, secret) as { sub: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Step 2: Load the user from the database.
    // If the DB is unreachable, this is an infrastructure problem → 503,
    // NOT an auth failure. The frontend will keep the user logged in.
    try {
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User not found or inactive');
      }

      request.user = user;
      return true;
    } catch (err) {
      // Re-throw if it's already an UnauthorizedException (user not found)
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Any other error (DB connection, timeout, etc.) → 503
      throw new ServiceUnavailableException(
        'Database temporarily unavailable. Please try again shortly.',
      );
    }
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
