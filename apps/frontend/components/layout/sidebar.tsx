"use client";

import { usePathname } from"next/navigation";
import { NavItem } from"./nav-item";
import { LogoutButton } from"./logout-button";
import { LayoutDashboard, Briefcase, Users, UserCheck, Clock } from"lucide-react";

const navItems = [
 { label:"Dashboard", href:"/admin/dashboard", icon: LayoutDashboard },
 { label:"Project", href:"/admin/projects", icon: Briefcase },
 { label:"Accounts", href:"/admin/accounts", icon: Users },
 { label:"Taskers", href:"/admin/taskers", icon: UserCheck },
 { label:"Timesheet", href:"/admin/timesheets", icon: Clock },
];

/**
 * Sidebar Component
 * Main navigation sidebar — hidden on mobile, visible on lg+ screens.
 * Active state is determined automatically from the current route.
 */
export function Sidebar() {
 const pathname = usePathname();

 return (
 <aside className="w-60 h-screen bg-white border-r border-zinc-100 hidden lg:flex flex-col justify-start items-start shrink-0">
 {/* Logo */}
 <div className="self-stretch h-20 px-4 py-2.5 bg-white border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center gap-2.5 shrink-0">
 <div className="w-12 h-12 bg-indigo-600 rounded-xl inline-flex flex-col justify-center items-center gap-2 shrink-0">
 <div className="text-white text-3xl font-medium">
 D
 </div>
 </div>
 <div className="justify-start text-stone-900 text-xl font-medium">
 Database
 </div>
 </div>

 {/* Nav Items */}
 <div className="self-stretch flex-1 px-4 pt-8 flex flex-col justify-between items-start overflow-y-auto">
 <div className="self-stretch flex flex-col justify-start items-start gap-2">
 {navItems.map((item) => {
 const isActive = pathname?.includes(item.href) ?? false;
 return (
 <NavItem
 key={item.href}
 label={item.label}
 href={item.href}
 isActive={isActive}
 icon={
 <item.icon
 className={`w-5 h-5 ${isActive ?"text-indigo-600" :"text-stone-900"}`}
 />
 }
 />
 );
 })}
 </div>

 {/* Logout */}
 <div className="self-stretch py-6 flex flex-col justify-start items-start gap-4">
 <div className="self-stretch h-px bg-stone-900/20" />
 <LogoutButton />
 </div>
 </div>
 </aside>
 );
}

