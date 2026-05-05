import React from 'react';
import { Plus } from 'lucide-react';

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
      <div className="flex justify-start items-center gap-2">
        <h1 className="text-stone-900 text-2xl font-medium leading-6">
          Taskers
        </h1>
        <div className="px-3 py-1 bg-gray-100 rounded-md flex justify-center items-center">
          <span className="text-stone-900 text-xs font-medium leading-4">
            {count}
          </span>
        </div>
      </div>
      <button
        onClick={onNewClick}
        className="px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-600 flex justify-center items-center gap-1.5 hover:bg-indigo-50 transition-colors"
      >
        <span className="text-indigo-600 text-sm font-medium leading-5">
          New
        </span>
        <Plus className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
      </button>
    </div>
  );
}

