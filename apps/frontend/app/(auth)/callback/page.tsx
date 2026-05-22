'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { oauthSignIn } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) throw new Error('No active session found.');

        const user = session.user;
        const metadata = user.user_metadata || {};
        
        const email = user.email!;
        // GitHub might not provide full_name, fallback to user_name or email prefix
        const fullName = metadata.full_name || metadata.user_name || email.split('@')[0];
        const avatarUrl = metadata.avatar_url;
        
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Retrieve role intent if they registered
        const role = typeof window !== 'undefined' ? localStorage.getItem('oauth_role') || 'client' : 'client';

        const { success, error: signInError } = await oauthSignIn(
          email,
          firstName,
          lastName,
          avatarUrl,
          role
        );

        if (!success) throw new Error(signInError || 'Failed to sync OAuth with backend');

        // Cleanup
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oauth_role');
        }

        // Navigate to correct dashboard
        const currentUser = useAuthStore.getState().user;
        const primaryRole = currentUser?.roles?.[0] || 'admin';
        if (primaryRole === 'client') {
          router.push('/client/dashboard');
        } else if (primaryRole === 'tasker') {
          router.push('/tasker/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during authentication.');
      }
    };

    handleCallback();
  }, [router, oauthSignIn]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-zinc-950/20 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10">
      {error ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
          <p className="text-zinc-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <div>
            <h2 className="text-lg font-medium text-white tracking-tight">Completing sign in...</h2>
            <p className="text-sm text-zinc-400 mt-1">Please wait while we set up your workspace.</p>
          </div>
        </div>
      )}
    </div>
  );
}
