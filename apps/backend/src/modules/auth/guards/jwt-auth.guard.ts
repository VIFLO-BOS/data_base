/**
 * JwtAuthGuard
 * TODO: Implement authentication guard logic.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Placeholder
    return true;
  }
}
