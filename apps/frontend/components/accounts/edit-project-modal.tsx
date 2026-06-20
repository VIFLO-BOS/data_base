'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getProjects, Project } from '../../services/project-service';
import { showError } from '@/lib/toast';
import { TaskerSearchInput } from '../taskers/tasker-search-input';

interface EditProjectModalProps {
  onClose: () => void;
  onSave: (data: { project: string; taskers: { id: string; name: string }[] }) => void;
  initialData: {
    project: string;
    taskers: { id: string; name: string }[];
  };
}

/**
 * EditProjectModal Component
 * Modal for editing a project assignment within an account (from the detail view).
 */
export function EditProjectModal({ onClose, onSave, initialData }: EditProjectModalProps) {
  const [project, setProject] = useState(initialData.project);
  const [selectedTaskers, setSelectedTaskers] = useState<{ id: string; name: string }[]>(
    initialData.taskers,
  );
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        const list = await getProjects(1, 100);
        setProjectsList(list);
      } catch (error) {
        showError(error, 'Failed to fetch projects');
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const isValid = project.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-[595px] p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
          <h2 className="text-stone-900 text-2xl font-medium leading-6">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-stone-900" />
          </button>
        </div>

        {/* Project Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-stone-900 text-sm font-medium leading-6">Project</label>
          <div className="relative">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 appearance-none bg-white cursor-pointer text-stone-900 outline-none"
            >
              <option value="" disabled>
                {isLoadingProjects ? 'Loading projects...' : 'Select Project'}
              </option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          </div>
        </div>

        {/* Assigned Tasker(s) Autocomplete */}
        <TaskerSearchInput
          selectedTaskers={selectedTaskers}
          onChange={setSelectedTaskers}
          placeholder="Search taskers"
        />

        {/* Save Button */}
        <button
          onClick={() => isValid && onSave({ project, taskers: selectedTaskers })}
          disabled={!isValid}
          className={`w-full px-4 py-3 rounded-lg flex justify-center items-center transition-colors cursor-pointer ${
            isValid
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600/50 text-white/80 cursor-not-allowed'
          }`}
        >
          <span className="text-base font-medium leading-6">Save Changes</span>
        </button>
      </div>
    </div>
  );
}
