'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

interface AddNewAccountModalProps {
  onClose: () => void;
  onCreate: (data: { project: string; accountName: string; clientName: string; taskers: string[] }) => void;
}

/**
 * AddNewAccountModal Component
 * Modal form for adding a new account with project, account name, client name, and assigned taskers.
 */
export function AddNewAccountModal({ onClose, onCreate }: AddNewAccountModalProps) {
  const [project, setProject] = useState('');
  const [accountName, setAccountName] = useState('');
  const [clientName, setClientName] = useState('');
  const [taskerSearch, setTaskerSearch] = useState('');
  const [selectedTaskers, setSelectedTaskers] = useState<string[]>([]);

  const isValid = project && accountName && clientName;

  const handleRemoveTasker = (tasker: string) => {
    setSelectedTaskers((prev) => prev.filter((t) => t !== tasker));
  };

  const handleAddTasker = () => {
    if (taskerSearch.trim() && !selectedTaskers.includes(taskerSearch.trim())) {
      setSelectedTaskers((prev) => [...prev, taskerSearch.trim()]);
      setTaskerSearch('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-[595px] p-6 bg-white rounded-xl border-0 shadow-sm/80 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
          <h2 className="text-stone-900 text-2xl font-medium leading-6">
            Add New Account
          </h2>
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
              className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 appearance-none bg-white cursor-pointer text-stone-900 placeholder:text-stone-300 outline-none"
            >
              <option value="" disabled>Select Project</option>
              <option value="Ventree">Ventree</option>
              <option value="Outlier">Outlier</option>
              <option value="Tatas Lustre">Tatas Lustre</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          </div>
        </div>

        {/* Account Name */}
        <div className="flex flex-col gap-2">
          <label className="text-stone-900 text-sm font-medium leading-6">Account Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 text-stone-900 placeholder:text-stone-300 outline-none focus:border-indigo-300 transition-colors"
          />
        </div>

        {/* Client Name */}
        <div className="flex flex-col gap-2">
          <label className="text-stone-900 text-sm font-medium leading-6">Client Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-3 rounded-xl border-0 shadow-sm text-sm font-medium leading-6 text-stone-900 placeholder:text-stone-300 outline-none focus:border-indigo-300 transition-colors"
          />
        </div>

        {/* Assigned Tasker(s) */}
        <div className="flex flex-col gap-2">
          <label className="text-stone-900 text-sm font-medium leading-6">Assigned Tasker(s)</label>
          <div className="w-full h-12 px-4 bg-neutral-50 rounded-2xl border-0 shadow-sm flex items-center gap-3">
            <Search className="w-5 h-5 text-stone-300 shrink-0" />
            <input
              type="text"
              placeholder="Search here"
              value={taskerSearch}
              onChange={(e) => setTaskerSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTasker()}
              className="flex-1 bg-transparent text-sm font-medium leading-6 text-stone-900 placeholder:text-stone-300 outline-none"
            />
          </div>
          {/* Tag Chips */}
          {selectedTaskers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedTaskers.map((tasker) => (
                <div
                  key={tasker}
                  className="px-3 py-1 rounded-lg border-0 shadow-sm ring-1 ring-zinc-200 flex items-center gap-2 text-sm text-stone-900"
                >
                  {tasker}
                  <button
                    onClick={() => handleRemoveTasker(tasker)}
                    className="text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={() => isValid && onCreate({ project, accountName, clientName, taskers: selectedTaskers })}
          disabled={!isValid}
          className={`w-full px-4 py-3 rounded-lg flex justify-center items-center transition-colors cursor-pointer ${
            isValid
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600/50 text-white/80 cursor-not-allowed'
          }`}
        >
          <span className="text-base font-medium leading-6">Add Account</span>
        </button>
      </div>
    </div>
  );
}

