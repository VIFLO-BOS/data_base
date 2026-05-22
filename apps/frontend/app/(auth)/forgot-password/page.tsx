'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    clearError();
    if (!email) return;

    setIsSubmitting(true);
    const { success } = await resetPassword(email);
    setIsSubmitting(false);

    if (success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full bg-zinc-950/20 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 text-center">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-indigo-500/30">
          <Mail className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Check your email</h1>
        <p className="text-zinc-400 mt-2 text-sm leading-relaxed mb-6">
          We&apos;ve sent a password reset link to <span className="font-semibold text-white">{email}</span>.
        </p>
        <Link 
          href="/login"
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-zinc-950/50 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10">
      <Link 
        href="/login" 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-white transition-colors mb-5 w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Forgot password</h1>
        <p className="text-zinc-400 mt-1.5 text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-medium">Email address</label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-900/50 text-sm text-white rounded-xl border border-white/10 placeholder:text-zinc-500 focus:bg-zinc-900/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 group border border-indigo-500/50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
