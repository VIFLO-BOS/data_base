"use client";

import React, { useState, useRef, useEffect } from"react";
import { ChevronDown, Menu, User, Settings, LogOut } from"lucide-react";
import { useRouter } from"next/navigation";

interface TopBarProps {
 title: string;
 userName?: string;
 userEmail?: string;
 avatarSrc?: string;
 onMenuClick?: () => void;
}

/**
 * TopBar Component
 * Desktop: page title (left) + user profile with dropdown (right).
 * Mobile:"D" logo (left) + hamburger menu icon (right).
 */
export function TopBar({
 title,
 userName ="Amanda pauline",
 userEmail ="amanda122@gmail.com",
 avatarSrc ="https://placehold.co/36x36",
 onMenuClick,
}: TopBarProps) {
 const [profileOpen, setProfileOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const router = useRouter();

 // Close dropdown when clicking outside
 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
 setProfileOpen(false);
 }
 }
 if (profileOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [profileOpen]);

 return (
 <header className="self-stretch h-16 lg:h-20 px-4 lg:px-6 py-2.5 bg-white border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center shrink-0">
 {/* Mobile: Logo | Desktop: Title */}
 <div className="flex items-center gap-2.5">
 {/* Mobile logo */}
 <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl inline-flex flex-col justify-center items-center shrink-0">
 <div className="text-white text-xl font-medium">
 D
 </div>
 </div>

 {/* Desktop title */}
 <div className="hidden lg:block text-stone-900 text-2xl font-medium">
 {title}
 </div>
 </div>

 {/* Mobile: Hamburger | Desktop: User profile */}
 <div className="flex items-center">
 {/* Mobile hamburger */}
 <button
 onClick={onMenuClick}
 className="lg:hidden p-2 rounded-lg hover:bg-neutral-50 transition-colors"
 aria-label="Open menu"
 >
 <Menu className="w-6 h-6 text-stone-900" />
 </button>

 {/* Desktop user profile with dropdown */}
 <div className="hidden lg:block relative" ref={dropdownRef}>
 <button
 onClick={() => setProfileOpen(!profileOpen)}
 className="flex justify-start items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
 >
 <img
 className="w-9 h-9 rounded-full border-2 border-indigo-100"
 src={avatarSrc}
 alt={userName}
 />
 <div className="flex justify-start items-center gap-1">
 <div className="inline-flex flex-col justify-center items-start">
 <div className="text-stone-900 text-base font-medium leading-6">
 {userName}
 </div>
 <div className="text-zinc-500 text-xs font-medium leading-4">
 {userEmail}
 </div>
 </div>
 <ChevronDown
 className={`w-5 h-5 text-neutral-700 transition-transform duration-200 ${
 profileOpen ?"rotate-180" :""
 }`}
 />
 </div>
 </button>

 {/* Dropdown Menu */}
 {profileOpen && (
 <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border-0 shadow-sm py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
 <button
 onClick={() => {
 setProfileOpen(false);
 router.push("/admin/profile");
 }}
 className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
 >
 <User className="w-4 h-4 text-stone-600" />
 <span className="text-stone-900 text-sm font-medium">
 Profile
 </span>
 </button>
 <button
 onClick={() => {
 setProfileOpen(false);
 router.push("/admin/settings");
 }}
 className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
 >
 <Settings className="w-4 h-4 text-stone-600" />
 <span className="text-stone-900 text-sm font-medium">
 Settings
 </span>
 </button>
 <div className="mx-3 my-1 h-px bg-zinc-100" />
 <button
 onClick={() => {
 setProfileOpen(false);
 router.push("/login");
 }}
 className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
 >
 <LogOut className="w-4 h-4 text-red-600" />
 <span className="text-red-600 text-sm font-medium">
 Log out
 </span>
 </button>
 </div>
 )}
 </div>
 </div>
 </header>
 );
}

