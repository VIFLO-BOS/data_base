'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshOnFocus, notifyDataMutated } from '../../../../hooks/use-refresh-on-focus';
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
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccountPermanently,
  Account,
} from '../../../../services/account-service';
import {
  createProject,
  updateProject,
  deleteProject,
  assignAccountToProject,
  removeAccountFromProject,
} from '../../../../services/project-service';
import {
  replaceAccountProjectTaskers,
  updateAssignmentStatus,
} from '../../../../services/assignment-service';
import { Loader2 } from 'lucide-react';

function formatHoursText(hours: number | string | null | undefined): string {
  if (!hours) return '0h:00m';
  const totalMins = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

/**
 * Admin Accounts Page
 * Full accounts lifecycle: empty state → list (All/Active/Archived) → detail view.
 */
export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mappedAccounts = accounts.map((a) => {
    // Determine all taskers across all real projects for this account
    const allTaskers = Array.from(
      new Map(
        (a.projects || [])
          .flatMap((p: any) => (p.taskers || []).map((t: any) => ({ ...t, projectName: p.name })))
          .map((t: any) => [t.id, t]),
      ).values(),
    );
    const assignedTaskerStr =
      allTaskers.length > 0
        ? `${allTaskers.length} Tasker${allTaskers.length === 1 ? '' : 's'}`
        : '0 Taskers';

    // To support legacy dummy data, we fall back to settings.projects if a.projects is empty
    const renderProjects =
      a.projects && a.projects.length > 0
        ? a.projects.map((p: any) => {
          const uniqueTaskers = p.taskers
            ? Array.from(new Map(p.taskers.map((t: any) => [t.id, t])).values())
            : [];
          const taskerRows = uniqueTaskers.map((t: any) => ({
            id: t.id,
            name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email || 'Tasker',
            status: t.assignmentStatus || t.status || 'active',
            hours: Number(t.hours ?? 0),
          }));
          return {
            id: p.id,
            name: p.name,
            assignedTaskers: taskerRows.map((t) => t.name).join(' & ') || 'No taskers',
            totalHours: formatHoursText(p.totalHours || 0),
            taskers: taskerRows,
          };
        })
        : [];

    return {
      ...a,
      assignedTasker: assignedTaskerStr,
      totalHours: formatHoursText(a.totalHours || 0),
      isArchived: a.status === 'Inactive',
      dateCreated: new Date(a.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      clientName: a.name,
      totalTaskers:
        allTaskers.length ||
        a.settings?.projects?.reduce(
          (acc: number, p: any) =>
            acc + (p.assignedTaskers ? p.assignedTaskers.split(' & ').length : 0),
          0,
        ) ||
        0,
      totalHoursLogged: formatHoursText(a.totalHours || 0),
      projects: renderProjects,
      allTaskers: allTaskers,
    };
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const list = await getAccounts(1, 100);
      setAccounts(list);
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useRefreshOnFocus(fetchAccounts);

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
    id?: string;
    name: string;
    assignedTaskers: string;
    taskers?: { id: string; name: string }[];
    totalHours: number | string;
  } | null>(null);

  const selectedAccount = mappedAccounts.find((a) => a.id === selectedAccountId) || null;
  const editingAccount = mappedAccounts.find((a) => a.id === editingAccountId) || null;

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

  const filters =
    mappedAccounts.length > 0 ? ['All', 'Active', 'Archived'] : ['Active', 'Inactive'];

  // --- Handlers ---
  async function handleCreateAccount(data: {
    projectId?: string;
    projectName?: string;
    isNewProject: boolean;
    accountId?: string;
    accountName: string;
    clientName: string;
    taskers: { id: string; name: string }[];
  }) {
    try {
      let createdAccountId = data.accountId;
      let newAccountName = data.accountName;

      if (!createdAccountId) {
        const response = await createAccount({
          name: data.accountName,
          email: `${data.accountName.toLowerCase().replace(/\s/g, '')}@example.com`,
        });
        const newAccount = response as any;
        createdAccountId = newAccount.id || newAccount.data?.id;
        newAccountName = newAccount.name || data.accountName;
      }

      let targetProjectId = data.projectId;

      if (data.isNewProject && data.projectName) {
        const newProject = await createProject({
          name: data.projectName,
          description: `Created via Account ${newAccountName}`,
          taskerIds: data.taskers.map((t) => t.id),
        });
        targetProjectId = (newProject as any).id || (newProject as any).data?.id;
      }

      if (targetProjectId && createdAccountId) {
        await assignAccountToProject(targetProjectId, createdAccountId);
        if (data.taskers?.length) {
          await replaceAccountProjectTaskers(
            createdAccountId,
            targetProjectId,
            data.taskers.map((t) => t.id),
          );
        }
      }

      await fetchAccounts();
      notifyDataMutated();
      setIsNewAccountOpen(false);
      setIsSuccessOpen(true);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleEditAccountSave(data: {
    projectId: string;
    project: string;
    accountName: string;
    clientName: string;
    taskers: { id: string; name: string }[];
  }) {
    if (editingAccount) {
      try {
        await updateAccount(editingAccount.id, { name: data.accountName });

        if (data.projectId) {
          await assignAccountToProject(data.projectId, editingAccount.id);
          await replaceAccountProjectTaskers(
            editingAccount.id,
            data.projectId,
            data.taskers.map((t) => t.id),
          );
        }

        await fetchAccounts();
        notifyDataMutated();
      } catch (e) {
        console.error(e);
      }
    }
    setIsEditAccountOpen(false);
    setEditingAccountId(null);
  }

  async function handleArchive(account: any) {
    try {
      await updateAccount(account.id, { status: 'Inactive' });
      await fetchAccounts();
      notifyDataMutated();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleUnarchive(account: any) {
    try {
      await updateAccount(account.id, { status: 'Active' });
      await fetchAccounts();
      notifyDataMutated();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteAccount(account: any) {
    if (!confirm(`Permanently delete account "${account.name}"? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      await deleteAccountPermanently(account.id);
      await fetchAccounts();
      notifyDataMutated();
    } catch (e) {
      console.error('Failed to delete account', e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleView(account: any) {
    setSelectedAccountId(account.id);
  }

  function handleEditClick(account: any) {
    setEditingAccountId(account.id);
    setIsEditAccountOpen(true);
  }

  async function handleAddProjectToAccount(data: {
    projectId?: string;
    projectName?: string;
    taskers: { id: string; name: string }[];
    isNewProject: boolean;
  }) {
    if (!selectedAccount) return;
    try {
      let targetProjectId = data.projectId;

      // If the user elected to create a new project from the modal
      if (data.isNewProject && data.projectName) {
        const newProject = await createProject({
          name: data.projectName,
          description: `Created via Account ${selectedAccount.name}`,
          taskerIds: data.taskers.map((t) => t.id),
        });
        targetProjectId = (newProject as any).id || (newProject as any).data?.id;
      }

      if (targetProjectId) {
        await assignAccountToProject(targetProjectId, selectedAccount.id);
        if (data.taskers?.length) {
          await replaceAccountProjectTaskers(
            selectedAccount.id,
            targetProjectId,
            data.taskers.map((t) => t.id),
          );
        }
      }
      await fetchAccounts();
    } catch (e) {
      console.error(e);
    }
    setIsAddProjectOpen(false);
  }

  async function handleEditProjectSave(data: {
    project: string;
    taskers: { id: string; name: string }[];
  }) {
    if (!selectedAccount || !editingProject) return;
    try {
      if (editingProject.id) {
        await updateProject(editingProject.id, { name: data.project });
        await replaceAccountProjectTaskers(
          selectedAccount.id,
          editingProject.id,
          data.taskers.map((t) => t.id),
        );
      } else {
        // Fallback for old dummy data
        const currentProjects = selectedAccount.projects || [];
        const updatedProjects = currentProjects.map((p: any) =>
          p.name === editingProject.name
            ? {
              ...p,
              name: data.project,
              assignedTaskers: data.taskers.map((t) => t.name).join(' & '),
            }
            : p,
        );
        await updateAccount(selectedAccount.id, { settings: { projects: updatedProjects } } as any);
      }
      await fetchAccounts();
    } catch (e) {
      console.error(e);
    }
    setIsEditProjectOpen(false);
    setEditingProject(null);
  }

  async function handleRemoveProject(project: any) {
    if (!selectedAccount) return;
    try {
      if (project.id) {
        // Only remove the relationship, don't delete the project itself
        await removeAccountFromProject(project.id, selectedAccount.id);
      } else {
        const currentProjects = selectedAccount.projects || [];
        const filteredProjects = currentProjects.filter((p: any) => p.name !== project.name);
        await updateAccount(selectedAccount.id, {
          settings: { projects: filteredProjects },
        } as any);
      }
      await fetchAccounts();
    } catch (e) {
      console.error(e);
    }
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
            allTaskers: selectedAccount.allTaskers || [],
            totalTaskers: selectedAccount.totalTaskers || 0,
            totalHoursLogged: selectedAccount.totalHoursLogged || 0,
          }}
          onBack={() => setSelectedAccountId(null)}
          onEditAccount={() => handleEditClick(selectedAccount)}
          onRemoveAccount={async () => {
            try {
              await updateAccount(selectedAccount.id, { status: 'Inactive' });
              await fetchAccounts();
            } catch (e) {
              console.error(e);
            }
            setSelectedAccountId(null);
          }}
          onAddProject={() => setIsAddProjectOpen(true)}
          onEditProject={(project: React.SetStateAction<{ id?: string | undefined; name: string; assignedTaskers: string; taskers?: { id: string; name: string; }[] | undefined; totalHours: number | string; } | null>) => {
            setEditingProject(project as any);
            setIsEditProjectOpen(true);
          }}
          onRemoveProject={handleRemoveProject}
          onToggleTaskerStatus={async (projectId: string, taskerId: string, status: any) => {
            if (!selectedAccount) return;
            try {
              await updateAssignmentStatus(selectedAccount.id, projectId, taskerId, status as any);
              await fetchAccounts();
            } catch (e) {
              console.error(e);
            }
          }}
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
              taskers: editingProject.taskers || [],
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
            onSave={handleEditAccountSave}
            initialData={{
              projectId: editingAccount.projects?.[0]?.id || '',
              project: editingAccount.projects?.[0]?.name || 'Ventree',
              accountName: editingAccount.name,
              clientName: editingAccount.clientName || '',
              taskers: editingAccount.projects?.[0]?.taskers || [],
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
        <AccountsHeader
          count={mappedAccounts.length}
          onNewClick={() => setIsNewAccountOpen(true)}
        />

        {/* Search & Filter */}
        <AccountsSearchFilter
          activeFilter={activeFilter}
          filters={filters}
          onFilterChange={setActiveFilter}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Empty or Populated */}
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : mappedAccounts.length === 0 ? (
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
              onDelete={handleDeleteAccount}
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
          onSave={handleEditAccountSave}
          initialData={{
            projectId: editingAccount.projects?.[0]?.id || '',
            project: editingAccount.projects?.[0]?.name || 'Ventree',
            accountName: editingAccount.name,
            clientName: editingAccount.clientName || '',
            taskers: editingAccount.projects?.[0]?.taskers || [],
          }}
        />
      )}

      {isSuccessOpen && <AccountSuccessModal onClose={() => setIsSuccessOpen(false)} />}
    </div>
  );
}
