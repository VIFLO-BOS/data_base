'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { getProjects, Project } from '../../services/project-service';
import { getAccounts, Account } from '../../services/account-service';
import { showError } from '@/lib/toast';
import { TaskerSearchInput } from '../taskers/tasker-search-input';

interface AddNewAccountModalProps {
  onClose: () => void;
  onCreate: (data: {
    projectId?: string;
    projectName?: string;
    isNewProject: boolean;
    accountId?: string;
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
  const [selectedTaskers, setSelectedTaskers] = useState<{ id: string; name: string }[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

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

    getAccounts(1, 100)
      .then(setAccountsList)
      .catch((err) => showError(err, 'Failed to load accounts'));
  }, []);

  const isValid =
    (isNewProject ? newProjectName.trim() !== '' : projectId !== '') && accountName && clientName;

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
                    {isLoadingProjects ? 'Loading projects...' : 'Select Project'}
                  </option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-stone-700 text-sm font-medium">Account Name</label>
            <div className="relative">
              {selectedAccount ? (
                <div className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none flex justify-between items-center">
                  <span className="truncate">{selectedAccount.name}</span>
                  <button
                    onClick={() => {
                      setSelectedAccount(null);
                      setAccountName('');
                    }}
                    className="p-1 rounded-md hover:bg-zinc-100"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Enter or search account name"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    setShowAccountDropdown(true);
                  }}
                  onFocus={() => setShowAccountDropdown(true)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                />
              )}
            </div>

            {/* Account Dropdown */}
            {showAccountDropdown && !selectedAccount && accountName.length > 0 && (
              <div className="absolute left-0 right-0 top-[60px] bg-white rounded-lg border border-zinc-200 shadow-lg max-h-48 overflow-y-auto z-40">
                {accountsList.filter((a) =>
                  a.name.toLowerCase().includes(accountName.toLowerCase()),
                ).length > 0 ? (
                  accountsList
                    .filter((a) => a.name.toLowerCase().includes(accountName.toLowerCase()))
                    .map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setAccountName(account.name);
                          setShowAccountDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-indigo-50 transition-colors"
                      >
                        {account.name}
                      </button>
                    ))
                ) : (
                  <div className="px-4 py-2.5 text-sm text-stone-400">
                    Press "Add Account" to create a new one
                  </div>
                )}
              </div>
            )}
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
          <TaskerSearchInput selectedTaskers={selectedTaskers} onChange={setSelectedTaskers} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
          <button
            onClick={() => {
              if (isValid) {
                const pName = isNewProject
                  ? newProjectName
                  : projectsList.find((p) => p.id === projectId)?.name || '';
                onCreate({
                  projectId: isNewProject ? undefined : projectId,
                  projectName: pName,
                  isNewProject,
                  accountId: selectedAccount?.id,
                  accountName,
                  clientName,
                  taskers: selectedTaskers,
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
