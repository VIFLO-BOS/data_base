'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Mail, UserPlus, X, Loader2, Users, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../../services/api-client';
import { useAuthStore } from '../../../../store/authStore';
import { ResetAdminPasswordModal } from '../../../../components/modals/reset-admin-password-modal';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;

  // Invite state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Reset Password state
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Pending Invites state
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    if (isSuperAdmin) fetchPendingInvites();
  }, [isSuperAdmin]);

  const fetchPendingInvites = async () => {
    try {
      const { data } = await apiClient.get('/admins/invitations/pending');
      if (data && data.data) {
        setPendingInvites(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending invitations', err);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      await apiClient.post('/admins/invite', { email: inviteEmail });
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      fetchPendingInvites(); // Refresh list
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full relative">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  Platform Settings
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Manage global preferences and configurations
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

          <div className="w-full max-w-3xl grid gap-8">
            {/* Admin Management Section */}
            {isSuperAdmin && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-stone-900 font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Admin Management
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsResetPasswordModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      Reset Password
                    </button>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite Admin
                    </button>
                  </div>
                </div>

                {/* Pending Invitations List */}
                {pendingInvites.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                      Pending Invitations
                    </p>
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-900">{invite.email}</p>
                            <p className="text-xs text-stone-500 capitalize">
                              {invite.role.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-stone-400">
                          Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 border border-stone-100 rounded-lg text-sm text-stone-500 flex items-center justify-center italic">
                    No pending invitations.
                  </div>
                )}
              </div>
            )}

            {/* General Settings */}
            <div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">
                General Configuration
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="Paylio"
                    className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@paylio.com"
                    className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">
                Admin Notifications
              </h3>
              <div className="grid gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-stone-700">
                    Email me when a new Tasker registers
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-stone-700">Email me on payout failures</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-stone-700">Weekly platform summary report</span>
                </label>
              </div>
            </div>

            {/* Theme / Appearance */}
            {/*<div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">
                Appearance
              </h3>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 border-2 border-indigo-500 bg-stone-50 rounded-lg font-medium text-indigo-700 text-sm cursor-pointer flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border border-indigo-200"></div>{' '}
                  Light
                </div>
                <div className="px-4 py-2 border border-stone-200 bg-stone-50 rounded-lg font-medium text-stone-600 text-sm cursor-pointer flex items-center gap-2 hover:border-stone-300">
                  <div className="w-4 h-4 rounded-full bg-stone-800 border border-stone-700"></div>{' '}
                  Dark
                </div>
                <div className="px-4 py-2 border border-stone-200 bg-stone-50 rounded-lg font-medium text-stone-600 text-sm cursor-pointer flex items-center gap-2 hover:border-stone-300">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-stone-200 to-stone-800 border border-stone-300"></div>{' '}
                  System
                </div>
              </div>

            </div>*/}
          </div>
        </div>
      </div>

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900">Invite Admin</h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="admin@paylio.com"
                />
              </div>
              <p className="text-sm text-stone-500">
                Invitations create a standard administrator account. Super-admin access cannot be
                invited.
              </p>
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isInviting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      <ResetAdminPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  );
}
