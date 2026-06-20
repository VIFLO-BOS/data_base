"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, Briefcase, Users, UserCheck, Clock } from "lucide-react";
import { NavItem } from "./nav-item";
import { LogoutButton } from "./logout-button";

const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Project", href: "/admin/projects", icon: Briefcase },
    { label: "Accounts", href: "/admin/accounts", icon: Users },
    { label: "Taskers", href: "/admin/taskers", icon: UserCheck },
    { label: "Timesheet", href: "/admin/timesheets", icon: Clock },
];

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * MobileDrawer Component
 * Slide-in overlay drawer from the left for mobile navigation.
 * Contains the same navigation items as the desktop Sidebar.
 */
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const pathname = usePathname();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="h-16 px-4 py-2.5 bg-white border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl inline-flex flex-col justify-center items-center shrink-0 shadow-sm shadow-indigo-500/20">
                            <div className="text-white text-xl font-bold">
                                P
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-stone-900 text-lg font-semibold tracking-[-0.02em] leading-5">
                                Paylio
                            </div>
                            <div className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase leading-4">
                                Platform
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-stone-900" />
                    </button>
                </div>

                {/* Nav section label */}
                <div className="px-4 pt-6 pb-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.12em]">Navigation</span>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-4 flex flex-col justify-between overflow-y-auto">
                    <div className="flex flex-col gap-1">
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
                                            className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-zinc-500"}`}
                                        />
                                    }
                                    onClick={onClose}
                                />
                            );
                        })}
                    </div>

                    {/* Logout */}
                    <div className="py-6 flex flex-col gap-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </>
    );
}
