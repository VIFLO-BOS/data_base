/**
 * Roles Decorator
 * Attaches required roles to route handlers.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '@annotator-platform/shared-rbac';

export const ROLES_KEY = 'roles';

/*
 * Attaches required roles to route handlers.
 * Usage: @Roles('admin', 'editor') on any controller method
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
