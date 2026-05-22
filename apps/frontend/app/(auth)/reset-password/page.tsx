'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const { success } = await updatePassword(password);
    setIsSubmitting(false);

    if (success) {
      // Show success toast here if toast store is available
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950/50 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Set new password</h1>
        <p className="text-zinc-400 mt-1.5 text-sm">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(error || passwordError) && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {passwordError || error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-medium">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-900/50 text-sm text-white rounded-xl border border-white/10 placeholder:text-zinc-500 focus:bg-zinc-900/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-medium">Confirm New Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-900/50 text-sm text-white rounded-xl border border-white/10 placeholder:text-zinc-500 focus:bg-zinc-900/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword}
          className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 group border border-indigo-500/50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Update password
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
