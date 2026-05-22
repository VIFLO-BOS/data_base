import React from "react";
import { Briefcase, Plus } from "lucide-react";

interface ProjectsHeaderProps {
  count: number;
  onNewClick?: () => void;
}

/**
 * ProjectsHeader Component
 * Displays the "Projects" title with count badge and "New +" button.
 */
export function ProjectsHeader({ count, onNewClick }: ProjectsHeaderProps) {
  return (
    <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center gap-2">
      <div className="flex justify-start items-center gap-3">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-stone-900 text-2xl font-semibold leading-6 tracking-[-0.02em]">
          Projects
        </div>
        <div className="px-2.5 py-1 bg-indigo-50 rounded-full flex justify-center items-center ring-1 ring-indigo-100">
          <div className="text-indigo-600 text-xs font-semibold tabular-nums">
            {count}
          </div>
        </div>
      </div>
      <button
        onClick={onNewClick}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex justify-center items-center gap-1.5 cursor-pointer hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-600/20"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-semibold leading-5">New Project</span>
      </button>
    </div>
  );
}
