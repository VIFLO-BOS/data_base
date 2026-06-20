'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/services/api-client';
import { useAuthStore } from '@/store/authStore';

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [token, setToken] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setToken(p.token);
    });
  }, [params]);

  useEffect(() => {
    if (!token) return;
    const validateToken = async () => {
      try {
        const { data } = await apiClient.get(`/admins/invite/${token}`);
        setIsValid(true);
        setEmail(data.email);
        setRole(data.role);
      } catch (err: any) {
        setIsValid(false);
        setErrorMsg(err?.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setIsLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/admins/invite/${token}/accept`, {
        password,
        firstName,
        lastName,
      });

      // Auto-login
      const { success } = await signIn(email, password);
      if (success) {
        router.push('/admin/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to accept invitation');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950/20 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Validating invitation...</p>
        </div>
      ) : !isValid ? (
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-white">Invalid Invitation</h1>
          <p className="text-zinc-400 text-sm mb-4">{errorMsg}</p>
          <Link href="/login" className="h-10 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" />
              {role === 'super_admin' ? 'Super Admin Invitation' : 'Admin Invitation'}
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Complete Setup</h1>
            <p className="text-zinc-400 mt-1.5 text-sm">
              Set up your profile for <strong className="text-zinc-200">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 text-sm font-medium">First Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 text-sm font-medium">Last Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 text-sm font-medium">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 text-sm font-medium">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !firstName || !lastName || !password || !confirmPassword}
              className="w-full h-11 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 group border border-indigo-500/50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
