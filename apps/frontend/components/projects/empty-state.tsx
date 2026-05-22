import React from "react";
import { FolderPlus, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick?: () => void;
}

/**
 * EmptyState Component
 * Shown when there are no projects yet.
 */
export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="self-stretch py-20 px-12 bg-white rounded-2xl flex flex-col justify-center items-center gap-6 overflow-hidden ring-1 ring-zinc-100">
      {/* Icon */}
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center ring-1 ring-indigo-100">
        <FolderPlus className="w-7 h-7 text-indigo-400" />
      </div>

      <div className="flex flex-col justify-center items-center gap-2">
        <div className="text-center text-stone-900 text-xl sm:text-2xl font-semibold leading-7 tracking-[-0.02em]">
          You haven't created any project yet
        </div>
        <div className="text-center text-zinc-400 text-sm font-medium leading-6 max-w-xs">
          Create your first project to start managing accounts and taskers
        </div>
      </div>
      <button
        onClick={onCreateClick}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 rounded-lg flex justify-center items-center gap-2 shadow-sm shadow-indigo-600/20"
      >
        <Plus className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-semibold leading-6">
          Create Project
        </span>
      </button>
    </div>
  );
}
