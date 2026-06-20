'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccountById, Account } from '../../../../../services/account-service';
import { Loader2 } from 'lucide-react';
import { AccountDetail } from '../../../../../components/accounts/account-detail';
import { updateAccount } from '../../../../../services/account-service';
import { updateAssignmentStatus, replaceAccountProjectTaskers } from '../../../../../services/assignment-service';
import { EditAccountModal } from '../../../../../components/accounts/edit-account-modal';
import { EditProjectModal } from '../../../../../components/accounts/edit-project-modal';
import { AddProjectModal } from '../../../../../components/accounts/add-project-modal';
import { assignAccountToProject } from '../../../../../services/project-service';

function formatHoursText(hours: number | string | null | undefined): string {
  if (!hours) return '0h:00m';
  const totalMins = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

export default function AccountDetailsPage({ params }: { params: Promise<{ accountId: string }> }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const resolvedParams = React.use(params);
  const accountId = resolvedParams.accountId;

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  async function fetchAccount() {
    setIsLoading(true);
    try {
      const data = await getAccountById(accountId);
      setAccount(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-zinc-500">Account not found</div>
      </div>
    );
  }

  // Calculate derived stats for AccountDetail
  const totalProjects = account.projects?.length || 0;
  const uniqueTaskers = new Set();
  account.projects?.forEach((p) => {
    p.taskers?.forEach((t: any) => uniqueTaskers.add(t.id));
  });
  const totalTaskers = uniqueTaskers.size;
  const totalHoursLogged = formatHoursText(
    account.totalHours || account.projects?.reduce((sum, p) => sum + (p.totalHours || 0), 0) || 0
  );

  return (
    <div className="flex-1 w-full mx-auto pb-12">
      <AccountDetail
        account={{
          name: account.name,
          isActive: account.status !== 'Inactive',
          dateCreated: new Date(account.createdAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          projects: account.projects || [],
          allTaskers: [], // unused in detail
          totalTaskers: totalTaskers,
          totalHoursLogged: totalHoursLogged,
        }}
        onBack={() => router.push('/admin/accounts')}
        onEditAccount={() => setIsEditAccountOpen(true)}
        onRemoveAccount={async () => {
          try {
            await updateAccount(account.id, { status: 'Inactive' });
            router.push('/admin/accounts');
          } catch (e) {
            console.error(e);
          }
        }}
        onAddProject={() => setIsAddProjectOpen(true)}
        onEditProject={(project: any) => {
          setEditingProject(project);
          setIsEditProjectOpen(true);
        }}
        onRemoveProject={async (project: any) => {
          // Add your remove project logic here or delegate
        }}
        onToggleTaskerStatus={async (projectId: string, taskerId: string, status: any) => {
          try {
            await updateAssignmentStatus(account.id, projectId, taskerId, status as any);
            await fetchAccount();
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {isEditAccountOpen && (
        <EditAccountModal
          onClose={() => setIsEditAccountOpen(false)}
          onSave={async (data) => {
            try {
              await updateAccount(account.id, { name: data.accountName });
              if (data.projectId) {
                await assignAccountToProject(data.projectId, account.id);
                await replaceAccountProjectTaskers(
                  account.id,
                  data.projectId,
                  data.taskers.map((t) => t.id)
                );
              }
              await fetchAccount();
            } catch (e) {
              console.error(e);
            }
            setIsEditAccountOpen(false);
          }}
          initialData={{
            projectId: account.projects?.[0]?.id || '',
            project: account.projects?.[0]?.name || 'Ventree',
            accountName: account.name,
            clientName: account.clientName || '',
            taskers: account.projects?.[0]?.taskers || [],
          }}
        />
      )}

      {isAddProjectOpen && (
        <AddProjectModal
          onClose={() => setIsAddProjectOpen(false)}
          onAdd={async (data) => {
            // Add project to account logic
            await fetchAccount();
            setIsAddProjectOpen(false);
          }}
        />
      )}

      {isEditProjectOpen && editingProject && (
        <EditProjectModal
          onClose={() => {
            setIsEditProjectOpen(false);
            setEditingProject(null);
          }}
          onSave={async (data) => {
            // Handle edit project save
            await fetchAccount();
            setIsEditProjectOpen(false);
            setEditingProject(null);
          }}
          initialData={{
            project: editingProject.name,
            taskers: editingProject.taskers || [],
          }}
        />
      )}
    </div>
  );
}
