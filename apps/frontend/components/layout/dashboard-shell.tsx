'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileDrawer } from './mobile-drawer';

function getTitleFromPath(path: string) {
  if (path.includes('/dashboard')) return 'Dashboard';
  if (path.includes('/timesheets')) return 'Timeline';
  if (path.includes('/accounts')) return 'Accounts';
  if (path.includes('/taskers')) return 'Taskers';
  if (path.includes('/projects')) return 'Projects';
  if (path.includes('/settings')) return 'Settings';
  return 'Dashboard'; // Fallback
}

/**
 * DashboardShell Component
 * Global dashboard shell that provides the Sidebar, TopBar, MobileDrawer,
 * and responsive layout structure.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname || '');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex w-full h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop Sidebar — fixed height, never scrolls */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Bar — fixed at top, never scrolls */}
        <TopBar title={title} onMenuClick={() => setDrawerOpen(true)} />

        {/* Scrollable content area — only this scrolls */}
        <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
