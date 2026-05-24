'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getProjects, Project } from '../../services/project-service';
import { TaskerSearchInput } from '../taskers/tasker-search-input';

interface AddNewAccountModalProps {
  onClose: () => void;
  onCreate: (data: {
    projectId?: string;
    projectName?: string;
    isNewProject: boolean;
    accountName: string;
    clientName: string;
    taskers: { id: string; name: string }[];
  }) => void;
}

/**
 * AddNewAccountModal Component
 * Supabase-style modal form for adding a new account.
 */
export function AddNewAccountModal({ onClose, onCreate }: AddNewAccountModalProps) {
  const [projectId, setProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isNewProject, setIsNewProject] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedTaskers, setSelectedTaskers] = useState<{id: string; name: string}[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        const list = await getProjects(1, 100);
        setProjectsList(list);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);


  const isValid = (isNewProject ? newProjectName.trim() !== '' : projectId !== '') && accountName && clientName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[560px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-stone-900 text-lg font-semibold">Add New Account</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Project Dropdown or Creation Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-stone-700 text-sm font-medium">
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
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            ) : (
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 appearance-none cursor-pointer outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                >
                  <option value="" disabled>
                    {isLoadingProjects ? "Loading projects..." : "Select Project"}
                  </option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Account Name</label>
            <input
              type="text"
              placeholder="Enter account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Client Name</label>
            <input
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* Assigned Tasker(s) Autocomplete */}
          <TaskerSearchInput 
            selectedTaskers={selectedTaskers}
            onChange={setSelectedTaskers}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
          <button
          onClick={() => {
            if (isValid) {
              const pName = isNewProject ? newProjectName : projectsList.find((p) => p.id === projectId)?.name || '';
              onCreate({ 
                projectId: isNewProject ? undefined : projectId, 
                projectName: pName, 
                isNewProject, 
                accountName, 
                clientName, 
                taskers: selectedTaskers 
              });
            }
          }}
          disabled={!isValid}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isValid
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Add Account
          </button>
        </div>
      </div>
    </div>
  );
}
