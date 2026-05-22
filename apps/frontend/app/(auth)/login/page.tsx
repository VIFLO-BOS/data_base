'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsSubmitting(true);
    // When logging in, we just default to client if they don't exist, though backend assigns their existing role.
    if (typeof window !== 'undefined') {
      localStorage.setItem('oauth_role', 'client');
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      console.error(authError);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;

    setIsSubmitting(true);
    // Store the remember-me preference before signing in so the token helper can use it
    if (typeof window !== 'undefined') {
      localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
    }
    const { success } = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      // Redirect based on user role
      const user = useAuthStore.getState().user;
      const primaryRole = user?.roles?.[0] || 'admin';
      if (primaryRole === 'client') {
        router.push('/client/dashboard');
      } else if (primaryRole === 'tasker') {
        router.push('/tasker/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950/20 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
        <p className="text-zinc-400 mt-1.5 text-sm">
          Enter your credentials to access your dashboard.
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
              className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-zinc-300 text-sm font-medium">Password</label>
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white text-sm text-zinc-900 rounded-xl border border-white/20 placeholder:text-zinc-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                rememberMe
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-zinc-500 bg-transparent group-hover:border-zinc-400'
              }`}>
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-zinc-400 text-sm select-none group-hover:text-zinc-300 transition-colors">
              Remember me
            </span>
          </label>
          <span className="text-zinc-500 text-xs">{rememberMe ? 'Stay logged in' : 'Session only'}</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 group border border-indigo-500/50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button type="button" onClick={() => handleOAuth('google')} className="flex justify-center items-center h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
          <button type="button" onClick={() => handleOAuth('github')} className="flex justify-center items-center h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-white hover:underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
