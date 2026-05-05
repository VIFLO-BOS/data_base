/**
 * Roles Decorator
 * Attaches required roles to route handlers.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '@annotator/shared-rbac';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
