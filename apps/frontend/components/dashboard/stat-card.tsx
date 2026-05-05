import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
    <div className="w-full px-4 py-4 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex flex-col justify-center gap-3">
      {/* Label & Value */}
      <div className="flex flex-col gap-1">
        <div className="text-zinc-500 text-sm font-medium leading-5">{label}</div>
        <div className="text-stone-900 text-2xl font-medium leading-8">{value}</div>
      </div>

      {/* Percentage Badge + Comparison Text */}
      <div className="flex items-center gap-3 flex-wrap">
        {isUp && (
          <div className="px-2.5 py-1.5 bg-green-600/10 rounded-full flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-600 text-sm font-medium leading-5">{percentage}</span>
          </div>
        )}
        {isDown && (
          <div className="px-2.5 py-1.5 bg-red-600/10 rounded-full flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            <span className="text-red-600 text-sm font-medium leading-5">{percentage}</span>
          </div>
        )}
        {!isUp && !isDown && (
          <div className="px-2.5 py-1.5 bg-black/5 rounded-full flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-600 text-sm font-medium leading-5">{percentage}</span>
          </div>
        )}
        <span className="text-zinc-500 text-xs font-medium leading-4">{comparisonText}</span>
      </div>
    </div>
  );
}

