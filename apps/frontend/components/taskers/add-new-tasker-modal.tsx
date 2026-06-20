'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
// import { ProjectSearchInput } from '../projects/project-search-input';
// import { AccountSearchInput } from '../accounts/account-search-input';

interface AddNewTaskerModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

/**
 * AddNewTaskerModal Component
 * Supabase-style modal form for adding a new tasker.
 */
export function AddNewTaskerModal({ onClose, onSubmit }: AddNewTaskerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    accountName: '',
    bank: '',
    accountNumber: '',
  });

  const [selectedProjects, setSelectedProjects] = useState<{id: string; name: string}[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<{id: string; name: string}[]>([]);

  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({ ...formData, projects: selectedProjects, accounts: selectedAccounts });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="w-full max-w-[560px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-stone-900 text-lg font-semibold">Add New Tasker</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Tasker&apos;s Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="flex flex-col gap-1.5 sm:w-1/2 sm:pr-2">
            <label className="text-stone-700 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* Row 3: Account Holder + Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Bank</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                placeholder="Enter bank name"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
          </div>

          {/* Row 4: Account Number */}
          <div className="flex flex-col gap-1.5 sm:w-1/2 sm:pr-2">
            <label className="text-stone-700 text-sm font-medium">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* Row 5: Assign Projects & Accounts */}
          {/* <div className="flex flex-col gap-5">
            <ProjectSearchInput 
              selectedProjects={selectedProjects}
              onChange={setSelectedProjects}
            />
            <AccountSearchInput 
              selectedAccounts={selectedAccounts}
              onChange={setSelectedAccounts}
            />
          </div> */}

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
            >
              Add Tasker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
