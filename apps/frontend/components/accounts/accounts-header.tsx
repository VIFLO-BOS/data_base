'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface AccountsHeaderProps {
  count: number;
  onNewClick?: () => void;
}

/**
 * AccountsHeader Component
 * Displays "Accounts" title with count badge and "New +" button.
 */
export function AccountsHeader({ count, onNewClick }: AccountsHeaderProps) {
  return (
    <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h2 className="text-stone-900 text-2xl font-medium leading-6">
          Accounts
        </h2>
        <div className="h-6 px-2 py-1 bg-gray-100 rounded-md flex justify-center items-center">
          <span className="text-stone-900 text-xs font-medium leading-4">
            {count}
          </span>
        </div>
      </div>
      <button
        onClick={onNewClick}
        className="px-3 py-2 rounded-lg border border-indigo-600 flex items-center gap-1.5 hover:bg-indigo-50 transition-colors cursor-pointer"
      >
        <span className="text-indigo-600 text-xs font-medium leading-4">
          New
        </span>
        <Plus className="w-4 h-4 text-indigo-600" />
      </button>
    </div>
  );
}

