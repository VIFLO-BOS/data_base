export type Resource =
  | 'users'
  | 'projects'
  | 'taskers'
  | 'timesheets'
  | 'reports'
  | 'audit_logs'
  | 'accounts'
  | 'notifications'
  | 'settings';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'export';

export interface PermissionGrant {
  resource: Resource;
  action: Action;
}
