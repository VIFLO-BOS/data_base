import React from 'react';
import { MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Project {
  id: string;
  name: string;
  accountsCount: number;
  taskersCount: number;
  dateCreated: string;
}

interface ProjectListProps {
  projects: Project[];
  onDelete?: (projectId: string) => void;
  onViewDetails?: (project: Project) => void;
}

/**
 * ProjectList Component
 * Displays projects in a table layout consistent with Accounts and Taskers.
 */
export function ProjectList({ projects, onDelete, onViewDetails }: ProjectListProps) {
  return (
    <div className="self-stretch flex flex-col gap-0 w-full">
      {/* Column Headers */}
      <div className="w-full pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[2fr_1fr_1fr_1.5fr_48px] items-center gap-4 hidden sm:grid">
        <div className="text-zinc-500 text-sm font-medium leading-5">Project Name</div>
        <div className="text-zinc-500 text-sm font-medium leading-5">No. of Accounts</div>
        <div className="text-zinc-500 text-sm font-medium leading-5">No. of Taskers</div>
        <div className="text-zinc-500 text-sm font-medium leading-5">Date created</div>
        <div className="w-12"></div>
      </div>

      {/* Project Rows */}
      {projects.map((project) => (
        <div
          key={project.id}
          className="w-full py-4 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1.5fr_48px] items-center gap-4 sm:gap-4 relative group hover:bg-zinc-50 transition-colors"
        >
          {/* Mobile Labels are shown only on small screens */}
          <div className="flex flex-col sm:block gap-1">
            <span className="sm:hidden text-zinc-500 text-xs font-medium uppercase tracking-wider">
              Project Name
            </span>
            <div className="text-stone-900 text-sm font-medium leading-5">{project.name}</div>
          </div>

          <div className="flex flex-col sm:block gap-1">
            <span className="sm:hidden text-zinc-500 text-xs font-medium uppercase tracking-wider">
              No. of Accounts
            </span>
            <div className="text-stone-900 text-sm font-medium leading-5">
              {project.accountsCount}
            </div>
          </div>

          <div className="flex flex-col sm:block gap-1">
            <span className="sm:hidden text-zinc-500 text-xs font-medium uppercase tracking-wider">
              No. of Taskers
            </span>
            <div className="text-stone-900 text-sm font-medium leading-5">
              {project.taskersCount}
            </div>
          </div>

          <div className="flex flex-col sm:block gap-1">
            <span className="sm:hidden text-zinc-500 text-xs font-medium uppercase tracking-wider">
              Date created
            </span>
            <div className="text-stone-900 text-sm font-medium leading-5">
              {project.dateCreated}
            </div>
          </div>

          <div className="absolute right-0 top-4 sm:static flex justify-end items-center">
            <ActionMenu 
              projectId={project.id} 
              onDelete={onDelete} 
              onViewDetails={() => onViewDetails && onViewDetails(project)} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionMenu({ 
  projectId, 
  onDelete, 
  onViewDetails 
}: { 
  projectId: string; 
  onDelete?: (id: string) => void;
  onViewDetails?: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors focus:outline-none outline-none">
          <MoreVertical className="w-5 h-5 text-stone-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="w-40 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-[100] flex flex-col animate-in fade-in zoom-in-95"
        >
          {onViewDetails && (
            <DropdownMenu.Item
              onClick={() => onViewDetails()}
              className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer outline-none"
            >
              View Details
            </DropdownMenu.Item>
          )}
          {onDelete && (
            <DropdownMenu.Item
              onClick={() => onDelete(projectId)}
              className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer outline-none"
            >
              Delete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
