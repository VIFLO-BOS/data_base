'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, MailOpen, Mail } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Tasker Registered',
    message: 'John Doe has registered and is pending approval.',
    time: '2 mins ago',
    isRead: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Project "Alpha" Completed',
    message: 'All tasks for Project Alpha have been marked as complete.',
    time: '1 hour ago',
    isRead: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Timesheet Discrepancy',
    message: "System detected a 5-hour discrepancy in Jane Smith's timesheet.",
    time: '3 hours ago',
    isRead: true,
    type: 'warning',
  },
  {
    id: '4',
    title: 'Payment Failed',
    message: 'Failed to process payout for Tasker ID #4092.',
    time: '1 day ago',
    isRead: true,
    type: 'error',
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex p-2 rounded-xl transition-colors relative ${isOpen ? 'bg-white-100' : 'hover:bg-purple-50'}`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-zinc-500 lg:w-5 lg:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute -right-12 sm:right-0 top-full mt-2 w-[320px] sm:w-96 bg-white rounded-xl shadow-xl ring-1 ring-zinc-200/60 flex flex-col z-50 overflow-hidden"
          style={{ animation: 'dropdownIn 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-stone-900 text-sm font-semibold tracking-tight">Notifications</h3>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded border border-amber-200 uppercase tracking-wider">Demo Data</span>
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">You have {unreadCount} unread messages</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 hover:bg-stone-200 bg-stone-100 text-stone-600 rounded-md transition-colors"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm">No notifications found.</div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-zinc-100 last:border-0 flex items-start gap-3 transition-colors ${
                      notif.isRead
                        ? 'bg-white hover:bg-zinc-50'
                        : 'bg-indigo-50/30 hover:bg-indigo-50/80'
                    }`}
                  >
                    <div
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-indigo-500'}`}
                    />

                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className={`text-sm truncate font-medium ${notif.isRead ? 'text-stone-700' : 'text-stone-900'}`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap mt-0.5">
                          {notif.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${notif.isRead ? 'text-stone-500' : 'text-stone-600'}`}
                      >
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 self-start ml-1 flex-shrink-0">
                      <button
                        onClick={() => toggleReadStatus(notif.id)}
                        className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-indigo-600 transition-colors"
                        title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notif.isRead ? (
                          <Mail className="w-3.5 h-3.5" />
                        ) : (
                          <MailOpen className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 hover:bg-red-100 rounded text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-zinc-100 bg-zinc-50/50">
            <button className="w-full py-1.5 text-xs font-semibold text-stone-600 hover:text-white hover:bg-indigo-600 rounded transition-colors">
              Clear All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
