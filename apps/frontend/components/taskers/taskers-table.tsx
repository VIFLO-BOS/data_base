'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

/**
 * ProjectDropdown — reusable project filter dropdown for tables
 */
function ProjectDropdown({ value }: { value: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value === 'Ventree' ? 'All Projects' : value);
  const ref = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<string[]>(['All Projects']);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { getProjects } = await import('../../services/project-service');
        const list = await getProjects(1, 100);
        setProjects(['All Projects', ...list.map((p) => p.name)]);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`min-w-[180px] h-10 px-3 rounded-lg bg-white border flex justify-between items-center gap-3 hover:bg-zinc-50 transition-all cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-[3px] ring-indigo-500/15' : 'border-zinc-300'
        }`}
      >
        <span className="text-stone-900 text-sm font-medium">{selected}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[180px] bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50">
          {projects.map((project) => (
            <button
              key={project}
              onClick={() => {
                setSelected(project);
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
  );
}

interface TaskerRowData {
  id: string;
  tasker: string;
  account: string;
  totalHours: number;
}

interface TaskersTableProps {
  taskers: TaskerRowData[];
  totalCount: number;
  filterLabel: string;
  projectFilter?: string;
  isArchived?: boolean;
  onView?: (tasker: TaskerRowData) => void;
  onEdit?: (tasker: TaskerRowData) => void;
  onArchive?: (tasker: TaskerRowData) => void;
  onUnarchive?: (tasker: TaskerRowData) => void;
  onDelete?: (tasker: TaskerRowData) => void;
}

/**
 * TaskersTable Component
 * Data table with columns: Tasker, Account(s), Total Hours, and Actions.
 */
export function TaskersTable({
  taskers,
  totalCount,
  filterLabel,
  projectFilter,
  isArchived = false,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: TaskersTableProps) {
  return (
    <div className="self-stretch flex flex-col gap-4">
      {/* Table Header with filter */}
      <div className="w-full pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
        <div className="flex justify-start items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 text-base font-medium leading-6">{filterLabel}</span>
            <div className="px-2.5 py-1 bg-indigo-50 rounded-full flex justify-center items-center ring-1 ring-indigo-100">
              <span className="text-indigo-600 text-xs font-semibold tabular-nums">
                {totalCount}
              </span>
            </div>
          </div>
        </div>
        {projectFilter && <ProjectDropdown value={projectFilter} />}
      </div>

      {/* Table Content */}
      <div className="w-full flex flex-col gap-0">
        {/* Column Headers */}
        <div className="w-full py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[2fr_2fr_1fr_48px] items-center gap-4">
          <div className="text-zinc-500 text-sm font-medium leading-5">Tasker</div>
          <div className="text-zinc-500 text-sm font-medium leading-5">Account(s)</div>
          <div className="text-zinc-500 text-sm font-medium leading-5">Total Hours</div>
          <div className="w-12"></div>
        </div>

        {/* Tasker Rows */}
        {taskers.map((row, index) => (
          <div
            key={index}
            className="w-full py-4 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[2fr_2fr_1fr_48px] items-center gap-4 group hover:bg-zinc-50 transition-colors"
            style={{ position: 'relative' }}
          >
            <div className="text-stone-900 text-sm font-medium leading-5">{row.tasker}</div>
            <div className="text-stone-900 text-sm font-medium leading-5">{row.account}</div>
            <div className="text-stone-900 text-sm font-medium leading-5">{row.totalHours}</div>
            <div className="flex justify-end items-center relative">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors outline-none">
                    <MoreVertical className="w-5 h-5 text-stone-500" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="w-40 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-[100] flex flex-col animate-in fade-in zoom-in-95"
                  >
                    {onView && (
                      <DropdownMenu.Item
                        onClick={() => onView(row)}
                        className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer outline-none"
                      >
                        View
                      </DropdownMenu.Item>
                    )}
                    {onEdit && (
                      <DropdownMenu.Item
                        onClick={() => onEdit(row)}
                        className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer outline-none"
                      >
                        Edit
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      onClick={() => {
                        if (isArchived && onUnarchive) onUnarchive(row);
                        if (!isArchived && onArchive) onArchive(row);
                      }}
                      className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer outline-none"
                    >
                      {isArchived ? 'Unarchive' : 'Archive'}
                    </DropdownMenu.Item>
                    {isArchived && onDelete && (
                      <DropdownMenu.Item
                        onClick={() => onDelete(row)}
                        className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer outline-none"
                      >
                        Delete Permanently
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
