'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface AccountsSearchFilterProps {
  activeFilter: string;
  filters: string[];
  onFilterChange?: (filter: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * AccountsSearchFilter Component
 * Displays search bar and filter tabs (All/Active/Archived or Active/Inactive).
 */
export function AccountsSearchFilter({
  activeFilter,
  filters,
  onFilterChange,
  searchValue = '',
  onSearchChange,
}: AccountsSearchFilterProps) {
  return (
    <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      {/* Search Bar */}
      <div className="w-full sm:w-80 h-12 px-4 bg-neutral-50 rounded-2xl flex items-center gap-3">
        <Search className="w-5 h-5 text-stone-300 shrink-0" />
        <input
          type="text"
          placeholder="Search here"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="flex-1 bg-transparent text-stone-900 text-sm font-medium leading-6 placeholder:text-stone-300 outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="p-0.5 bg-neutral-50 rounded-lg border-0 shadow-sm flex items-center gap-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange?.(filter)}
            className={`px-3 py-1.5 rounded text-xs font-medium leading-4 transition-all cursor-pointer ${
              filter === activeFilter
                ? 'bg-white shadow-sm text-stone-900'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}

