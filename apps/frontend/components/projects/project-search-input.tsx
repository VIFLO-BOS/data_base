'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { getProjects, Project } from '../../services/project-service';

interface ProjectSearchInputProps {
  selectedProjects: { id: string; name: string }[];
  onChange: (projects: { id: string; name: string }[]) => void;
  placeholder?: string;
}

export function ProjectSearchInput({
  selectedProjects,
  onChange,
  placeholder = "Search and assign projects...",
}: ProjectSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await getProjects(1, 100);
        const allProjects = (response as any).data?.data || [];
        
        // Filter by name and exclude already selected
        const filtered = allProjects.filter((p: Project) => {
          return p.name.toLowerCase().includes(query.toLowerCase()) && !selectedProjects.some(sp => sp.id === p.id);
        });
        
        setResults(filtered);
        setIsOpen(true);
      } catch (e) {
        console.error('Failed to search projects', e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceId = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceId);
  }, [query, selectedProjects]);

  const handleSelect = (project: Project) => {
    if (!selectedProjects.some(sp => sp.id === project.id)) {
      onChange([...selectedProjects, { id: project.id, name: project.name }]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove: string) => {
    onChange(selectedProjects.filter(p => p.id !== idToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      <label className="text-stone-700 text-sm font-medium">Assigned Project(s)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-[68px] left-0 w-full bg-white border border-zinc-200 shadow-lg rounded-lg z-50 max-h-48 overflow-y-auto">
          {results.map(project => (
            <div
              key={project.id}
              onClick={() => handleSelect(project)}
              className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-sm text-stone-900 border-b border-zinc-100 last:border-0"
            >
              {project.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute top-[68px] left-0 w-full bg-white border border-zinc-200 shadow-lg rounded-lg z-50 p-3 text-sm text-zinc-500 text-center">
          No projects found
        </div>
      )}

      {/* Selected Tags */}
      {selectedProjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedProjects.map((project) => (
            <div
              key={project.id}
              className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 flex items-center gap-1.5 text-sm text-stone-700"
            >
              {project.name}
              <button
                type="button"
                onClick={() => handleRemove(project.id)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
