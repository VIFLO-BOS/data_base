'use client';

import React, { useState } from 'react';
import { TaskersHeader } from '../../../../components/taskers/taskers-header';
import { TaskersSearchFilter } from '../../../../components/taskers/taskers-search-filter';
import { TaskersTable } from '../../../../components/taskers/taskers-table';
import { Pagination } from '../../../../components/accounts/pagination';
import { TaskerSuccessModal } from '../../../../components/taskers/tasker-success-modal';
import { TaskersEmptyState } from '../../../../components/taskers/taskers-empty-state';
import { EditTaskerModal } from '../../../../components/taskers/edit-tasker-modal';
import {
  getTaskers,
  createTasker,
  updateTasker,
  Tasker,
} from '../../../../services/tasker-service';
import { Loader2 } from 'lucide-react';
import { AddNewTaskerModal } from '@/components/taskers/add-new-tasker-modal';
import { assignTaskerToProject } from '@/services/project-service';
import { useRouter } from 'next/navigation';

/**
 * Admin Taskers Page
 * Lists all taskers with search, filter tabs, assigned/archived tables, and pagination.
 * Archived table is hidden by default until the user clicks the "Unassigned" filter tab.
 */
export default function TaskersPage() {
  const router = useRouter();
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const assignedTaskers = taskers
    .filter((t) => t.status !== 'Archived' && t.status !== 'Inactive' && t.status !== 'inactive')
    .map((t) => {
      const allAccounts = t.projects?.flatMap((p: any) => p.accounts?.map((a: any) => a.name) || []) || [];
      const accountNames = Array.from(new Set(allAccounts.filter(Boolean)));
      return {
        id: t.id,
        tasker: `${t.firstName} ${t.lastName}`,
        account: accountNames.length > 0 ? accountNames.join(', ') : 'Unassigned',
        totalHours: t.totalHours || 0,
      };
    });
  const archivedTaskers = taskers
    .filter((t) => t.status === 'Archived' || t.status === 'Inactive' || t.status === 'inactive')
    .map((t) => {
      const allAccounts = t.projects?.flatMap((p: any) => p.accounts?.map((a: any) => a.name) || []) || [];
      const accountNames = Array.from(new Set(allAccounts.filter(Boolean)));
      return {
        id: t.id,
        tasker: `${t.firstName} ${t.lastName}`,
        account: accountNames.length > 0 ? accountNames.join(', ') : 'Unassigned',
        totalHours: t.totalHours || 0,
      };
    });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTasker, setEditingTasker] = useState<any>(null);

  React.useEffect(() => {
    fetchTaskers();
  }, []);

  const fetchTaskers = async () => {
    setIsLoading(true);
    try {
      const response = await getTaskers(1, 100);
      setTaskers((response as any).data?.data || []);
    } catch (error) {
      console.error('Failed to fetch taskers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [activeFilter, setActiveFilter] = useState('Assigned');
  const [search, setSearch] = useState('');

  const isEmpty = assignedTaskers.length === 0 && archivedTaskers.length === 0;

  const handleAddNewTasker = async (data: any) => {
    try {
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const response = await createTasker({
        firstName,
        lastName,
        email: data.email || `${firstName.toLowerCase()}@example.com`,
        phone: data.phone,
        bankName: data.bank,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
      });
      const createdTaskerId = (response as any).id || (response as any).data?.id;

      if (createdTaskerId && data.projects && data.projects.length > 0) {
        for (const p of data.projects) {
          await assignTaskerToProject(p.id, createdTaskerId);
        }
      }

      await fetchTaskers();
      setIsAddModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTasker = async (data: any) => {
    if (!editingTasker) return;
    try {
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await updateTasker(editingTasker.id, {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        bankName: data.bank,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
      });

      if (data.projects && data.projects.length > 0) {
        for (const p of data.projects) {
          await assignTaskerToProject(p.id, editingTasker.id);
        }
      }

      await fetchTaskers();
      setIsEditModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (row: any) => {
    try {
      await updateTasker(row.id, { status: 'Inactive' });
      await fetchTaskers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnarchive = async (row: any) => {
    try {
      await updateTasker(row.id, { status: 'Active' });
      await fetchTaskers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-6 w-full">
      {/* Taskers Content */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-4">
            {/* Header */}
            <TaskersHeader
              count={assignedTaskers.length + archivedTaskers.length}
              onNewClick={() => setIsAddModalOpen(true)}
            />

            {isLoading ? (
              <div className="w-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : isEmpty ? (
              <div className="w-full flex flex-col items-center py-12 gap-8">
                <TaskersSearchFilter
                  activeFilter={activeFilter}
                  filters={['All', 'Active', 'Inactive']}
                  onFilterChange={setActiveFilter}
                  onSearchChange={setSearch}
                />
                <TaskersEmptyState onAddClick={() => setIsAddModalOpen(true)} />
              </div>
            ) : (
              <>
                {/* Search & Filter */}
                <TaskersSearchFilter
                  activeFilter={activeFilter}
                  filters={['Assigned', 'Unassigned']}
                  onFilterChange={setActiveFilter}
                  onSearchChange={setSearch}
                />

                {/* Show Assigned Taskers Table when "Assigned" is active */}
                {activeFilter === 'Assigned' && (
                  <>
                    <TaskersTable
                      taskers={assignedTaskers.filter((t) =>
                        t.tasker.toLowerCase().includes(search.toLowerCase()),
                      )}
                      totalCount={assignedTaskers.length}
                      filterLabel="Total Assigned Taskers"
                      projectFilter="Ventree"
                      onArchive={handleArchive}
                      onEdit={(row) => {
                        setEditingTasker(row);
                        setIsEditModalOpen(true);
                      }}
                      onView={(row) => {
                        router.push(`/admin/taskers/${row.id}`);
                      }}
                    />
                    <Pagination
                      currentPage={1}
                      totalPages={Math.ceil(assignedTaskers.length / 9) || 1}
                      totalItems={assignedTaskers.length}
                      itemsPerPage={9}
                    />
                  </>
                )}

                {/* Show Archived Taskers Table ONLY when "Unassigned" is active */}
                {activeFilter === 'Unassigned' && (
                  <>
                    <TaskersTable
                      taskers={archivedTaskers.filter((t) =>
                        t.tasker.toLowerCase().includes(search.toLowerCase()),
                      )}
                      totalCount={archivedTaskers.length}
                      filterLabel="Archived"
                      isArchived={true}
                      onUnarchive={handleUnarchive}
                      onEdit={(row) => {
                        setEditingTasker(row);
                        setIsEditModalOpen(true);
                      }}
                      onView={(row) => {
                        router.push(`/admin/taskers/${row.id}`);
                      }}
                    />
                    <Pagination
                      currentPage={1}
                      totalPages={Math.ceil(archivedTaskers.length / 9) || 1}
                      totalItems={archivedTaskers.length}
                      itemsPerPage={9}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddNewTaskerModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddNewTasker} />
      )}

      {isEditModalOpen && editingTasker && (
        <EditTaskerModal
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditTasker}
          initialData={editingTasker}
        />
      )}

      {isSuccessModalOpen && <TaskerSuccessModal onClose={() => setIsSuccessModalOpen(false)} />}
    </div>
  );
}
