'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
}

/**
 * Pagination Component
 * Reusable pagination with page numbers and showing count.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="self-stretch flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-md border-0 shadow-sm ring-1 ring-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-stone-900" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, idx) =>
          typeof page === 'string' ? (
            <div
              key={`dots-${idx}`}
              className="w-8 h-8 rounded-md border-0 shadow-sm ring-1 ring-zinc-200 bg-white flex items-center justify-center"
            >
              <span className="text-zinc-500 text-sm font-medium">…</span>
            </div>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                page === currentPage
                  ? 'bg-indigo-600/10 border-indigo-600 text-indigo-600'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-md border-0 shadow-sm ring-1 ring-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-stone-900" />
        </button>
      </div>
      <div className="text-stone-900 text-sm font-medium leading-6">
        Showing 1 - {itemsPerPage} of {totalItems}
      </div>
    </div>
  );
}

