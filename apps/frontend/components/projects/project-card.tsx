import React from "react";
import { MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface ProjectCardProps {
  name: string;
  accountsCount: number;
  taskersCount: number;
  dateCreated: string;
}

/**
 * ProjectCard Component
 * Displays a single project row/card. Fully responsive between mobile and desktop layouts.
 */
export function ProjectCard({
  name,
  accountsCount,
  taskersCount,
  dateCreated,
}: ProjectCardProps) {
  return (
    <div className="w-full px-4 py-4 sm:py-3 bg-neutral-50 rounded-xl shadow-sm border-0 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3">
      {/* Mobile Header Row (Name + Dots) */}
      <div className="flex justify-between items-start sm:hidden w-full">
        <div className="flex flex-col gap-0.5">
          <div className="text-zinc-500 text-sm font-medium leading-6">
            Project's Name
          </div>
          <div className="text-stone-900 text-base font-medium leading-6">
            {name}
          </div>
        </div>
        <ActionMenu />
      </div>

      {/* Mobile Stats Row */}
      <div className="flex sm:hidden justify-between items-center w-full mt-2">
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="text-zinc-500 text-sm font-medium leading-6">
            No. of Accounts
          </div>
          <div className="text-stone-900 text-base font-medium leading-6">
            {accountsCount}
          </div>
        </div>
        <div className="w-px h-6 bg-zinc-200 mx-4" />
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="text-zinc-500 text-sm font-medium leading-6">
            Date created
          </div>
          <div className="text-stone-900 text-base font-medium leading-6">
            {dateCreated}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-1 items-center gap-3 w-full">
        <div className="flex-1 flex flex-col justify-center items-start gap-0.5">
          <div className="text-zinc-500 text-sm font-medium leading-6">
            Project Name
          </div>
          <div className="text-stone-900 text-base font-medium leading-6">
            {name}
          </div>
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <div className="w-px h-6 bg-zinc-200" />
          <div className="flex flex-col justify-center items-start gap-0.5 w-full">
            <div className="text-zinc-500 text-sm font-medium leading-6">
              Number of Accounts
            </div>
            <div className="text-stone-900 text-base font-medium leading-6">
              {accountsCount}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-px h-6 bg-zinc-200" />
          <div className="flex flex-col justify-center items-start gap-0.5 w-full">
            <div className="text-zinc-500 text-sm font-medium leading-6">
              Number of Taskers
            </div>
            <div className="text-stone-900 text-base font-medium leading-6">
              {taskersCount}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-px h-6 bg-zinc-200" />
          <div className="flex flex-col justify-center items-start gap-0.5 w-full">
            <div className="text-zinc-500 text-sm font-medium leading-6">
              Date created
            </div>
            <div className="text-stone-900 text-base font-medium leading-6">
              {dateCreated}
            </div>
          </div>
        </div>
        
        <div className="ml-2">
          <ActionMenu />
        </div>
      </div>
    </div>
  );
}

function ActionMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-200 transition-colors focus:outline-none">
          <MoreVertical className="w-5 h-5 text-stone-900" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="min-w-[140px] bg-white rounded-lg shadow-lg border-0 shadow-sm p-1 z-50 animate-in fade-in zoom-in-95"
        >
          <DropdownMenu.Item className="text-sm text-stone-900 px-3 py-2 outline-none cursor-pointer hover:bg-zinc-100 rounded-md">
            View Details
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

