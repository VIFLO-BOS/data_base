'use client';

/**
 * Project Details Page
 * Matches the original Figma design with:
 *  - Breadcrumb navigation (Projects > ProjectName)
 *  - Project header card with name, status dot, kebab menu
 *  - Date Created & Website link info cards
 *  - Stats row: Total Accounts, Total Taskers, Total Hours Logged
 *  - Accounts table with tabs (All/Active/Archived), Add Account button, row actions
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProjectById,
  updateProject,
  deleteProject,
  removeAccountFromProject,
  Project,
} from '../../../../../services/project-service';
import { Loader2, MoreVertical, Plus } from 'lucide-react';
import { EditProjectModal } from '../../../../../components/projects/edit-project-modal';
import { AddAccountModal } from '../../../../../components/projects/add-account-modal';
import toast from 'react-hot-toast';

// ---------- formatting helpers ----------
function formatHoursText(hours: number | string | null | undefined): string {
  if (!hours) return '0h:00m';
  const totalMins = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

// ---------- tiny dropdown helpers ----------
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ==========================================
// PAGE
// ==========================================
export default function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // header kebab menu
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(headerMenuRef, () => setHeaderMenuOpen(false));

  // accounts table tab
  const [accountsTab, setAccountsTab] = useState<'all' | 'active' | 'archived'>('all');

  // row-level kebab menus (keyed by account id)
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const [editAccountState, setEditAccountState] = useState<{ account: any; taskers: any[] } | null>(null);
  useClickOutside(rowMenuRef, () => setOpenRowMenu(null));

  // ---------- data loading ----------
  async function load() {
    try {
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);


  // ---------- handlers ----------
  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateProject(id, updates);
      setProject({ ...project, ...updates });
      setIsEditModalOpen(false);
      toast.success('Project updated successfully');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update project');
    }
  };

  const handleRemoveProject = async () => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    try {
      await deleteProject(projectId);
      toast.success('Project removed');
      router.push('/admin/projects');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove project');
    }
  };

  const handleArchiveAccount = async (accountId: string) => {
    try {
      await removeAccountFromProject(projectId, accountId);
      // reload
      const data = await getProjectById(projectId);
      setProject(data);
      toast.success('Account archived from project');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to archive account');
    }
    setOpenRowMenu(null);
  };

  // ---------- loading / error states ----------
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-zinc-500">Project not found</div>
      </div>
    );
  }

  // ---------- derived data ----------
  // The backend returns accounts and accountAssignments separately.
  // Merge tasker info from accountAssignments into each account object.
  const rawAccounts: any[] =
    project.accounts?.length > 0 ? project.accounts : project.account ? [project.account] : [];

  const assignmentsByAccountId = new Map<string, any[]>();
  if (project.accountAssignments) {
    for (const aa of project.accountAssignments) {
      const accountId = aa.account?.id;
      if (accountId) {
        const taskerList = (aa.taskers || []).map((t: any) => ({
          id: t.tasker?.id || t.taskerId || t.id,
          firstName: t.tasker?.user?.firstName || t.tasker?.firstName || t.firstName || '',
          lastName: t.tasker?.user?.lastName || t.tasker?.lastName || t.lastName || '',
          email: t.tasker?.user?.email || t.tasker?.email || t.email || '',
          hours: t.hours ?? 0,
        }));
        assignmentsByAccountId.set(accountId, taskerList);
      }
    }
  }

  const projectAccounts: any[] = rawAccounts.map((account: any) => {
    const taskers = account.taskers?.length ? account.taskers : assignmentsByAccountId.get(account.id) || [];
    const accountTotalHours = taskers.reduce((sum: number, t: any) => sum + (Number(t.hours) || 0), 0);
    return {
      ...account,
      taskers,
      totalHours: account.totalHours ?? accountTotalHours,
    };
  });

  const filteredAccounts =
    accountsTab === 'all'
      ? projectAccounts
      : projectAccounts.filter((a: any) => (a.status || 'active').toLowerCase() === accountsTab);

  const totalHoursLogged =
    project.totalHours ??
    project.totalHoursLogged ??
    projectAccounts.reduce((sum: number, a: any) => sum + (a.totalHours ?? 0), 0);

  const dateCreated = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '—';

  const websiteLink = project.platformUrl || project.websiteLink || '';

  return (
    <div className="flex-1 flex flex-col gap-6 w-full  mx-auto">
      {/* ---- Breadcrumb ---- */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/projects" className="hover:text-indigo-600 transition-colors">
          Projects
        </Link>
        <span className="text-zinc-400">{'>'}</span>
        <span className="text-indigo-600 font-medium">{project.name}</span>
      </nav>

      {/* ================================================ */}
      {/* PROJECT HEADER CARD                              */}
      {/* ================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6 flex flex-col gap-4">
        {/* title row */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-stone-900 leading-6">{project.name}</h1>
            {/* green status dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-30" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>

          {/* kebab menu */}
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setHeaderMenuOpen((v) => !v)}
              className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 text-stone-600" />
            </button>
            {headerMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-20">
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    handleRemoveProject();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* info cards row – Date Created & Website link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-zinc-100 flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-500 leading-6">Date Created</span>
            <span className="text-base font-medium text-stone-700 leading-6">{dateCreated}</span>
          </div>
          <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-zinc-100 flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-500 leading-6">Website link</span>
            {websiteLink ? (
              <a
                href={websiteLink.startsWith('http') ? websiteLink : `https://${websiteLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-indigo-600 underline leading-6 break-all"
              >
                {websiteLink}
              </a>
            ) : (
              <span className="text-base text-stone-400 leading-6">—</span>
            )}
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-zinc-100 flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-500 leading-6">Total Accounts</span>
            <span className="text-2xl font-medium text-stone-900 leading-6">
              {project.accountsCount ?? projectAccounts.length}
            </span>
          </div>
          <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-zinc-100 flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-500 leading-6">Total Taskers</span>
            <span className="text-2xl font-medium text-stone-900 leading-6">
              {project.taskersCount ?? project.taskers?.length ?? 0}
            </span>
          </div>
          <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-zinc-100 flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-500 leading-6">Total Hours Logged</span>
            <span className="text-2xl font-medium text-stone-900 leading-6">
              {formatHoursText(totalHoursLogged)}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* ACCOUNTS TABLE CARD                              */}
      {/* ================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6 flex flex-col gap-6">
        {/* table header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-100">
          {/* left – title + count + tabs */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-stone-900">Accounts</span>
              <span className="ml-1 h-6 min-w-[24px] px-2 flex items-center justify-center bg-gray-100 rounded-md border border-zinc-200 text-xs font-medium text-stone-900">
                {projectAccounts.length}
              </span>
            </div>

            {/* tabs */}
            <div className="flex p-0.5 bg-neutral-50 rounded-lg border border-zinc-100">
              {(['all', 'active', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAccountsTab(tab)}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${accountsTab === tab
                    ? 'bg-white shadow-sm text-stone-900'
                    : 'text-stone-500 hover:text-stone-700'
                    }`}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* right – Add Account */}
          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-600 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            Add Account
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* table */}
        <div className="flex flex-col gap-0">
          {/* column headers */}
          <div className="grid grid-cols-[2fr_2fr_1fr_40px] pb-3 border-b border-zinc-100">
            <span className="text-sm font-medium text-zinc-500">Account Name</span>
            <span className="text-sm font-medium text-zinc-500">Assigned Tasker(s)</span>
            <span className="text-sm font-medium text-zinc-500">Total Hours</span>
            <span />
          </div>

          {/* rows */}
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account: any) => {
              const taskers = account.taskers || [];
              const accountMenuKey = `account-${account.id}`;
              if (taskers.length === 0) {
                return (
                  <div
                    key={account.id}
                    className="grid grid-cols-[2fr_2fr_1fr_40px] py-3 border-b border-zinc-50 items-center"
                  >
                    <span className="text-sm font-medium text-stone-900">{account.name}</span>
                    <span className="text-sm font-medium text-zinc-400 italic">{account.taskers}</span>
                    <span className="text-sm font-medium text-stone-900">
                      {formatHoursText(account.totalHours ?? account.hoursLogged ?? 0)}
                    </span>

                    <div
                      className="relative flex justify-end"
                      ref={openRowMenu === accountMenuKey ? rowMenuRef : undefined}
                    >
                      <button
                        onClick={() =>
                          setOpenRowMenu((prev) =>
                            prev === accountMenuKey ? null : accountMenuKey,
                          )
                        }
                        className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5 text-stone-500" />
                      </button>
                      {openRowMenu === accountMenuKey && (
                        <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-20">
                          <button
                            onClick={() => {
                              setOpenRowMenu(null);
                              setEditAccountState({ account, taskers });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveAccount(account.id)}
                            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return taskers.map((t: any, tIdx: number) => {
                const rowKey = `${account.id}-${t.id || tIdx}`;

                return (
                  <div
                    key={rowKey}
                    className="grid grid-cols-[2fr_2fr_1fr_40px] py-3 border-b border-zinc-50 items-center"
                  >
                    <span className="text-sm font-medium text-stone-900">{account.name}</span>
                    <span className="text-sm font-medium text-stone-900">
                      {`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email || 'Tasker'}
                    </span>
                    <span className="text-sm font-medium text-stone-900">
                      {formatHoursText(t.hours ?? 0)}
                    </span>

                    <div
                      className="relative flex justify-end"
                      ref={openRowMenu === rowKey ? rowMenuRef : undefined}
                    >
                      <button
                        onClick={() => setOpenRowMenu((prev) => (prev === rowKey ? null : rowKey))}
                        className="p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5 text-stone-500" />
                      </button>
                      {openRowMenu === rowKey && (
                        <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-20">
                          <button
                            onClick={() => {
                              setOpenRowMenu(null);
                              setEditAccountState({ account, taskers });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveAccount(account.id)}
                            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })
          ) : (
            <div className="py-6 text-center text-sm text-zinc-400">No accounts found.</div>
          )}
        </div>
      </div>

      {/* ---- Edit modal ---- */}
      {isEditModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateProject}
        />
      )}

      {/* ---- Add Account modal ---- */}
      {isAddAccountModalOpen && (
        <AddAccountModal
          projectId={projectId}
          projectName={project.name}
          assignedAccounts={projectAccounts}
          assignedTaskers={project.taskers || []}
          onClose={() => setIsAddAccountModalOpen(false)}
          onAccountAdded={load}
        />
      )}

      {/* ---- Edit Account modal ---- */}
      {editAccountState && (
        <AddAccountModal
          projectId={projectId}
          projectName={project.name}
          assignedAccounts={projectAccounts}
          initialAccount={editAccountState.account}
          initialTaskers={editAccountState.taskers}
          onClose={() => setEditAccountState(null)}
          onAccountAdded={load}
        />
      )}
    </div>
  );
}
