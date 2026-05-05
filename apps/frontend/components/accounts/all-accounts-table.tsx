'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';

interface AccountRowData {
  name: string;
  assignedTasker: string;
  totalHours: number;
  isArchived?: boolean;
}

interface AllAccountsTableProps {
  accounts: AccountRowData[];
  totalCount: number;
  filterLabel: string;
  projectFilter: string;
  activeTab: string;
  onView?: (account: AccountRowData) => void;
  onEdit?: (account: AccountRowData) => void;
  onArchive?: (account: AccountRowData) => void;
  onUnarchive?: (account: AccountRowData) => void;
}

/**
 * AllAccountsTable Component
 * Full accounts data table with project filter dropdown, rows with contextual 3-dot menus.
 */
export function AllAccountsTable({
  accounts,
  totalCount,
  filterLabel,
  projectFilter,
  activeTab,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
}: AllAccountsTableProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuIndex(null);
      }
    }
    if (openMenuIndex !== null) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuIndex]);

  function getMenuItems(account: AccountRowData) {
    if (activeTab === 'All') {
      if (account.isArchived) {
        return [
          { label: 'View', action: () => onView?.(account) },
          { label: 'Edit', action: () => onEdit?.(account) },
          { label: 'Unarchive', action: () => onUnarchive?.(account) },
        ];
      }
      return [
        { label: 'View', action: () => onView?.(account) },
        { label: 'Edit', action: () => onEdit?.(account) },
        { label: 'Archive', action: () => onArchive?.(account) },
      ];
    }
    if (activeTab === 'Active') {
      return [
        { label: 'View', action: () => onView?.(account) },
        { label: 'Edit', action: () => onEdit?.(account) },
      ];
    }
    // Archived tab
    return [
      { label: 'View', action: () => onView?.(account) },
      { label: 'Edit', action: () => onEdit?.(account) },
      { label: 'Unarchive', action: () => onUnarchive?.(account) },
    ];
  }

  return (
    <div className="self-stretch flex flex-col gap-6">
      {/* Table Header with filter */}
      <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-stone-900 text-base font-medium leading-6">
            {filterLabel}
          </span>
          <div className="h-6 px-2 py-1 bg-gray-100 rounded-md flex justify-center items-center">
            <span className="text-stone-900 text-xs font-medium leading-4">
              {totalCount}
            </span>
          </div>
        </div>
        <div className="w-60 p-3 rounded-xl border-0 shadow-sm flex justify-between items-center cursor-pointer hover:bg-zinc-50 transition-colors">
          <span className="flex-1 text-stone-900 text-sm font-medium leading-6">
            {projectFilter}
          </span>
          <ChevronDown className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      {/* Table Content */}
      <div className="self-stretch flex flex-col gap-0">
        {/* Column Headers */}
        <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center">
          <div className="flex-1 text-zinc-500 text-sm font-medium leading-6">
            Account Name
          </div>
          <div className="flex-1 text-zinc-500 text-sm font-medium leading-6 hidden sm:block">
            Assigned Tasker
          </div>
          <div className="flex-1 text-zinc-500 text-sm font-medium leading-6 hidden sm:block">
            Total Hours
          </div>
          <div className="w-8" />
        </div>

        {/* Account Rows */}
        {accounts.map((account, index) => (
          <div
            key={index}
            className="self-stretch py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center"
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-900 text-sm font-medium leading-6">
                {account.name}
              </span>
              {account.isArchived && activeTab === 'All' && (
                <span className="px-3 py-0.5 bg-indigo-600/10 rounded-lg text-indigo-600 text-xs font-medium leading-5">
                  Archived
                </span>
              )}
            </div>
            <div className="flex-1 text-stone-900 text-sm font-medium leading-6 hidden sm:block">
              {account.assignedTasker}
            </div>
            <div className="flex-1 text-stone-900 text-sm font-medium leading-6 hidden sm:block">
              {account.totalHours}
            </div>

            {/* 3-dot Menu */}
            <div className="relative w-8 flex justify-center" ref={openMenuIndex === index ? menuRef : undefined}>
              <button
                onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-5 h-5 text-stone-700" />
              </button>
              {openMenuIndex === index && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 shadow-sm py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {getMenuItems(account).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setOpenMenuIndex(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

