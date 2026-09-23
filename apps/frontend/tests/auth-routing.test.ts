import { getDashboardPath } from '../lib/auth';

describe('role-based dashboard routing', () => {
  it.each([
    [['super_admin'], '/admin/dashboard'],
    [['admin'], '/admin/dashboard'],
    [['client'], '/client/dashboard'],
    [['tasker'], '/tasker/dashboard'],
  ])('routes %p to %s', (roles, expected) => {
    expect(getDashboardPath(roles)).toBe(expected);
  });

  it('fails closed for missing or unknown roles', () => {
    expect(getDashboardPath(undefined)).toBeNull();
    expect(getDashboardPath([])).toBeNull();
    expect(getDashboardPath(['unknown'])).toBeNull();
  });

  it('prioritizes administrative access when roles are mixed', () => {
    expect(getDashboardPath(['client', 'admin'])).toBe('/admin/dashboard');
  });
});
