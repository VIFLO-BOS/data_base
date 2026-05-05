'use client';

import React from 'react';

interface AccountsEmptyStateProps {
  onCreateClick?: () => void;
}

/**
 * AccountsEmptyState Component
 * Shown when there are no accounts added yet.
 */
export function AccountsEmptyState({ onCreateClick }: AccountsEmptyStateProps) {
  return (
    <div className="self-stretch flex-1 min-h-[400px] p-12 bg-white rounded-2xl flex flex-col justify-center items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-center text-stone-900 text-2xl font-medium leading-8">
          There are no Accounts added yet
        </h3>
        <p className="text-center text-zinc-500 text-sm font-medium leading-6">
          Add a Account to view Accounts
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="w-full max-w-sm px-4 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg flex justify-center items-center cursor-pointer"
      >
        <span className="text-white text-base font-medium leading-6">
          Add Account
        </span>
      </button>
    </div>
  );
}

