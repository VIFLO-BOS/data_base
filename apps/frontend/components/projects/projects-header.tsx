import React from "react";

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
        <div className="text-stone-900 text-2xl font-medium leading-6">
          Projects
        </div>
        <div className="px-2 py-0.5 bg-gray-100 rounded-md flex justify-center items-center">
          <div className="text-stone-900 text-xs font-medium">
            {count}
          </div>
        </div>
      </div>
      <button
        onClick={onNewClick}
        className="px-3 py-1.5 rounded-lg border border-indigo-600 flex justify-center items-center gap-1.5 cursor-pointer hover:bg-indigo-50 transition-colors"
      >
        <span className="text-indigo-600 text-sm font-medium leading-5">New</span>
        <span className="text-indigo-600 text-lg font-medium leading-5 leading-none mb-0.5">+</span>
      </button>
    </div>
  );
}

