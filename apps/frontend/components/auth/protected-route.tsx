'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { getDashboardPath } from '../../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed roles. If empty/undefined, any authenticated user can access. */
  allowedRoles?: string[];
}

/**
 * ProtectedRoute Component
 * Wraps pages/layouts that require authentication.
 * - Redirects to /login if unauthenticated (and no cache available).
 * - Shows a toast notification if the server is unreachable but user is cached.
 * - Redirects to the user's own dashboard if their role is not in allowedRoles.
 * - Shows nothing while loading to prevent flash of content.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, networkError, initialize, signOut } = useAuthStore();
  const router = useRouter();
  const hasToastedNetworkError = useRef(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for forced logouts dispatched by the API client (e.g. refresh token expired)
  useEffect(() => {
    function handleForcedLogout() {
      signOut();
      router.replace('/login');
    }
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [router, signOut]);

  // Handle network error toast
  useEffect(() => {
    if (networkError && !hasToastedNetworkError.current) {
      toast.error('Working offline. ' + networkError, {
        duration: 5000,
        position: 'top-center',
      });
      hasToastedNetworkError.current = true;
    } else if (!networkError) {
      hasToastedNetworkError.current = false;
    }
  }, [networkError]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Role-based redirect
    if (allowedRoles && allowedRoles.length > 0 && user) {
      const hasRole = user?.roles?.some((r) => allowedRoles.includes(r));
      if (!hasRole) {
        const destination = getDashboardPath(user.roles);
        if (destination) router.replace(destination);
        else void signOut().finally(() => router.replace('/login'));
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9fb]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — already redirecting via useEffect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9fb]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Role check failed — show nothing while redirecting
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasRole = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) return null;
  }

  return <>{children}</>;
}
