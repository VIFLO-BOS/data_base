import React from "react";
import { Search } from "lucide-react";

/**
 * SearchBar Component
 * Supabase-style clean search input with visible border.
 */
export function SearchBar() {
  return (
    <div className="w-full max-w-sm relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Search projects..."
        className="w-full h-10 pl-10 pr-4 bg-white text-sm text-stone-900 rounded-lg border border-zinc-300 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 outline-none transition-all"
      />
    </div>
  );
}
