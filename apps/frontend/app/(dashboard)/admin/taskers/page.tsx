'use client';

import React, { useState } from 'react';
import { TaskersHeader } from '../../../../components/taskers/taskers-header';
import { TaskersSearchFilter } from '../../../../components/taskers/taskers-search-filter';
import { TaskersTable } from '../../../../components/taskers/taskers-table';
import { Pagination } from '../../../../components/accounts/pagination';
import { AddNewTaskerModal } from '../../../../components/taskers/add-new-tasker-modal';
import { TaskerSuccessModal } from '../../../../components/taskers/tasker-success-modal';
import { TaskersEmptyState } from '../../../../components/taskers/taskers-empty-state';
import { useDashboardStore } from '../../../../store/dashboardStore';

/**
 * Admin Taskers Page
 * Lists all taskers with search, filter tabs, assigned/archived tables, and pagination.
 */
export default function TaskersPage() {
  const { taskers, addTasker } = useDashboardStore();

  const assignedTaskers = taskers
    .filter((t) => t.status === 'Assigned')
    .map((t) => ({ tasker: t.name, account: t.accountName, totalHours: 0 }));
  const archivedTaskers = taskers
    .filter((t) => t.status === 'Archived')
    .map((t) => ({ tasker: t.name, account: t.accountName, totalHours: 0 }));

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState('Assigned');
  const [search, setSearch] = useState('');

  const isEmpty = assignedTaskers.length === 0 && archivedTaskers.length === 0;

  const handleAddNewTasker = (data: any) => {
    addTasker({
      name: data.name,
      email: data.email,
      phone: data.phone,
      accountName: data.accountName,
      bank: data.bank,
      accountNumber: data.accountNumber,
      status: 'Assigned',
      projects: [],
    });
    setIsAddModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-6 w-full">
      {/* Taskers Content */}
      <div className="self-stretch px-6 flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-4">
            {/* Header */}
            <TaskersHeader
              count={assignedTaskers.length + archivedTaskers.length}
              onNewClick={() => setIsAddModalOpen(true)}
            />

            {isEmpty ? (
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

                {/* Assigned Taskers Table */}
                <TaskersTable
                  taskers={assignedTaskers.filter((t) =>
                    t.tasker.toLowerCase().includes(search.toLowerCase()),
                  )}
                  totalCount={assignedTaskers.length}
                  filterLabel="Total Assigned Taskers"
                  projectFilter="Ventree"
                />

                {/* Pagination for Assigned */}
                <Pagination
                  currentPage={1}
                  totalPages={Math.ceil(assignedTaskers.length / 9) || 1}
                  totalItems={assignedTaskers.length}
                  itemsPerPage={9}
                />

                {/* Archived Taskers Table */}
                <TaskersTable
                  taskers={archivedTaskers.filter((t) =>
                    t.tasker.toLowerCase().includes(search.toLowerCase()),
                  )}
                  totalCount={archivedTaskers.length}
                  filterLabel="Archived"
                  isArchived={true}
                />

                {/* Pagination for Archived */}
                <Pagination
                  currentPage={1}
                  totalPages={Math.ceil(archivedTaskers.length / 9) || 1}
                  totalItems={archivedTaskers.length}
                  itemsPerPage={9}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddNewTaskerModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddNewTasker} />
      )}

      {isSuccessModalOpen && <TaskerSuccessModal onClose={() => setIsSuccessModalOpen(false)} />}
    </div>
  );
}
