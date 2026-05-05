import React from 'react';

interface TimelineSearchFilterProps {
 projectFilter?: string;
}

/**
 * TimelineSearchFilter Component
 * Search bar + project dropdown filter for timeline.
 */
export function TimelineSearchFilter({ projectFilter = 'Ventree' }: TimelineSearchFilterProps) {
 return (
 <div className="self-stretch inline-flex justify-between items-start">
 <div className="flex justify-start items-center gap-4">
 <div className="w-80 h-14 px-5 bg-neutral-50 rounded-2xl flex justify-start items-center gap-3">
 <div className="w-5 h-5 relative">
 <div className="w-3.5 h-3.5 left-[2.31px] top-[2.32px] absolute rounded-full outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 <div className="w-[2.94px] h-[2.93px] left-[15.02px] top-[15.40px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 </div>
 <div className="flex-1 justify-center text-stone-300 text-sm font-medium leading-6">
 Search here
 </div>
 </div>
 </div>
 <div className="w-60 p-3 rounded-xl shadow-sm border-0 flex justify-between items-center">
 <div className="flex-1 justify-start text-text-primary text-sm font-medium leading-6">
 {projectFilter}
 </div>
 <div className="w-6 h-6 relative overflow-hidden">
 <div className="w-2.5 h-[5px] left-[7px] top-[10px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-black" />
 </div>
 </div>
 </div>
 );
}

