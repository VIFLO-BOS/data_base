'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { getAccounts, Account } from '../../services/account-service';
import { getProjects, Project, assignTaskerToProject } from '../../services/project-service';
import { showError, showSuccess } from '@/lib/toast';

interface AssignAccountModalProps {
  taskerId: string;
  /** Accounts already assigned to this tasker (to mark them) */
  assignedAccountKeys?: string[];
  onClose: () => void;
  onAssigned: () => void;
}

/**
 * AssignAccountModal
 * Lets the admin pick an Account + Project, then assigns the tasker to that project/account.
 */
export function AssignAccountModal({
  taskerId,
  assignedAccountKeys = [],
  onClose,
  onAssigned,
}: AssignAccountModalProps) {
  // Data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Selections
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Search
  const [accountSearch, setAccountSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Dropdowns
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    getAccounts(1, 100)
      .then(setAccounts)
      .catch((err) => showError(err, 'Failed to load accounts'));
    getProjects(1, 100)
      .then(setProjects)
      .catch((err) => showError(err, 'Failed to load projects'));
  }, []);

  // Click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered lists
  const filteredAccounts = accounts.filter((a) =>
    a.name.toLowerCase().includes(accountSearch.toLowerCase()),
  );

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()),
  );

  const canSubmit = selectedAccount && selectedProject && !isSubmitting;

  async function handleSubmit() {
    if (!selectedAccount || !selectedProject) return;
    setIsSubmitting(true);
    try {
      await assignTaskerToProject(selectedProject.id, taskerId, selectedAccount.id);
      showSuccess('Account assigned successfully');
      onAssigned();
      onClose();
    } catch (err: any) {
      showError(err, 'Failed to assign account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4 p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Assign Account</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Account Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Account</label>
          <div className="relative" ref={accountDropdownRef}>
            <div
              className={`h-12 px-4 bg-white rounded-xl border inline-flex items-center gap-3 w-full cursor-pointer transition-all ${
                showAccountDropdown ? 'border-indigo-400 border-2' : 'border-gray-200'
              }`}
              onClick={() => setShowAccountDropdown(true)}
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {selectedAccount ? (
                <span className="text-sm text-gray-900 flex-1">{selectedAccount.name}</span>
              ) : (
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder="Search accounts..."
                  className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                  onFocus={() => setShowAccountDropdown(true)}
                />
              )}
              {selectedAccount && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccount(null);
                    setAccountSearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {showAccountDropdown && !selectedAccount && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-48 overflow-y-auto z-30">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const isAssigned = assignedAccountKeys.some((k) => k.includes(account.id));
                    return (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setAccountSearch('');
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between first:rounded-t-xl last:rounded-b-xl ${
                          isAssigned
                            ? 'bg-indigo-50 text-indigo-700 cursor-pointer'
                            : 'text-gray-700 hover:bg-indigo-50 cursor-pointer'
                        }`}
                      >
                        <span className="truncate">{account.name}</span>
                        {isAssigned && (
                          <span className="text-xs text-emerald-600 font-medium ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Assigned
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No accounts found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Project</label>
          <div className="relative" ref={projectDropdownRef}>
            <div
              className={`h-12 px-4 bg-white rounded-xl border inline-flex items-center gap-3 w-full cursor-pointer transition-all ${
                showProjectDropdown ? 'border-indigo-400 border-2' : 'border-gray-200'
              }`}
              onClick={() => setShowProjectDropdown(true)}
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {selectedProject ? (
                <span className="text-sm text-gray-900 flex-1">{selectedProject.name}</span>
              ) : (
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                  onFocus={() => setShowProjectDropdown(true)}
                />
              )}
              {selectedProject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(null);
                    setProjectSearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {showProjectDropdown && !selectedProject && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-48 overflow-y-auto z-30">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setProjectSearch('');
                        setShowProjectDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {project.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No projects found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            canSubmit
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Assigning...' : 'Assign Account'}
        </button>
      </div>
    </div>
  );
}
