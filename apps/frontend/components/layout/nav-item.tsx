"use client";

import React from"react";
import Link from"next/link";

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
 className={`w-full px-4 py-3 rounded-lg inline-flex justify-start items-center gap-3 cursor-pointer transition-colors duration-150 no-underline ${
 isActive
 ?"bg-indigo-600/10"
 :"hover:bg-neutral-50"
 }`}
 >
 <div className="w-5 h-5 shrink-0 flex items-center justify-center">
 {icon}
 </div>
 <div
 className={`text-base font-medium leading-6 ${
 isActive ?"text-indigo-600 font-medium" :"text-stone-900"
 }`}
 >
 {label}
 </div>
 </Link>
 );
}

