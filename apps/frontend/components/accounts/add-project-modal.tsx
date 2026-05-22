'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getProjects, Project } from '../../services/project-service';
import { TaskerSearchInput } from '../taskers/tasker-search-input';

interface AddProjectModalProps {
  onClose: () => void;
  onAdd: (data: { projectId?: string; projectName?: string; taskers: { id: string; name: string }[]; isNewProject: boolean }) => void;
}

/**
 * AddProjectModal Component
 * Modal for adding a project to an account (from the detail view).
 */
export function AddProjectModal({ onClose, onAdd }: AddProjectModalProps) {
  const [projectId, setProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isNewProject, setIsNewProject] = useState(false);
  const [selectedTaskers, setSelectedTaskers] = useState<{id: string; name: string}[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        const response = await getProjects(1, 100);
        setProjectsList((response as any).data?.data || []);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const isValid = (isNewProject ? newProjectName.trim() !== '' : projectId !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-[595px] p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
          <h2 className="text-stone-900 text-2xl font-medium leading-6">
            Add Project
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-stone-900" />
          </button>
        </div>

        {/* Project Dropdown or Creation Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-stone-900 text-sm font-medium leading-6">
              {isNewProject ? 'New Project Name' : 'Select Existing Project'}
            </label>
            <button
              onClick={() => {
                setIsNewProject(!isNewProject);
                setProjectId('');
                setNewProjectName('');
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {isNewProject ? 'Select Existing Instead' : '+ Create New Project'}
            </button>
          </div>

          {isNewProject ? (
            <input
              type="text"
              placeholder="Enter new project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          ) : (
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 appearance-none bg-white cursor-pointer text-stone-900 placeholder:text-stone-300 outline-none"
              >
                <option value="" disabled>
                  {isLoadingProjects ? "Loading projects..." : "Select Project"}
                </option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Assigned Tasker(s) Autocomplete */}
        <TaskerSearchInput 
          selectedTaskers={selectedTaskers}
          onChange={setSelectedTaskers}
          placeholder="Search taskers"
        />

        {/* Submit Button */}
        <button
          onClick={() => {
            if (isValid) {
              const pName = isNewProject ? newProjectName : projectsList.find(x => x.id === projectId)?.name || '';
              onAdd({ 
                projectId: isNewProject ? undefined : projectId, 
                projectName: pName, 
                taskers: selectedTaskers,
                isNewProject
              });
            }
          }}
          disabled={!isValid}
          className={`w-full px-4 py-3 rounded-lg flex justify-center items-center transition-colors cursor-pointer ${
            isValid
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600/50 text-white/80 cursor-not-allowed'
          }`}
        >
          <span className="text-base font-medium leading-6">Add Project</span>
        </button>
      </div>
    </div>
  );
}

