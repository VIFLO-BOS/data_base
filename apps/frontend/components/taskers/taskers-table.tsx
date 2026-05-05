'use client';

import React, { useState } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';

interface TaskerRowData {
  tasker: string;
  account: string;
  totalHours: number;
}

interface TaskersTableProps {
  taskers: TaskerRowData[];
  totalCount: number;
  filterLabel: string;
  projectFilter?: string;
  isArchived?: boolean;
}

/**
 * TaskersTable Component
 * Data table with columns: Tasker, Account(s), Total Hours, and Actions.
 */
export function TaskersTable({
  taskers,
  totalCount,
  filterLabel,
  projectFilter,
  isArchived = false,
}: TaskersTableProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="self-stretch flex flex-col gap-4">
      {/* Table Header with filter */}
      <div className="w-full pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
        <div className="flex justify-start items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 text-base font-medium leading-6">
              {filterLabel}
            </span>
            <div className="px-3 py-1 bg-gray-100 rounded-md flex justify-center items-center">
              <span className="text-stone-900 text-xs font-medium leading-4">
                {totalCount}
              </span>
            </div>
          </div>
        </div>
        {projectFilter && (
          <button className="w-48 px-4 py-2 rounded-xl shadow-sm border-0 flex justify-between items-center hover:bg-zinc-50 transition-colors">
            <span className="text-stone-900 text-sm font-medium leading-5">
              {projectFilter}
            </span>
            <ChevronDown className="w-4 h-4 text-stone-900" />
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="w-full flex flex-col gap-0">
        {/* Column Headers */}
        <div className="w-full py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[2fr_2fr_1fr_48px] items-center gap-4">
          <div className="text-zinc-500 text-sm font-medium leading-5">Tasker</div>
          <div className="text-zinc-500 text-sm font-medium leading-5">Account(s)</div>
          <div className="text-zinc-500 text-sm font-medium leading-5">Total Hours</div>
          <div className="w-12"></div>
        </div>

        {/* Tasker Rows */}
        {taskers.map((row, index) => (
          <div
            key={index}
            className="w-full py-4 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[2fr_2fr_1fr_48px] items-center gap-4 relative group hover:bg-zinc-50 transition-colors"
          >
            <div className="text-stone-900 text-sm font-medium leading-5">
              {row.tasker}
            </div>
            <div className="text-stone-900 text-sm font-medium leading-5">
              {row.account}
            </div>
            <div className="text-stone-900 text-sm font-medium leading-5">
              {row.totalHours}
            </div>
            <div className="flex justify-end items-center relative">
              <button
                onClick={() => toggleMenu(index)}
                className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-stone-500" />
              </button>
              
              {/* Dropdown Menu */}
              {openMenuIndex === index && (
                <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border-0 shadow-sm py-2 z-10 flex flex-col">
                  <button className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors">
                    View
                  </button>
                  <button className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors">
                    {isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

