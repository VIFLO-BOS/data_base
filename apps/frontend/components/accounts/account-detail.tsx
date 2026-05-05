'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, MoreVertical, Plus } from 'lucide-react';

interface ProjectData {
  name: string;
  assignedTaskers: string;
  totalHours: number;
}

interface AccountDetailData {
  name: string;
  isActive: boolean;
  dateCreated: string;
  projects: ProjectData[];
  totalTaskers: number;
  totalHoursLogged: number;
}

interface AccountDetailProps {
  account: AccountDetailData;
  onBack: () => void;
  onEditAccount: () => void;
  onRemoveAccount: () => void;
  onAddProject: () => void;
  onEditProject: (project: ProjectData) => void;
  onRemoveProject: (project: ProjectData) => void;
}

/**
 * AccountDetail Component
 * Shows the detailed view of a single account with breadcrumb,
 * stats cards, and projects table.
 */
export function AccountDetail({
  account,
  onBack,
  onEditAccount,
  onRemoveAccount,
  onAddProject,
  onEditProject,
  onRemoveProject,
}: AccountDetailProps) {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [openProjectMenu, setOpenProjectMenu] = useState<number | null>(null);
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
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 shadow-sm py-1 z-50">
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

      {/* Projects Section */}
      <div className="self-stretch p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-6">
        {/* Projects Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 text-base font-medium leading-6">Projects</span>
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

        {/* Projects Table */}
        <div className="flex flex-col gap-0">
          {/* Column Headers */}
          <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center">
            <div className="flex-1 text-zinc-500 text-sm font-medium leading-6">Project Name</div>
            <div className="flex-1 text-zinc-500 text-sm font-medium leading-6 hidden sm:block">
              Assigned Tasker(s)
            </div>
            <div className="flex-1 text-zinc-500 text-sm font-medium leading-6 hidden sm:block">
              Total Hours
            </div>
            <div className="w-8" />
          </div>

          {/* Project Rows */}
          {account.projects.map((project, index) => (
            <div key={index} className="py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex items-center">
              <div className="flex-1 text-stone-900 text-sm font-medium leading-6">
                {project.name}
              </div>
              <div className="flex-1 text-stone-900 text-sm font-medium leading-6 hidden sm:block">
                {project.assignedTaskers}
              </div>
              <div className="flex-1 text-stone-900 text-sm font-medium leading-6 hidden sm:block">
                {project.totalHours}
              </div>
              <div
                className="relative w-8 flex justify-center"
                ref={openProjectMenu === index ? projectMenuRef : undefined}
              >
                <button
                  onClick={() => setOpenProjectMenu(openProjectMenu === index ? null : index)}
                  className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5 text-stone-700" />
                </button>
                {openProjectMenu === index && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border-0 shadow-sm py-1 z-50">
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
          ))}
        </div>
      </div>
    </div>
  );
}

