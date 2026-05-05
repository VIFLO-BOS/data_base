import React from 'react';

interface TaskersEmptyStateProps {
  onAddClick: () => void;
}

/**
 * TaskersEmptyState Component
 * Shown when there are no taskers added yet.
 */
export function TaskersEmptyState({ onAddClick }: TaskersEmptyStateProps) {
  return (
    <div className="w-[1044px] h-[458px] p-12 bg-white rounded-2xl border-0 shadow-sm flex flex-col justify-center items-center gap-6">
      <div className="flex flex-col justify-start items-center gap-2">
        <h2 className="text-center text-stone-900 text-2xl font-medium leading-8">
          There are no taskers added yet
        </h2>
        <p className="text-center text-zinc-500 text-sm font-medium leading-6">
          Add a tasker to view Accounts
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg flex justify-center items-center"
      >
        <span className="text-white text-base font-medium leading-6">
          Add tasker
        </span>
      </button>
    </div>
  );
}

