export type DashboardPath = '/admin/dashboard' | '/client/dashboard' | '/tasker/dashboard';

export function getDashboardPath(roles: string[] | undefined): DashboardPath | null {
  if (!roles?.length) return null;
  if (roles.includes('super_admin') || roles.includes('admin')) return '/admin/dashboard';
  if (roles.includes('client')) return '/client/dashboard';
  if (roles.includes('tasker')) return '/tasker/dashboard';
  return null;
}
