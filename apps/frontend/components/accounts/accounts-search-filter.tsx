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
 * Supabase-style search bar + filter tabs.
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
      <div className="w-full sm:w-80 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-white text-sm text-stone-900 rounded-lg border border-zinc-300 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 outline-none transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="p-0.5 bg-zinc-100 rounded-lg flex items-center gap-0.5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange?.(filter)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              filter === activeFilter
                ? 'bg-white shadow-sm text-stone-900'
                : 'text-zinc-500 hover:text-stone-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
