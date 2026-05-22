"use client";

import React, { useState } from "react";
import { Bell, Check, Trash2, MailOpen, Mail } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'New Tasker Registered', message: 'John Doe has registered and is pending approval.', time: '2 mins ago', isRead: false, type: 'info' },
  { id: '2', title: 'Project "Alpha" Completed', message: 'All tasks for Project Alpha have been marked as complete.', time: '1 hour ago', isRead: false, type: 'success' },
  { id: '3', title: 'Timesheet Discrepancy', message: 'System detected a 5-hour discrepancy in Jane Smith\'s timesheet.', time: '3 hours ago', isRead: true, type: 'warning' },
  { id: '4', title: 'Payment Failed', message: 'Failed to process payout for Tasker ID #4092.', time: '1 day ago', isRead: true, type: 'error' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  Notifications
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  You have {unreadCount} unread messages
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-medium rounded-lg transition-colors border border-stone-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="w-full flex flex-col gap-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-sm">
                No notifications found.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                    notif.isRead ? 'bg-white border-stone-100' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
                  }`}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-indigo-500'}`} />
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-stone-700' : 'text-stone-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs font-medium text-stone-400">{notif.time}</span>
                    </div>
                    <p className={`text-sm ${notif.isRead ? 'text-stone-500' : 'text-stone-700'}`}>
                      {notif.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleReadStatus(notif.id)}
                      className="p-1.5 hover:bg-stone-100 rounded-md text-stone-400 hover:text-indigo-600 transition-colors"
                      title={notif.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {notif.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-stone-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
