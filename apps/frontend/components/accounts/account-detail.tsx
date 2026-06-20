'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, MoreVertical, Plus } from 'lucide-react';

function formatHoursText(hours: number | string | null | undefined): string {
  if (!hours) return '0h:00m';
  const totalMins = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

interface ProjectData {
  id?: string;
  name: string;
  assignedTaskers: string;
  taskers?: { id: string; name: string; status?: string; hours?: number }[];
  totalHours: number | string;
}

interface AccountDetailData {
  name: string;
  isActive: boolean;
  dateCreated: string;
  projects: ProjectData[];
  allTaskers: any[];
  totalTaskers: number;
  totalHoursLogged: number | string;
}

interface AccountDetailProps {
  account: AccountDetailData;
  onBack: () => void;
  onEditAccount: () => void;
  onRemoveAccount: () => void;
  onAddProject: () => void;
  onEditProject: (project: ProjectData) => void;
  onRemoveProject: (project: ProjectData) => void;
  onToggleTaskerStatus?: (projectId: string, taskerId: string, newStatus: string) => void;
}

/**
 * AccountDetail Component
 * Combined projects + taskers view with status toggle buttons.
 */
export function AccountDetail({
  account,
  onBack,
  onEditAccount,
  onRemoveAccount,
  onAddProject,
  onEditProject,
  onRemoveProject,
  onToggleTaskerStatus,
}: AccountDetailProps) {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [openProjectMenu, setOpenProjectMenu] = useState<string | null>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setOpenProjectMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);


  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Accounts
        </button>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-stone-900 font-medium">{account.name}</span>
      </div>

      {/* Account Info Card */}
      <div className="self-stretch p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-6">
        {/* Account Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-stone-900 text-2xl font-bold leading-8">{account.name}</h2>
            {account.isActive && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
          </div>
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
              className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 text-stone-700" />
            </button>
            {headerMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 py-1 z-50">
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    onEditAccount();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    onRemoveAccount();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Created */}
        <div className="self-stretch p-4 bg-neutral-50 rounded-xl flex flex-col gap-1">
          <span className="text-zinc-500 text-xs font-medium leading-4">Date Created</span>
          <span className="text-stone-900 text-sm font-medium leading-6">
            {account.dateCreated}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 rounded-xl flex flex-col gap-1">
            <span className="text-zinc-500 text-xs font-medium leading-4">Project(s)</span>
            <span className="text-stone-900 text-2xl font-bold leading-8">
              {account.projects.length}
            </span>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl flex flex-col gap-1">
            <span className="text-zinc-500 text-xs font-medium leading-4">Tasker(s)</span>
            <span className="text-stone-900 text-2xl font-bold leading-8">
              {account.totalTaskers}
            </span>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl flex flex-col gap-1">
            <span className="text-zinc-500 text-xs font-medium leading-4">Total Hours Logged</span>
            <span className="text-stone-900 text-2xl font-bold leading-8">
              {account.totalHoursLogged}
            </span>
          </div>
        </div>
      </div>

      {/* Combined Projects & Taskers Table */}
      <div className="self-stretch p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 text-base font-medium leading-6">
              Projects & Taskers
            </span>
            <div className="h-6 px-2 py-1 bg-gray-100 rounded-md flex justify-center items-center">
              <span className="text-stone-900 text-xs font-medium leading-4">
                {account.projects.length}
              </span>
            </div>
          </div>
          <button
            onClick={onAddProject}
            className="px-3 py-2 rounded-lg border border-indigo-600 flex items-center gap-1.5 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <span className="text-indigo-600 text-xs font-medium leading-4">Add Project</span>
            <Plus className="w-4 h-4 text-indigo-600" />
          </button>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-0">
          {/* Column Headers */}
          <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center gap-4">
            <div className="flex-[1.5] text-zinc-500 text-sm font-medium leading-6">
              Project Name
            </div>
            <div className="flex-[2] text-zinc-500 text-sm font-medium leading-6 hidden sm:block">
              Assigned Tasker(s)
            </div>
            <div className="w-[140px] shrink-0 text-zinc-500 text-sm font-medium leading-6 hidden sm:block text-left pl-4">
              Status
            </div>
            <div className="w-[100px] shrink-0 text-zinc-500 text-sm font-medium leading-6 hidden sm:block text-left">
              Hours
            </div>
            <div className="w-8 shrink-0" />
          </div>

          {/* Project Rows — now rendering one row per tasker (project repeated per row) */}
          {account.projects.map((project, index) => {
            const taskersList = project.taskers || [];
            const projectMenuKey = `project-${index}`;

            if (taskersList.length === 0) {
              return (
                <div
                  key={index}
                  className="py-4 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-start gap-4"
                >
                  <div className="flex-[1.5] text-stone-900 text-sm font-semibold leading-6 pt-1">
                    {project.name}
                  </div>
                  <div className="flex-[2] hidden text-xs sm:flex items-center text-zinc-400">
                    No taskers assigned
                  </div>
                  <div className="w-[140px] shrink-0 hidden sm:flex items-center justify-start pl-4">
                    <span className="text-zinc-300">{project.assignedTaskers}</span>
                  </div>
                  <div className="w-[100px] shrink-0 hidden sm:flex items-center justify-start text-stone-400">
                    {formatHoursText(project.totalHours)}
                  </div>
                  <div
                    className="relative w-8 shrink-0 flex justify-end pt-1"
                    ref={openProjectMenu === projectMenuKey ? projectMenuRef : undefined}
                  >
                    <button
                      onClick={() =>
                        setOpenProjectMenu(
                          openProjectMenu === projectMenuKey ? null : projectMenuKey,
                        )
                      }
                      className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-stone-700" />
                    </button>
                    {openProjectMenu === projectMenuKey && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 py-1 z-50">
                        <button
                          onClick={() => {
                            setOpenProjectMenu(null);
                            onEditProject(project);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenProjectMenu(null);
                            onRemoveProject(project);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return taskersList.map((t, ti) => {
              const rowKey = `${index}-${t.id ?? ti}`;
              const isActive = t.status === 'active';
              const label =
                t.status === 'achieved'
                  ? 'Achieved'
                  : t.status === 'disqualified'
                    ? 'Disqualified'
                    : t.status === 'removed'
                      ? 'Removed'
                      : isActive
                        ? 'Active'
                        : 'Inactive';

              return (
                <div
                  key={rowKey}
                  className="py-4 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-start gap-4"
                >
                  <div className="flex-[1.5] text-stone-900 text-sm font-semibold leading-6 pt-1">
                    {project.name}
                  </div>

                  <div className="flex-[2] hidden sm:flex items-center gap-2.5 h-8">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
                      {t.name?.charAt(0) || 'T'}
                    </div>
                    <span className="text-stone-700 text-sm font-medium leading-5">{t.name}</span>
                  </div>

                  <div className="w-[140px] shrink-0 hidden sm:flex items-center justify-start pl-4">
                    <button
                      onClick={() => {
                        if (onToggleTaskerStatus && project.id) {
                          onToggleTaskerStatus(project.id, t.id, isActive ? 'inactive' : 'active');
                        }
                      }}
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors w-fit border ${isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                    >
                      {label}
                    </button>
                  </div>

                  <div className="w-[100px] shrink-0 hidden sm:flex items-center justify-start text-stone-700 text-sm font-medium pt-1">
                    {formatHoursText(t.hours)}
                  </div>

                  <div
                    className="relative w-8 shrink-0 flex justify-end pt-1"
                    ref={openProjectMenu === rowKey ? projectMenuRef : undefined}
                  >
                    <button
                      onClick={() => setOpenProjectMenu(openProjectMenu === rowKey ? null : rowKey)}
                      className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-stone-700" />
                    </button>
                    {openProjectMenu === rowKey && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 py-1 z-50">
                        <button
                          onClick={() => {
                            setOpenProjectMenu(null);
                            onEditProject(project);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenProjectMenu(null);
                            onRemoveProject(project);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-stone-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
