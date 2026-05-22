'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface TimelinePeriodFilterProps {
 activePeriod: 'Day' | 'Week' | 'Month' | 'Year';
 onPeriodChange?: (period: 'Day' | 'Week' | 'Month' | 'Year') => void;
}

/**
 * TimelinePeriodFilter Component
 * Day/Week/Month/Year filter tabs + Date picker button.
 */
export function TimelinePeriodFilter({ activePeriod, onPeriodChange }: TimelinePeriodFilterProps) {
 const periods: ('Day' | 'Week' | 'Month' | 'Year')[] = ['Day', 'Week', 'Month', 'Year'];
 const [selectedDate] = useState('Select Date');

 return (
 <div className="self-stretch inline-flex justify-start items-center gap-2.5">
 {/* Period filter tabs */}
 <div className="p-0.5 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1 shadow-sm">
 {periods.map((period) => (
  <button
  key={period}
  onClick={() => onPeriodChange?.(period)}
  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
   period === activePeriod
   ? 'bg-white shadow-sm ring-1 ring-zinc-200 text-stone-900'
   : 'hover:bg-zinc-200/50 text-zinc-500'
  }`}
  >
  {period}
  </button>
 ))}
 </div>

 {/* Date picker button */}
 <button className="px-3 py-1.5 rounded-lg bg-white border-0 shadow-sm ring-1 ring-zinc-200 flex items-center gap-2 hover:bg-zinc-50 transition-colors cursor-pointer">
 <Calendar className="w-4 h-4 text-zinc-500" />
 <span className="text-sm font-medium text-stone-700">{selectedDate}</span>
 <ChevronDown className="w-4 h-4 text-zinc-400" />
 </button>
 </div>
 );
}
