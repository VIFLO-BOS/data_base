/**
 * Roles Guard
 * Protects routes based on user roles.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRoleNames = user?.roles?.map((r: any) => r.name) || [];
    console.log('RolesGuard DEBUG: user.roles =', user?.roles, ' | mapped =', userRoleNames, ' | required =', requiredRoles);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
