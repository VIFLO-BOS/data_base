import React from "react";

interface EmptyStateProps {
  onCreateClick?: () => void;
}

/**
 * EmptyState Component
 * Shown when there are no projects yet.
 */
export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="self-stretch py-24 px-12 bg-white rounded-[32px] flex flex-col justify-center items-center gap-6 overflow-hidden shadow-sm border-0">
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="text-center text-stone-900 text-xl sm:text-2xl font-medium leading-6">
          You haven't created any Project yet
        </div>
        <div className="text-center text-zinc-500 text-sm font-medium leading-6">
          Create a Project to view Projects
        </div>
      </div>
      <button
        onClick={onCreateClick}
        className="w-full sm:w-96 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg flex justify-center items-center"
      >
        <span className="text-white text-sm font-medium leading-6">
          Create Project
        </span>
      </button>
    </div>
  );
}

