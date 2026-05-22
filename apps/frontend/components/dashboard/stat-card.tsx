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
    <div className="group w-full px-5 py-5 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex flex-col justify-center gap-3 cursor-default select-none">
      {/* Label & Value */}
      <div className="flex flex-col gap-1.5">
        <div className="text-zinc-500 text-sm font-medium leading-5 tracking-wide uppercase">{label}</div>
        <div className="text-stone-900 text-[28px] font-semibold leading-8 tracking-tight tabular-nums">{value}</div>
      </div>

      {/* Percentage Badge + Comparison Text */}
      <div className="flex items-center gap-3 flex-wrap">
        {isUp && (
          <div className="px-2.5 py-1.5 bg-emerald-500/10 rounded-full flex items-center gap-1.5 ring-1 ring-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 text-sm font-semibold leading-5">{percentage}</span>
          </div>
        )}
        {isDown && (
          <div className="px-2.5 py-1.5 bg-rose-500/10 rounded-full flex items-center gap-1.5 ring-1 ring-rose-500/20">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-rose-600 text-sm font-semibold leading-5">{percentage}</span>
          </div>
        )}
        {!isUp && !isDown && (
          <div className="px-2.5 py-1.5 bg-zinc-500/10 rounded-full flex items-center gap-1.5 ring-1 ring-zinc-500/20">
            <Minus className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-600 text-sm font-semibold leading-5">{percentage}</span>
          </div>
        )}
        <span className="text-zinc-400 text-xs font-medium leading-4">{comparisonText}</span>
      </div>
    </div>
  );
}
