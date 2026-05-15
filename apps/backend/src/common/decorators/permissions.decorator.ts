/**
 * Permissions Decorator
 * Attaches required permissions to route handlers.
 */
import { SetMetadata } from '@nestjs/common';
import { Permission } from '@annotator-platform/shared-rbac';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
