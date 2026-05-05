import React from 'react';

interface TimelinePeriodFilterProps {
 activePeriod: 'Day' | 'Week' | 'Month' | 'Year';
}

/**
 * TimelinePeriodFilter Component
 * Day/Week/Month/Year filter tabs + Date picker button.
 */
export function TimelinePeriodFilter({ activePeriod }: TimelinePeriodFilterProps) {
 const periods = ['Day', 'Week', 'Month', 'Year'];

 return (
 <div className="self-stretch inline-flex justify-start items-start">
 <div className="flex justify-start items-center gap-2.5">
 <div className="p-0.5 bg-neutral-50 rounded-lg shadow-sm border-0 flex justify-center items-center gap-1">
 {periods.map((period) => (
 <div
 key={period}
 className={`px-3 py-1.5 inline-flex flex-col justify-start items-start gap-2.5 ${
 period === activePeriod
 ? 'bg-white rounded shadow-[-6px_2px_12px_0px_rgba(0,0,0,0.04)]'
 : 'rounded'
 }${period === 'Year' ? ' rounded-md' : ''}`}
 >
 <div className="self-stretch inline-flex justify-start items-center gap-2.5">
 <div className="justify-start text-stone-900 text-xs font-medium leading-4">
 {period}
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="px-3 py-1 bg-gray-100 rounded-lg flex justify-start items-center gap-1">
 <div className="flex justify-start items-center gap-1">
 <div className="w-5 h-5 relative overflow-hidden">
 <div className="w-2.5 h-[5px] left-[5px] top-[10px] absolute bg-stone-950" />
 <div className="w-4 h-4 left-[1.04px] top-[1.46px] absolute bg-stone-950" />
 </div>
 <div className="justify-start text-stone-950 text-sm font-medium font-['Excon']">
 Date{' '}
 </div>
 </div>
 <div className="w-6 h-6 relative overflow-hidden">
 <div className="w-2 h-1 left-[8px] top-[11px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-neutral-700" />
 </div>
 </div>
 </div>
 </div>
 );
}

