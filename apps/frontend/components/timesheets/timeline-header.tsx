import React from 'react';
import { Clock } from 'lucide-react';

/**
 * TimelineHeader Component
 * Simple "Timeline" title header.
 */
export function TimelineHeader() {
 return (
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center gap-2">
 <div className="flex-1 flex justify-start items-center gap-3">
 <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
  <Clock className="w-4 h-4 text-indigo-600" />
 </div>
 <div>
  <div className="text-stone-900 text-2xl font-semibold leading-6 tracking-[-0.02em]">
  Timeline
  </div>
  <div className="text-zinc-400 text-xs font-medium mt-0.5">
  Track and manage work hours
  </div>
 </div>
 </div>
 </div>
 );
}
