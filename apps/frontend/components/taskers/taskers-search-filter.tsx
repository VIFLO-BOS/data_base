import React from 'react';
import { Search } from 'lucide-react';

interface TaskersSearchFilterProps {
  activeFilter: string;
  filters: string[];
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
}

/**
 * TaskersSearchFilter Component
 * Search bar + filter tabs (Assigned/Unassigned or All/Active/Inactive).
 */
export function TaskersSearchFilter({
  activeFilter,
  filters,
  onFilterChange,
  onSearchChange,
}: TaskersSearchFilterProps) {
  return (
    <div className="self-stretch flex justify-between items-center">
      <div className="w-80 h-11 px-4 bg-neutral-50 rounded-xl flex justify-start items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search here"
          className="flex-1 bg-transparent text-stone-900 text-sm font-medium leading-5 outline-none placeholder:text-stone-400"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="p-1 bg-neutral-50 rounded-lg shadow-sm border-0 flex justify-center items-center gap-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-md transition-all ${
              filter === activeFilter
                ? 'bg-white shadow-sm text-stone-900'
                : 'text-stone-500 hover:text-stone-700 hover:bg-zinc-100/50'
            }`}
          >
            <span className="text-sm font-medium leading-5">
              {filter}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

