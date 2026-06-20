import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  percentage: string;
  comparisonText: string;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * StatCard Component
 * Displays a single statistics card with label, value, percentage change, and comparison text.
 * Fully responsive from 320px.
 */
export function StatCard({ label, value, percentage, comparisonText, trend }: StatCardProps) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div className="w-full px-4 py-3 bg-white rounded-xl border border-zinc-100 flex flex-col justify-center gap-4 cursor-default select-none shadow-sm">
      {/* Label & Value */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[#A0A0A0] text-sm font-medium">{label}</div>
        <div className="text-[#202020] text-3xl font-semibold tracking-tight">{value}</div>
      </div>

      {/* Percentage Badge + Comparison Text */}
      <div className="flex items-center gap-3 flex-wrap mt-1">
        {isUp && (
          <div className="px-2.5 py-1 bg-[#E8F8EE] rounded-full flex items-center gap-1">
            <span className="text-[#28A745] text-xs font-semibold">↑ {percentage}</span>
          </div>
        )}
        {isDown && (
          <div className="px-2.5 py-1 bg-rose-50 rounded-full flex items-center gap-1">
            <span className="text-rose-500 text-xs font-semibold">↓ {percentage}</span>
          </div>
        )}
        {!isUp && !isDown && (
          <div className="px-2.5 py-1 bg-zinc-100 rounded-full flex items-center gap-1">
            <span className="text-zinc-500 text-xs font-medium">{percentage}</span>
          </div>
        )}
        <span className="text-[#A0A0A0] text-xs font-medium">{comparisonText}</span>
      </div>
    </div>
  );
}
