'use client';

import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}

/**
 * NavItem Component
 * Sidebar/drawer navigation item with active state styling.
 * Uses Next.js Link for client-side navigation.
 */
export function NavItem({ label, href, isActive, icon, onClick }: NavItemProps) {
  return (
    <Link
      href={href as any}
      onClick={onClick}
      className={`group w-full px-4 py-3 rounded-lg inline-flex justify-start items-center gap-3 cursor-pointer transition-all duration-200 no-underline relative overflow-hidden ${
        isActive ? 'bg-indigo-600/10 shadow-sm' : 'hover:bg-neutral-100/80'
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-600 rounded-r-full" />
      )}

      <div
        className={`w-5 h-5 shrink-0 flex items-center justify-center transition-transform duration-200 ${
          isActive ? '' : 'group-hover:scale-110'
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-base font-medium leading-6 tracking-[-0.01em] ${
          isActive ? 'text-indigo-600 font-semibold' : 'text-stone-900 group-hover:text-stone-700'
        }`}
      >
        {label}
      </div>
    </Link>
  );
}
