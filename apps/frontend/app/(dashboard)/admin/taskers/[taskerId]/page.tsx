'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTaskerById,
  Tasker,
  addTaskerPayment,
  addTaskerDailyHour,
  updateTasker,
  updateTaskerPayment,
  updateTaskerDailyHour,
} from '../../../../../services/tasker-service';
import { getProjects, Project } from '../../../../../services/project-service';
import { getErrorMessage } from '../../../../../services/api-client';
import { ArrowLeft, Loader2, MoreVertical, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AssignAccountModal } from '../../../../../components/taskers/assign-account-modal';
import { deleteAccount } from '@/services/account-service';

function formatHoursText(hours: number | string | null | undefined): string {
  if (!hours) return '0h:00m';
  const totalMins = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h:${String(m).padStart(2, '0')}m`;
}

export default function TaskerDetailsPage({ params }: { params: Promise<{ taskerId: string }> }) {
  const router = useRouter();
  const [tasker, setTasker] = useState<Tasker | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = React.use(params);
  const taskerId = resolvedParams.taskerId;

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingHourId, setEditingHourId] = useState<string | null>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', time: '', projectId: '' });
  const [hoursForm, setHoursForm] = useState({
    hours: '',
    date: '',
    casualties: '',
    projectId: '',
    accountId: '',
  });
  const [workContexts, setWorkContexts] = useState<
    { accountId: string; projectId: string; label: string }[]
  >([]);

  // Inline Edit states
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', phone: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });
  const [isAssignAccountOpen, setIsAssignAccountOpen] = useState(false);

  useEffect(() => {
    fetchTasker();
    fetchAllProjects();
  }, [taskerId]);

  async function fetchAllProjects() {
    try {
      const list = await getProjects(1, 100);
      setAllProjects(list);
    } catch (e) {
      console.error(e);
      setAllProjects([]);
    }
  }

  async function fetchTasker() {
    setIsLoading(true);
    try {
      const data = await getTaskerById(taskerId);
      setTasker(data);
      const contexts: { accountId: string; projectId: string; label: string }[] = [];
      for (const p of data.projects || []) {
        for (const a of p.accounts || []) {
          contexts.push({
            accountId: a.id,
            projectId: p.id,
            label: `${a.name} — ${p.name}`,
          });
        }
      }
      for (const ts of data.timesheets || []) {
        if (ts.accountId && ts.projectId) {
          const label = `${ts.account?.name || 'Account'} — ${ts.project?.name || 'Project'}`;
          if (!contexts.some((c) => c.accountId === ts.accountId && c.projectId === ts.projectId)) {
            contexts.push({
              accountId: ts.accountId,
              projectId: ts.projectId,
              label,
            });
          }
        }
      }
      setWorkContexts(contexts);
      setContactForm({ email: data.email || '', phone: data.phone || '' });
      setBankForm({
        bankName: data.bankName || '',
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load tasker details');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tasker) return;
    try {
      const paymentDateStr = `${paymentForm.date}T${paymentForm.time || '00:00'}:00Z`;
      if (editingPaymentId) {
        await updateTaskerPayment(tasker.id, editingPaymentId, {
          amount: parseFloat(paymentForm.amount),
          paymentDate: paymentDateStr,
          projectId: paymentForm.projectId || undefined,
        });
        toast.success('Payment updated');
      } else {
        await addTaskerPayment(tasker.id, {
          amount: parseFloat(paymentForm.amount),
          paymentDate: paymentDateStr,
          projectId: paymentForm.projectId || undefined,
        });
        toast.success('Payment added');
      }
      setIsPaymentModalOpen(false);
      setEditingPaymentId(null);
      setPaymentForm({ amount: '', date: '', time: '', projectId: '' });
      fetchTasker();
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to save payment');
    }
  }

  async function handleAddHours(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tasker) return;
    try {
      if (!hoursForm.accountId || !hoursForm.projectId) {
        toast.error('Select an account and project');
        return;
      }
      if (editingHourId) {
        await updateTaskerDailyHour(tasker.id, editingHourId, {
          hours: parseFloat(hoursForm.hours),
          date: hoursForm.date,
          casualties: hoursForm.casualties,
          projectId: hoursForm.projectId,
          accountId: hoursForm.accountId,
        });
        toast.success('Hours updated successfully');
      } else {
        await addTaskerDailyHour(tasker.id, {
          hours: parseFloat(hoursForm.hours),
          date: hoursForm.date,
          casualties: hoursForm.casualties,
          projectId: hoursForm.projectId,
          accountId: hoursForm.accountId,
        });
        toast.success('Hours logged successfully');
      }
      setIsHoursModalOpen(false);
      setEditingHourId(null);
      setHoursForm({ hours: '', date: '', casualties: '', projectId: '', accountId: '' });
      fetchTasker();
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to save hours');
    }
  }

  async function handleSaveContact() {
    if (!tasker) return;
    try {
      await updateTasker(tasker.id, contactForm);
      toast.success('Contact info updated');
      setIsEditingContact(false);
      fetchTasker();
    } catch {
      toast.error('Failed to update contact info');
    }
  }

  async function handleSaveBank() {
    if (!tasker) return;
    try {
      await updateTasker(tasker.id, bankForm);
      toast.success('Bank details updated');
      setIsEditingBank(false);
      fetchTasker();
    } catch {
      toast.error('Failed to update bank details');
    }
  }

  async function handleDeleteAccount(accountId: string) {
    try {
     await deleteAccount(accountId)
      toast.success('Account deleted successfully');
      fetchTasker()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to delete account');
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!tasker) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-zinc-500">Tasker not found</div>
      </div>
    );
  }

  // Calculate metrics
  const dailyHours = (tasker.timesheets || []).flatMap((ts: any) => {
    return (ts.entries || []).map((entry: any) => ({
      id: entry.id,
      date: entry.entryDate,
      hours: entry.hoursWorked,
      casualties: entry.taskDescription,
      projectId: ts.project?.id || ts.projectId || null,
      accountId: ts.account?.id || ts.accountId || null,
      project: ts.project,
      account: ts.account,
      pricePerHour: Number(ts.project?.pricePerHour || 0),
    }));
  });

  const totalProjects = tasker.projects?.length || 0;

  const assignedAccountsMap = new Map<string, any>();
  if (tasker?.projects) {
    tasker.projects.forEach((p: { accounts: { id: any; name: any; }[]; id: any; name: any; }) => {
      if (p.accounts) {
        p.accounts.forEach((a: { id: any; name: any; }) => {
          const key = `${p.id}-${a.id}`;
          assignedAccountsMap.set(key, {
            accountId: a.id,
            accountName: a.name,
            projectId: p.id,
            projectName: p.name,
            hours: 0,
          });
        });
      }
    });
  }

  dailyHours.forEach((h: { projectId: any; accountId: any; hours: any; account: { name: any; }; project: { name: any; }; }) => {
    if (h.projectId && h.accountId) {
      const key = `${h.projectId}-${h.accountId}`;
      if (assignedAccountsMap.has(key)) {
        assignedAccountsMap.get(key).hours += Number(h.hours);
      } else {
        assignedAccountsMap.set(key, {
          accountId: h.accountId,
          accountName: h.account?.name || 'Unknown Account',
          projectId: h.projectId,
          projectName: h.project?.name || 'Unknown Project',
          hours: Number(h.hours),
        });
      }
    }
  });

  const assignedAccountsList = Array.from(assignedAccountsMap.values());
  const totalAccounts = assignedAccountsList.length;
  const totalHours = dailyHours.reduce((acc: number, h: { hours: any; }) => acc + Number(h.hours), 0);

  return (
    <>
    <div className="flex-1 w-full mx-auto pb-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <span
          onClick={() => router.push('/admin/taskers')}
          className="cursor-pointer hover:text-gray-700 transition-colors"
        >
          Taskers
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 underline decoration-gray-400 underline-offset-4">
          Profile
        </span>
      </div>

      {/* Header Avatar and Name */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src={
            tasker.avatarUrl ||
            `https://ui-avatars.com/api/?name=${tasker.firstName}+${tasker.lastName}&background=random`
          }
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          {tasker.firstName} {tasker.lastName}
        </h1>
      </div>

      {/* Card 1: Personal Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
          {isEditingContact ? (
            <button
              onClick={handleSaveContact}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-900 hover:text-gray-700 p-1"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-[0px_4px_24px_rgba(0,0,0,0.08)] py-1 z-10 border-0">
                  <button
                    onClick={() => {
                      setIsEditingContact(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-[88px] h-[88px] rounded-full p-1 border-2 border-pink-300">
              <img
                src={
                  tasker.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${tasker.firstName}+${tasker.lastName}&background=random`
                }
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#34C759] border-2 border-white rounded-full"></div>
          </div>
          <div className="font-semibold text-gray-900 text-lg">
            {tasker.firstName} {tasker.lastName}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Phone Number</div>
              {isEditingContact ? (
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
                />
              ) : (
                <div className="text-sm font-medium text-gray-700">{tasker.phone || 'N/A'}</div>
              )}
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Email</div>
              {isEditingContact ? (
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
                />
              ) : (
                <div className="text-sm font-medium text-gray-700">{tasker.email || 'N/A'}</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Project(s)</div>
              <div className="text-sm font-medium text-gray-700">{totalProjects}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Account(s)</div>
              <div className="text-sm font-medium text-gray-700">{totalAccounts}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Total Hours Logged</div>
              <div className="text-sm font-medium text-gray-700">{formatHoursText(totalHours)}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-medium mb-1.5">Total Earned</div>
              <div className="text-sm font-medium text-gray-700">
                {(tasker as any).totalAmount || '₦0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Financial Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Financial Information</h2>
          {isEditingBank ? (
            <button
              onClick={handleSaveBank}
              className="px-5 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditingBank(true)}
              className="px-5 py-2 text-sm font-medium text-[#4F46E5] border border-[#E0E7FF] rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-xs text-gray-400 font-medium mb-1.5">Bank</div>
            {isEditingBank ? (
              <input
                type="text"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-gray-700">{tasker.bankName || 'N/A'}</div>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-xs text-gray-400 font-medium mb-1.5">Account Name</div>
            {isEditingBank ? (
              <input
                type="text"
                value={bankForm.accountName}
                onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-gray-700">
                {tasker.accountName || 'N/A'}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-xs text-gray-400 font-medium mb-1.5">Account Number</div>
            {isEditingBank ? (
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-gray-700">
                {tasker.accountNumber ? '**********' : 'N/A'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Daily Work & Earnings History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Daily Work & Earnings History</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-md">
              {dailyHours.length}
            </span>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyHours.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-center text-gray-500">
                    No work history
                  </td>
                </tr>
              ) : (
                [...dailyHours].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h: any, idx: number) => {
                  const exactMinutes = Math.round(Number(h.hours) * 60);
                  const amount = exactMinutes * (Number(h.pricePerHour || 0) / 60);
                  const formattedAmount = `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatHoursText(h.hours)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                        {formattedAmount}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {h.project?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(h.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 4: Accounts */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Accounts</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-md">
              {totalAccounts}
            </span>
          </div>
          <button
            onClick={() => setIsAssignAccountOpen(true)}
            className="px-5 py-2 text-sm font-medium text-[#4F46E5] border border-[#E0E7FF] rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            Assign Account
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-medium text-gray-400">Assigned Account</th>
              <th className="pb-4 text-xs font-medium text-gray-400">Project</th>
              <th className="pb-4 text-xs font-medium text-gray-400">Total Hours</th>
              <th className="pb-4 text-xs font-medium text-gray-400 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {assignedAccountsList.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 text-sm text-gray-700 font-medium">{item.accountName}</td>
                <td className="py-4 text-sm text-gray-700 font-medium">{item.projectName}</td>
                <td className="py-4 text-sm text-gray-700 font-medium">{formatHoursText(item.hours)}</td>
                <td className="py-4 text-right relative">
                  <div onClick={() => handleDeleteAccount(item.accountId)} className="group-hover:flex hidden absolute right-10 top-1/2 -translate-y-1/2 bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)] rounded-lg px-4 py-2 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 z-10">
                    Remove
                  </div>
                  <button className="text-gray-900 hover:text-gray-600 p-1">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Assign Account Modal */}
    {isAssignAccountOpen && (
      <AssignAccountModal
        taskerId={taskerId}
        assignedAccountKeys={assignedAccountsList.map((a) => `${a.projectId}-${a.accountId}`)}
        onClose={() => setIsAssignAccountOpen(false)}
        onAssigned={() => fetchTasker()}
      />
    )}


  </>
  );
}
