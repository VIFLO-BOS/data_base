'use client';

/**
 * Dashboard Layout
 * Shared dashboard shell with:
 * - Desktop sidebar navigation
 * - Mobile drawer navigation
 * - Top header bar
 * - Role-based menu items
 * - Protected route wrapper
 */
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const allowedRoles = pathname.startsWith('/admin/')
    ? ['admin', 'super_admin']
    : pathname.startsWith('/client/')
      ? ['client']
      : pathname.startsWith('/tasker/')
        ? ['tasker']
        : [];

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
