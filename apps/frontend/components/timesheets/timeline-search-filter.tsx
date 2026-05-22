'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface TimelineSearchFilterProps {
  projectFilter?: string;
  projects?: string[];
  onProjectChange?: (project: string) => void;
  onSearchChange?: (value: string) => void;
}

/**
 * TimelineSearchFilter Component
 * Supabase-style search bar + project dropdown filter for timeline.
 */
export function TimelineSearchFilter({
  projectFilter = 'All Projects',
  onProjectChange,
  onSearchChange,
}: Omit<TimelineSearchFilterProps, 'projects'>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(projectFilter === 'Ventree' ? 'All Projects' : projectFilter);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [projectsList, setProjectsList] = useState<string[]>(['All Projects']);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { getProjects } = await import('../../services/project-service');
        const res = await getProjects(1, 100);
        const data = (res as any).data?.data || [];
        setProjectsList(['All Projects', ...data.map((p: any) => p.name)]);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      {/* Search Bar */}
      <div className="w-full sm:w-80 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search timesheets..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-white text-sm text-stone-900 rounded-lg border border-zinc-300 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 outline-none transition-all"
        />
      </div>

      {/* Project Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`min-w-[180px] h-10 px-3 rounded-lg bg-white border flex justify-between items-center gap-3 hover:bg-zinc-50 transition-all cursor-pointer ${
            isOpen ? 'border-indigo-500 ring-[3px] ring-indigo-500/15' : 'border-zinc-300'
          }`}
        >
          <span className="text-stone-900 text-sm font-medium">{selected}</span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 min-w-[180px] bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50">
            {projectsList.map((project) => (
              <button
                key={project}
                onClick={() => {
                  setSelected(project);
                  onProjectChange?.(project);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-zinc-50 ${
                  project === selected ? 'text-indigo-600 bg-indigo-50' : 'text-stone-700'
                }`}
              >
                {project}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
