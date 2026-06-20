'use client';

import { usePathname } from 'next/navigation';
import { NavItem } from './nav-item';
import { LogoutButton } from './logout-button';
import { LayoutDashboard, Briefcase, Users, UserCheck, Clock, FileText, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Project', href: '/admin/projects', icon: Briefcase },
  { label: 'Accounts', href: '/admin/accounts', icon: Users },
  { label: 'Taskers', href: '/admin/taskers', icon: UserCheck },
  { label: 'Timesheet', href: '/admin/timesheets', icon: Clock },
];

const clientNavItems = [
  { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', href: '/client/projects', icon: Briefcase },
  { label: 'Invoices', href: '/client/invoices', icon: FileText },
];

const taskerNavItems = [
  { label: 'Dashboard', href: '/tasker/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', href: '/tasker/tasks', icon: CheckSquare },
  { label: 'My Timesheets', href: '/tasker/timesheets', icon: Clock },
];

/**
 * Sidebar Component
 * Main navigation sidebar — hidden on mobile, visible on lg+ screens.
 * Active state is determined automatically from the current route.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const primaryRole = user?.roles?.[0] || 'admin';
  let currentNavItems = adminNavItems;

  if (primaryRole === 'client') {
    currentNavItems = clientNavItems;
  } else if (primaryRole === 'tasker') {
    currentNavItems = taskerNavItems;
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-zinc-100 hidden lg:flex flex-col justify-start items-start shrink-0">
      {/* Logo */}
      <div className="self-stretch h-20 px-4 py-2.5 bg-white border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center gap-3 shrink-0">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl inline-flex flex-col justify-center items-center gap-2 shrink-0 shadow-md shadow-indigo-500/20">
          <div className="text-white text-2xl font-bold tracking-tight">P</div>
        </div>
        <div className="flex flex-col">
          <div className="text-stone-900 text-lg font-semibold tracking-[-0.02em] leading-5">
            Paylio
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="self-stretch px-4 pt-8 pb-2">
      </div>

      {/* Nav Items */}
      <div className="self-stretch flex-1 px-4 flex flex-col justify-between items-start overflow-y-auto">
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          {currentNavItems.map((item) => {
            const isActive = pathname?.includes(item.href) ?? false;
            return (
              <NavItem
                key={item.href}
                label={item.label}
                href={item.href}
                isActive={isActive}
                icon={
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-zinc-500 group-hover:text-stone-900'}`}
                  />
                }
              />
            );
          })}
        </div>

        {/* Logout */}
        <div className="self-stretch py-6 flex flex-col justify-start items-start gap-4">
          <div className="self-stretch h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
