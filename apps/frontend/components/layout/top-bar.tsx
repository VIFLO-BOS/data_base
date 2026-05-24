'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

import { NotificationDropdown } from './notification-dropdown';

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
 * Mobile: "D" logo (left) + hamburger menu icon (right).
 */
export function TopBar({
  title,
  onMenuClick,
}: Omit<TopBarProps, 'userName' | 'userEmail' | 'avatarSrc'>) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const emailPrefix = user?.email ? user.email.split('@')[0] : 'Admin';
  const capitalizedPrefix = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  const userName = fullName || capitalizedPrefix;
  const userEmail = user?.email || '';
  const avatarSrc = user?.profileImage || undefined;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <header className="relative z-50 self-stretch h-16 lg:h-20 px-4 lg:px-6 py-2.5 bg-white/95 backdrop-blur-sm border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center shrink-0">
      {/* Mobile: Logo | Desktop: Title */}
      <div className="flex items-center gap-2.5">
        {/* Mobile logo */}
        <div className="lg:hidden w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl inline-flex flex-col justify-center items-center shrink-0 shadow-sm shadow-indigo-500/20">
          <div className="text-white text-xl font-bold">D</div>
        </div>

        {/* Desktop title */}
        <div className="hidden lg:block text-stone-900 text-2xl font-semibold tracking-[-0.02em]">
          {title}
        </div>
      </div>

      {/* Mobile: Hamburger | Desktop: User profile */}
      <div className="flex items-center gap-2">
        {/* Notification bell (desktop) */}
        <NotificationDropdown />

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
            className={`flex justify-start items-center gap-2.5 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
              profileOpen ? 'bg-zinc-50' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="relative">
              {avatarSrc ? (
                <img
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-100 ring-offset-1 ring-offset-white object-cover"
                  src={avatarSrc}
                  alt={userName}
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    if (e.target && (e.target as HTMLImageElement).nextElementSibling) {
                      ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="w-9 h-9 rounded-full ring-2 ring-indigo-100 ring-offset-1 ring-offset-white bg-indigo-50 text-indigo-600 font-semibold text-sm flex items-center justify-center uppercase"
                style={{ display: avatarSrc ? 'none' : 'flex' }}
              >
                {userName ? userName.charAt(0) : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="flex justify-start items-center gap-1.5">
              <div className="inline-flex flex-col justify-center items-start">
                <div className="text-stone-900 text-sm font-semibold leading-5">{userName}</div>
                <div className="text-zinc-400 text-xs font-medium leading-4">{userEmail}</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-zinc-200/60 py-1.5 z-50"
              style={{ animation: 'dropdownIn 0.2s ease-out' }}
            >
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/admin/profile');
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left group"
              >
                <User className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-stone-700 text-sm font-medium group-hover:text-stone-900">
                  Profile
                </span>
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/admin/settings');
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left group"
              >
                <Settings className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-stone-700 text-sm font-medium group-hover:text-stone-900">
                  Settings
                </span>
              </button>
              <div className="mx-3 my-1.5 h-px bg-zinc-100" />
              <button
                onClick={() => {
                  setProfileOpen(false);
                  useAuthStore.getState().signOut();
                  router.push('/login');
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-rose-50 transition-colors text-left group"
              >
                <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                <span className="text-stone-700 text-sm font-medium group-hover:text-rose-600">
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
