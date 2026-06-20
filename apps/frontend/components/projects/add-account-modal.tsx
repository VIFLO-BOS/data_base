'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getAccounts, createAccount, Account } from '../../services/account-service';
import { getTaskers, Tasker } from '../../services/tasker-service';
import { assignAccountToProject, assignTaskerToProject, replaceTaskersForAccountProject } from '../../services/project-service';
import { showError, showSuccess } from '@/lib/toast';
import toast from 'react-hot-toast';

interface AddAccountModalProps {
  projectId: string;
  projectName: string;
  assignedAccounts?: any[];
  assignedTaskers?: any[];
  onClose: () => void;
  onAccountAdded: () => void;
  initialAccount?: any;
  initialTaskers?: any[];
}

/**
 * AddAccountModal Component
 * Modal form for adding an account to a project.
 */
export function AddAccountModal({
  projectId,
  projectName,
  assignedAccounts = [],
  assignedTaskers = [],
  initialAccount,
  initialTaskers,
  onClose,
  onAccountAdded,
}: AddAccountModalProps) {
  const isEditMode = !!initialAccount;

  // ---- data ----
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [taskers, setTaskers] = useState<Tasker[]>([]);

  // ---- selections ----
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccount || null);
  const [selectedTaskers, setSelectedTaskers] = useState<Tasker[]>(initialTaskers || []);

  // ---- search inputs ----
  const [accountSearch, setAccountSearch] = useState('');
  const [taskerSearch, setTaskerSearch] = useState('');

  // ---- dropdown visibility ----
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showTaskerDropdown, setShowTaskerDropdown] = useState(false);

  // ---- loading ----
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- create account mode ----
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ---- refs for click-outside ----
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const taskerDropdownRef = useRef<HTMLDivElement>(null);

  // ---- load data ----
  useEffect(() => {
    getAccounts(1, 100)
      .then(setAccounts)
      .catch((err) => showError(err, 'Failed to load accounts'));
    getTaskers(1, 100)
      .then(setTaskers)
      .catch((err) => showError(err, 'Failed to load taskers'));
  }, []);

  // ---- click outside ----
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (taskerDropdownRef.current && !taskerDropdownRef.current.contains(e.target as Node)) {
        setShowTaskerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---- filtered lists ----
  const filteredAccounts = accounts.filter((a) => {
    return a.name.toLowerCase().includes(accountSearch.toLowerCase());
  });

  const filteredTaskers = taskers.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    return fullName.includes(taskerSearch.toLowerCase());
  });

  // ---- submit ----
  const handleSubmit = async () => {
    if (!showCreateForm && !selectedAccount) {
      toast.error('Please select an account');
      return;
    }
    if (showCreateForm && !accountSearch.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && initialAccount?.id) {
        // Edit mode: just replace the taskers for this account on the project
        await replaceTaskersForAccountProject(
          initialAccount.id,
          projectId,
          selectedTaskers.map((t) => t.id)
        );
        showSuccess('Assignment updated successfully');
      } else {
        let finalAccountId = selectedAccount?.id;

        // if creating new, create the account first
        if (showCreateForm) {
          const newAccount = await createAccount({
            name: accountSearch.trim(),
            email: `${accountSearch.trim().toLowerCase().replace(/\s/g, '')}@example.com`,
          });
          finalAccountId = (newAccount as any).id || (newAccount as any).data?.id;
        }

        if (!finalAccountId) throw new Error('Could not determine account ID');

        // assign account to project
        await assignAccountToProject(projectId, finalAccountId);

        // assign selected taskers to the project (linked to this account)
        for (const tasker of selectedTaskers) {
          try {
            await assignTaskerToProject(projectId, tasker.id, finalAccountId);
          } catch {
            // tasker may already be assigned — ignore
          }
        }

        showSuccess(showCreateForm ? 'New account created and added' : 'Account added to project');
      }

      onAccountAdded();
      onClose();
    } catch (e) {
      showError(e, isEditMode ? 'Failed to update assignment' : 'Failed to add account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    (showCreateForm ? accountSearch.trim().length > 0 : !!selectedAccount) && !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-[495px] p-6 bg-white rounded-xl shadow-md border-0 inline-flex flex-col justify-start items-start gap-4">
        {/* Header */}
        <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border-zinc-100 inline-flex justify-between items-center">
          <div className="justify-center text-stone-900 text-2xl font-medium leading-6">
            {isEditMode ? 'Edit Account Assignment' : 'Add Account to Project'}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 flex justify-start items-center gap-[3.20px] rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Project field (read-only) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-stone-900 text-sm font-medium leading-6">
            Project
          </div>
          <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-between items-center">
            <div className="flex-1 justify-start text-stone-900 text-sm font-medium leading-6">
              {projectName}
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* Search / Create Account field */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {!isEditMode && (
            <div className="self-stretch inline-flex justify-between items-start">
              <div className="justify-start text-stone-900 text-sm font-medium leading-6">
                {showCreateForm ? 'New Account Name' : 'Search Account'}
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setSelectedAccount(null);
                  setAccountSearch('');
                }}
                className="p-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-600 flex justify-center items-center gap-1.5 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <div className="justify-start text-indigo-600 text-xs font-medium leading-4">
                  {showCreateForm ? 'Search Existing' : 'Add New Account'}
                </div>
                {!showCreateForm && <Plus className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            </div>
          )}

          {isEditMode && (
            <div className="self-stretch justify-start text-stone-900 text-sm font-medium leading-6">
              Account Name
            </div>
          )}

          <div className="relative w-full" ref={accountDropdownRef}>
            <div
              className={`self-stretch h-14 px-5 bg-white rounded-2xl outline outline-offset-[-1px] inline-flex justify-start items-center gap-3 w-full transition-all ${
                isEditMode
                  ? 'bg-zinc-50 outline-1 outline-zinc-200 cursor-not-allowed opacity-80'
                  : showAccountDropdown
                  ? 'outline-[2px] outline-indigo-400 cursor-text'
                  : 'outline-1 outline-zinc-200 cursor-text'
              }`}
              onClick={() => {
                if (!isEditMode) setShowAccountDropdown(true);
              }}
            >
              {!isEditMode && <Search className={`w-5 h-5 flex-shrink-0 ${showCreateForm ? 'text-indigo-400' : 'text-stone-400'}`} />}
              {isEditMode ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-900 truncate">
                    {initialAccount?.name}
                  </span>
                </div>
              ) : !showCreateForm && selectedAccount ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-900 truncate">
                    {selectedAccount.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAccount(null);
                      setAccountSearch('');
                    }}
                    className="p-0.5 rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => {
                    setAccountSearch(e.target.value);
                    setShowAccountDropdown(true);
                  }}
                  onFocus={() => setShowAccountDropdown(true)}
                  placeholder={showCreateForm ? 'Enter new account name' : 'Search here'}
                  className="flex-1 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 outline-none"
                />
              )}
            </div>

            {/* Account Dropdown */}
            {showAccountDropdown && !selectedAccount && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-zinc-200 shadow-lg max-h-48 overflow-y-auto z-30">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const isAssigned = assignedAccounts.some((acc) => acc.id === account.id);
                    return (
                      <button
                        key={account.id}
                        onClick={() => {
                          if (isAssigned) return;
                          setSelectedAccount(account);
                          setAccountSearch('');
                          setShowAccountDropdown(false);
                          setShowCreateForm(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between first:rounded-t-xl last:rounded-b-xl ${
                          isAssigned
                            ? 'bg-zinc-50 text-stone-400 cursor-not-allowed'
                            : 'text-stone-700 hover:bg-indigo-50 cursor-pointer'
                        }`}
                      >
                        <span className="truncate">{account.name}</span>
                        {isAssigned && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Assigned
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-stone-400">No accounts found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Tasker(s) field */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-stone-900 text-sm font-medium leading-6">
            Assigned Tasker(s)
          </div>

          <div className="relative w-full" ref={taskerDropdownRef}>
            <div
              className={`self-stretch h-14 px-5 bg-white rounded-2xl outline outline-offset-[-1px] inline-flex justify-start items-center gap-3 w-full cursor-text transition-all ${
                showTaskerDropdown
                  ? 'outline-[2px] outline-indigo-400'
                  : 'outline-1 outline-zinc-200'
              }`}
              onClick={() => setShowTaskerDropdown(true)}
            >
              <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
              <input
                type="text"
                value={taskerSearch}
                onChange={(e) => {
                  setTaskerSearch(e.target.value);
                  setShowTaskerDropdown(true);
                }}
                onFocus={() => setShowTaskerDropdown(true)}
                placeholder="Search here"
                className="flex-1 bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 outline-none"
              />
            </div>

            {/* Selected Taskers below the input */}
            {selectedTaskers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTaskers.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white outline outline-1 outline-zinc-200 text-stone-700 rounded-full text-xs font-medium shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                  >
                    {t.firstName} {t.lastName}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskers((prev) => prev.filter((x) => x.id !== t.id));
                      }}
                      className="flex items-center justify-center cursor-pointer text-stone-900 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tasker Dropdown */}
            {showTaskerDropdown && (
              <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-xl border border-zinc-200 shadow-lg max-h-48 overflow-y-auto z-30">
                {filteredTaskers.length > 0 ? (
                  filteredTaskers.map((tasker) => {
                    const isSelected = selectedTaskers.some((t) => t.id === tasker.id);
                    const isAssigned = assignedTaskers.some((t) => t.id === tasker.id);
                    return (
                      <button
                        key={tasker.id}
                        onClick={() => {
                          if (isAssigned) return;
                          if (isSelected) {
                            setSelectedTaskers((prev) => prev.filter((t) => t.id !== tasker.id));
                          } else {
                            setSelectedTaskers((prev) => [...prev, tasker]);
                          }
                          setTaskerSearch('');
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between first:rounded-t-xl last:rounded-b-xl ${
                          isAssigned
                            ? 'bg-zinc-50 text-stone-400 cursor-not-allowed'
                            : isSelected
                              ? 'bg-indigo-50 text-indigo-700 cursor-pointer'
                              : 'text-stone-700 hover:bg-indigo-50 cursor-pointer'
                        }`}
                      >
                        <span>
                          {tasker.firstName} {tasker.lastName}
                        </span>
                        {isAssigned ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Assigned
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs text-indigo-500">✓</span>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-stone-400">No taskers found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`self-stretch px-4 py-3 rounded-lg inline-flex justify-center items-center gap-1.5 transition-colors cursor-pointer ${
            canSubmit
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
          }`}
        >
          <div className="justify-start text-base font-medium leading-6">
            {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Account')}
          </div>
        </button>
      </div>
    </div>
  );
}
