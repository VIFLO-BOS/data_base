/**
 * LocalAuthGuard
 * TODO: Implement authentication guard logic.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Placeholder
    return true;
  }
}
