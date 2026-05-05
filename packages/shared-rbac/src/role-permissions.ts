import { Role } from './roles';
import { Permission } from './permissions';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['*'], // All permissions
  admin: [
    'users:read', 'users:create', 'users:update',
    'projects:read', 'projects:create', 'projects:update', 'projects:delete',
    'taskers:read', 'taskers:create', 'taskers:update', 'taskers:delete',
    'timesheets:read', 'timesheets:create', 'timesheets:update', 'timesheets:approve',
    'reports:read', 'reports:export',
    'audit_logs:read',
  ],
  client: [
    'projects:read',
    'reports:read',
    'timesheets:read',
  ],
  tasker: [
    'projects:read',
    'timesheets:read', 'timesheets:create', 'timesheets:update',
  ],
};

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(required);
}
