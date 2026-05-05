'use client';

import React, { useState } from 'react';
import { AccountsHeader } from '../../../../components/accounts/accounts-header';
import { AccountsSearchFilter } from '../../../../components/accounts/accounts-search-filter';
import { AllAccountsTable } from '../../../../components/accounts/all-accounts-table';
import { Pagination } from '../../../../components/accounts/pagination';
import { AccountsEmptyState } from '../../../../components/accounts/accounts-empty-state';
import { AddNewAccountModal } from '../../../../components/accounts/add-new-account-modal';
import { EditAccountModal } from '../../../../components/accounts/edit-account-modal';
import { AccountSuccessModal } from '../../../../components/accounts/account-success-modal';
import { AccountDetail } from '../../../../components/accounts/account-detail';
import { AddProjectModal } from '../../../../components/accounts/add-project-modal';
import { EditProjectModal } from '../../../../components/accounts/edit-project-modal';
import { useDashboardStore } from '../../../../store/dashboardStore';

/**
 * Admin Accounts Page
 * Full accounts lifecycle: empty state → list (All/Active/Archived) → detail view.
 */
export default function AccountsPage() {
  const { accounts, addAccount, updateAccount } = useDashboardStore();

  // Ensure accounts have necessary mapped UI properties
  const mappedAccounts = accounts.map(a => ({
    ...a,
    assignedTasker: a.name === 'MAGS' ? 'Sarah Doe & Bill doe' : 'Bill Doe',
    totalHours: a.name === 'MAGS' ? 30 : 10,
    isArchived: a.status === 'Inactive',
    dateCreated: 'Mon, April 22 2025',
    clientName: a.name + ' Corp',
    totalTaskers: a.name === 'MAGS' ? 2 : 1,
    totalHoursLogged: a.name === 'MAGS' ? 30 : 10,
    projects: a.projects.map(p => ({ name: p, assignedTaskers: 'Sarah Doe', totalHours: 10 }))
  }));

  // --- UI State ---
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modal State ---
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // --- Detail View State ---
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<{
    name: string;
    assignedTaskers: string;
    totalHours: number;
  } | null>(null);

  const selectedAccount = mappedAccounts.find(a => a.id === selectedAccountId) || null;
  const editingAccount = mappedAccounts.find(a => a.id === editingAccountId) || null;

  // --- Filtering ---
  const filteredAccounts = mappedAccounts.filter((a) => {
    // Search filter
    if (searchValue && !a.name.toLowerCase().includes(searchValue.toLowerCase())) return false;
    // Tab filter
    if (activeFilter === 'Active') return !a.isArchived;
    if (activeFilter === 'Archived') return a.isArchived;
    return true; // "All"
  });

  const activeCount = mappedAccounts.filter((a) => !a.isArchived).length;
  const archivedCount = mappedAccounts.filter((a) => a.isArchived).length;

  function getFilterLabel() {
    if (activeFilter === 'Active') return 'Total Active Accounts';
    if (activeFilter === 'Archived') return 'Total Archived Accounts';
    return 'All Accounts';
  }

  function getFilterCount() {
    if (activeFilter === 'Active') return activeCount;
    if (activeFilter === 'Archived') return archivedCount;
    return mappedAccounts.length;
  }

  const filters = mappedAccounts.length > 0 ? ['All', 'Active', 'Archived'] : ['Active', 'Inactive'];

  // --- Handlers ---
  function handleCreateAccount(data: {
    project: string;
    accountName: string;
    clientName: string;
    taskers: string[];
  }) {
    addAccount({
      name: data.accountName.toUpperCase(),
      status: 'Active',
      projects: data.project ? [data.project] : [],
    });
    setIsNewAccountOpen(false);
    setIsSuccessOpen(true);
  }

  function handleEditAccount(data: {
    project: string;
    accountName: string;
    clientName: string;
    taskers: string[];
  }) {
    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: data.accountName.toUpperCase(),
        projects: data.project ? [data.project] : []
      });
    }
    setIsEditAccountOpen(false);
    setEditingAccountId(null);
  }

  function handleArchive(account: any) {
    updateAccount(account.id, { status: 'Inactive' });
  }

  function handleUnarchive(account: any) {
    updateAccount(account.id, { status: 'Active' });
  }

  function handleView(account: any) {
    setSelectedAccountId(account.id);
  }

  function handleEditClick(account: any) {
    setEditingAccountId(account.id);
    setIsEditAccountOpen(true);
  }

  function handleAddProjectToAccount(data: { project: string; taskers: string[] }) {
    if (!selectedAccount) return;
    updateAccount(selectedAccount.id, {
      projects: [...selectedAccount.projects.map(p => p.name), data.project]
    });
    setIsAddProjectOpen(false);
  }

  function handleEditProjectSave(data: { project: string; taskers: string[] }) {
    if (!selectedAccount || !editingProject) return;
    updateAccount(selectedAccount.id, {
      projects: selectedAccount.projects.map(p => p.name === editingProject.name ? data.project : p.name)
    });
    setIsEditProjectOpen(false);
    setEditingProject(null);
  }

  function handleRemoveProject(project: {
    name: string;
    assignedTaskers: string;
    totalHours: number;
  }) {
    if (!selectedAccount) return;
    updateAccount(selectedAccount.id, {
      projects: selectedAccount.projects.filter(p => p.name !== project.name).map(p => p.name)
    });
  }

  // =============== RENDER ===============

  // Detail View
  if (selectedAccount) {
    return (
      <div className="flex-1 flex flex-col gap-6 w-full">
        <AccountDetail
          account={{
            name: selectedAccount.name,
            isActive: !selectedAccount.isArchived,
            dateCreated: selectedAccount.dateCreated || 'N/A',
            projects: selectedAccount.projects || [],
            totalTaskers: selectedAccount.totalTaskers || 0,
            totalHoursLogged: selectedAccount.totalHoursLogged || 0,
          }}
          onBack={() => setSelectedAccountId(null)}
          onEditAccount={() => handleEditClick(selectedAccount)}
          onRemoveAccount={() => {
            updateAccount(selectedAccount.id, { status: 'Inactive' }); // Mock removal
            setSelectedAccountId(null);
          }}
          onAddProject={() => setIsAddProjectOpen(true)}
          onEditProject={(project) => {
            setEditingProject(project);
            setIsEditProjectOpen(true);
          }}
          onRemoveProject={handleRemoveProject}
        />

        {/* Add Project Modal */}
        {isAddProjectOpen && (
          <AddProjectModal
            onClose={() => setIsAddProjectOpen(false)}
            onAdd={handleAddProjectToAccount}
          />
        )}

        {/* Edit Project Modal */}
        {isEditProjectOpen && editingProject && (
          <EditProjectModal
            onClose={() => {
              setIsEditProjectOpen(false);
              setEditingProject(null);
            }}
            onSave={handleEditProjectSave}
            initialData={{
              project: editingProject.name,
              taskers: editingProject.assignedTaskers.split(' & ').filter(Boolean),
            }}
          />
        )}

        {/* Edit Account Modal (from detail header) */}
        {isEditAccountOpen && editingAccount && (
          <EditAccountModal
            onClose={() => {
              setIsEditAccountOpen(false);
              setEditingAccountId(null);
            }}
            onSave={handleEditAccount}
            initialData={{
              project: editingAccount.projects?.[0]?.name || 'Ventree',
              accountName: editingAccount.name,
              clientName: editingAccount.clientName || '',
              taskers: editingAccount.assignedTasker.split(' & ').filter(Boolean),
            }}
          />
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 flex flex-col gap-4">
        {/* Header */}
        <AccountsHeader count={mappedAccounts.length} onNewClick={() => setIsNewAccountOpen(true)} />

        {/* Search & Filter */}
        <AccountsSearchFilter
          activeFilter={activeFilter}
          filters={filters}
          onFilterChange={setActiveFilter}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Empty or Populated */}
        {mappedAccounts.length === 0 ? (
          <AccountsEmptyState onCreateClick={() => setIsNewAccountOpen(true)} />
        ) : (
          <>
            {/* Accounts Table */}
            <AllAccountsTable
              accounts={filteredAccounts}
              totalCount={getFilterCount()}
              filterLabel={getFilterLabel()}
              projectFilter="Ventree"
              activeTab={activeFilter}
              onView={handleView}
              onEdit={handleEditClick}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(mappedAccounts.length / 9) || 1}
              totalItems={mappedAccounts.length}
              itemsPerPage={9}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {isNewAccountOpen && (
        <AddNewAccountModal
          onClose={() => setIsNewAccountOpen(false)}
          onCreate={handleCreateAccount}
        />
      )}

      {isEditAccountOpen && editingAccount && (
        <EditAccountModal
          onClose={() => {
            setIsEditAccountOpen(false);
            setEditingAccountId(null);
          }}
          onSave={handleEditAccount}
          initialData={{
            project: editingAccount.projects?.[0]?.name || 'Ventree',
            accountName: editingAccount.name,
            clientName: editingAccount.clientName || '',
            taskers: editingAccount.assignedTasker.split(' & ').filter(Boolean),
          }}
        />
      )}

      {isSuccessOpen && <AccountSuccessModal onClose={() => setIsSuccessOpen(false)} />}
    </div>
  );
}
