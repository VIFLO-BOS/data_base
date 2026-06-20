import React from 'react';
import { UserCheck, Plus } from 'lucide-react';

interface TaskersHeaderProps {
  count: number;
  onNewClick?: () => void;
}

/**
 * TaskersHeader Component
 * Title row with "Taskers" label, count badge, and "New" button.
 */
export function TaskersHeader({ count, onNewClick }: TaskersHeaderProps) {
  return (
    <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
      <div className="flex justify-start items-center gap-3">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-indigo-600" />
        </div>
        <h1 className="text-stone-900 text-2xl font-semibold leading-6 tracking-[-0.02em]">
          Taskers
        </h1>
        <div className="px-2.5 py-1 bg-indigo-50 rounded-full flex justify-center items-center ring-1 ring-indigo-100">
          <span className="text-indigo-600 text-xs font-semibold tabular-nums">
            {count}
          </span>
        </div>
      </div>
      <button
        onClick={onNewClick}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex justify-center items-center gap-1.5 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-600/20"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-semibold leading-5">
          New 
        </span>
      </button>
    </div>
  );
}
