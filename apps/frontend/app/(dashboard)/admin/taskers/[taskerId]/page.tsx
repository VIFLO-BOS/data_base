'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTaskerById, Tasker, addTaskerPayment, addTaskerDailyHour, updateTasker, updateTaskerPayment, updateTaskerDailyHour } from '../../../../../services/tasker-service';
import { getProjects, Project } from '../../../../../services/project-service';
import { getErrorMessage } from '../../../../../services/api-client';
import { ArrowLeft, Loader2, Phone, Mail, Building, Briefcase, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [hoursForm, setHoursForm] = useState({ hours: '', date: '', casualties: '', projectId: '' });

  // Inline Edit states
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', phone: '' });

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });

  useEffect(() => {
    fetchTasker();
    fetchAllProjects();
  }, [taskerId]);

  async function fetchAllProjects() {
    try {
      const data = await getProjects(1, 100);
      let arr = [];
      if (Array.isArray(data)) {
        arr = data;
      } else if (data && Array.isArray((data as any).data)) {
        arr = (data as any).data;
      } else if (data && (data as any).data && Array.isArray((data as any).data.data)) {
        arr = (data as any).data.data;
      }
      setAllProjects(arr);
    } catch (e) {
      console.error(e);
      setAllProjects([]);
    }
  }

  async function fetchTasker() {
    setIsLoading(true);
    try {
      const response = await getTaskerById(taskerId);
      const data = (response as any).data || response;
      setTasker(data);
      setContactForm({ email: data.email || '', phone: data.phone || '' });
      setBankForm({ bankName: data.bankName || '', accountName: data.accountName || '', accountNumber: data.accountNumber || '' });
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
      if (editingHourId) {
        await updateTaskerDailyHour(tasker.id, editingHourId, {
          hours: parseFloat(hoursForm.hours),
          date: hoursForm.date,
          casualties: hoursForm.casualties,
          projectId: hoursForm.projectId || undefined,
        });
        toast.success('Hours updated successfully');
      } else {
        await addTaskerDailyHour(tasker.id, {
          hours: parseFloat(hoursForm.hours),
          date: hoursForm.date,
          casualties: hoursForm.casualties,
          projectId: hoursForm.projectId || undefined,
        });
        toast.success('Hours logged successfully');
      }
      setIsHoursModalOpen(false);
      setEditingHourId(null);
      setHoursForm({ hours: '', date: '', casualties: '', projectId: '' });
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

  const payments = tasker.payments || [];
  
  // Flatten timesheet entries into a list of daily hours
  const dailyHours = (tasker.timesheets || []).flatMap((ts: any) => {
    return (ts.entries || []).map((entry: any) => ({
      id: entry.id,
      date: entry.entryDate,
      hours: entry.hoursWorked,
      casualties: entry.taskDescription,
      projectId: ts.project?.id || null,
      project: ts.project,
    }));
  }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const projects = tasker.projects || [];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors border border-zinc-200 bg-white"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {tasker.firstName} {tasker.lastName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tasker.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {tasker.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-stone-900">Contact Information</h3>
              {!isEditingContact ? (
                <button onClick={() => setIsEditingContact(true)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingContact(false)} className="text-zinc-500 hover:text-zinc-700 text-sm font-medium">Cancel</button>
                  <button onClick={handleSaveContact} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Save</button>
                </div>
              )}
            </div>
            {isEditingContact ? (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="h-8 px-2 border rounded outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Phone</label>
                  <input type="text" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="h-8 px-2 border rounded outline-none focus:border-indigo-500" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {tasker.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  {tasker.phone || 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-stone-900">Bank Details</h3>
              {!isEditingBank ? (
                <button onClick={() => setIsEditingBank(true)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingBank(false)} className="text-zinc-500 hover:text-zinc-700 text-sm font-medium">Cancel</button>
                  <button onClick={handleSaveBank} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Save</button>
                </div>
              )}
            </div>
            {isEditingBank ? (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Bank Name</label>
                  <input type="text" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} className="h-8 px-2 border rounded outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Account Name</label>
                  <input type="text" value={bankForm.accountName} onChange={e => setBankForm({...bankForm, accountName: e.target.value})} className="h-8 px-2 border rounded outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Account Number</label>
                  <input type="text" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} className="h-8 px-2 border rounded outline-none focus:border-indigo-500" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-stone-700">
                  <Building className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium">Bank:</span> {tasker.bankName || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium">Account Name:</span> {tasker.accountName || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium">Account Number:</span> {tasker.accountNumber || 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Projects */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-semibold text-stone-900 border-b border-zinc-100 pb-3">Assigned Projects</h3>
            <div className="flex flex-col gap-3">
              {projects.length > 0 ? projects.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm text-stone-700 bg-zinc-50 p-2 rounded border border-zinc-100">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  {p.name}
                </div>
              )) : (
                <div className="text-sm text-stone-500">No projects assigned</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payments & Hours */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Payments Table */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-stone-900">Payments</h3>
              <button 
                onClick={() => {
                  setEditingPaymentId(null);
                  setPaymentForm({ amount: '', date: '', time: '', projectId: '' });
                  setIsPaymentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Payment
              </button>
            </div>
            {payments.length === 0 ? (
              <div className="py-4 text-center text-sm text-zinc-500">No payments recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Project</th>
                      <th className="px-4 py-2 font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: any) => (
                      <tr key={p.id} className="border-b border-zinc-100">
                        <td className="px-4 py-3 text-stone-900">{new Date(p.paymentDate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-stone-900">{p.project?.name || 'General'}</td>
                        <td className="px-4 py-3 text-emerald-600 font-medium">${Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => {
                              const d = new Date(p.paymentDate);
                              setPaymentForm({
                                amount: p.amount.toString(),
                                date: d.toISOString().split('T')[0],
                                time: d.toTimeString().slice(0,5),
                                projectId: p.projectId || ''
                              });
                              setEditingPaymentId(p.id);
                              setIsPaymentModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-indigo-600 transition-colors p-1"
                            title="Edit Payment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Daily Hours Table */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-stone-900">Daily Hours & Queries</h3>
              <button 
                onClick={() => {
                  setEditingHourId(null);
                  setHoursForm({ hours: '', date: '', casualties: '', projectId: '' });
                  setIsHoursModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Log Hours
              </button>
            </div>
            {dailyHours.length === 0 ? (
              <div className="py-4 text-center text-sm text-zinc-500">No hours logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Project</th>
                      <th className="px-4 py-2 font-medium">Hours</th>
                      <th className="px-4 py-2 font-medium">Queries / Casualties</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyHours.map((h: any) => (
                      <tr key={h.id} className="border-b border-zinc-100">
                        <td className="px-4 py-3 text-stone-900">{new Date(h.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-stone-900">{h.project?.name || 'General'}</td>
                        <td className="px-4 py-3 text-stone-900 font-medium">{Number(h.hours).toFixed(1)}</td>
                        <td className="px-4 py-3 text-rose-600 max-w-[200px] truncate" title={h.casualties}>{h.casualties || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => {
                              const d = new Date(h.date);
                              setHoursForm({
                                hours: h.hours.toString(),
                                date: d.toISOString().split('T')[0],
                                casualties: h.casualties || '',
                                projectId: h.projectId || ''
                              });
                              setEditingHourId(h.id);
                              setIsHoursModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-indigo-600 transition-colors p-1"
                            title="Edit Hours"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-semibold text-stone-900">{editingPaymentId ? 'Edit Payment' : 'Add Payment'}</h3>
              <button onClick={() => { setIsPaymentModalOpen(false); setEditingPaymentId(null); }} className="text-zinc-400 hover:text-stone-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Amount ($)</label>
                <input required type="number" step="0.01" min="0" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 text-stone-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Date</label>
                  <input required type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 text-stone-900" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Time</label>
                  <input type="time" value={paymentForm.time} onChange={e => setPaymentForm({...paymentForm, time: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 text-stone-900" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Project (Optional)</label>
                <select value={paymentForm.projectId} onChange={e => setPaymentForm({...paymentForm, projectId: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 bg-white text-stone-900">
                  <option value="">General / No Project</option>
                  {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium cursor-pointer transition-colors">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hours Modal */}
      {isHoursModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-semibold text-stone-900">{editingHourId ? 'Edit Logged Hours' : 'Log Hours & Queries'}</h3>
              <button onClick={() => { setIsHoursModalOpen(false); setEditingHourId(null); }} className="text-zinc-400 hover:text-stone-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddHours} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Hours Worked</label>
                  <input required type="number" step="0.5" min="0" value={hoursForm.hours} onChange={e => setHoursForm({...hoursForm, hours: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 text-stone-900" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Date</label>
                  <input required type="date" value={hoursForm.date} onChange={e => setHoursForm({...hoursForm, date: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 text-stone-900" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Project (Optional)</label>
                <select value={hoursForm.projectId} onChange={e => setHoursForm({...hoursForm, projectId: e.target.value})} className="h-10 px-3 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 bg-white text-stone-900">
                  <option value="">General / No Project</option>
                  {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Casualties / Queries (Optional)</label>
                <textarea 
                  rows={3} 
                  placeholder="Note any issues, delays, or queries for this day..."
                  value={hoursForm.casualties} 
                  onChange={e => setHoursForm({...hoursForm, casualties: e.target.value})} 
                  className="px-3 py-2 border border-zinc-300 rounded-lg outline-none focus:border-indigo-500 resize-none text-stone-900" 
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium cursor-pointer transition-colors">Log Hours</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
