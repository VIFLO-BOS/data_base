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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
