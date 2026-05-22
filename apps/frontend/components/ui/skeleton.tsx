import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton Component
 * Shimmer loading placeholder. Use for data-driven content.
 * Uses the .skeleton class defined in globals.css.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

/**
 * StatCardSkeleton
 * Loading placeholder for a StatCard.
 */
export function StatCardSkeleton() {
  return (
    <div className="w-full px-5 py-5 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex flex-col justify-center gap-3">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

/**
 * TableRowSkeleton
 * Loading placeholder for a table row.
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * PageSkeleton
 * Full page loading skeleton with header and content areas.
 */
export function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Chart placeholder */}
      <Skeleton className="w-full h-48 rounded-2xl" />
    </div>
  );
}
