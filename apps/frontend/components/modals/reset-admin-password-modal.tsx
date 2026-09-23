import React, { useState } from 'react';
import { X, Loader2, KeyRound, Search, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resetAdminPassword } from '@/services/auth-service';

interface ResetAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetAdminPasswordModal({ isOpen, onClose }: ResetAdminPasswordModalProps) {
  const [targetEmail, setTargetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const hasMinLength = newPassword.length >= 8;
  const hasMaxLength = newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasMaxLength && hasUppercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail || !isPasswordValid) return;

    setIsResetting(true);
    try {
      await resetAdminPassword(targetEmail, newPassword);
      toast.success('Password reset successfully!');
      onClose();
      setTargetEmail('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" /> Reset Admin Password
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Target Admin Email
            </label>
            <input
              type="email"
              required
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="e.g. admin@paylio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
            <input
              type="text" // Show password by default for admin resets
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="Enter new password"
            />
            {newPassword.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <PasswordRule passed={hasMinLength} label="At least 8 characters" />
                <PasswordRule passed={hasMaxLength} label="At most 16 characters" />
                <PasswordRule passed={hasUppercase} label="One uppercase letter" />
                <PasswordRule passed={hasNumber} label="One number" />
              </div>
            )}
          </div>

          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
            <strong>Warning:</strong> This will forcibly change the user's password. Super Admin
            passwords cannot be reset this way.
          </p>

          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting || !targetEmail || !isPasswordValid}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordRule({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? 'text-green-600' : 'text-stone-400'}`}
    >
      <Check className={`w-3 h-3 ${passed ? 'opacity-100' : 'opacity-30'}`} />
      {label}
    </div>
  );
}
