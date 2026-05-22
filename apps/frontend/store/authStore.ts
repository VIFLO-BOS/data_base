'use client';

import { create } from 'zustand';
import * as authService from '../services/auth-service';
import { isNetworkOrServerError, getErrorMessage } from '../services/api-client';
import type { AuthUser } from '../services/auth-service';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  /** Set when initialize() fails due to network/server issues (NOT invalid token) */
  networkError: string | null;

  // Actions
  initialize: () => Promise<void>;
  retryInitialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    profileImage?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  oauthSignIn: (
    email: string,
    firstName: string,
    lastName?: string,
    profileImage?: string,
    role?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  clearError: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Auth Store
 * Manages authentication state via the NestJS backend API.
 * Tokens are stored in localStorage/sessionStorage and auto-attached by the API client interceptor.
 *
 * Network-resilient: network or server errors do NOT log the user out.
 * Only genuine 401 (invalid/expired token) responses trigger a logout.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  networkError: null,

  initialize: async () => {
    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
        : null;
      if (!token) {
        set({ isLoading: false, isAuthenticated: false, user: null, networkError: null });
        return;
      }

      // Validate the token by calling /auth/me
      const user = await authService.getMe();
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: true, isLoading: false, networkError: null });
    } catch (err) {
      if (isNetworkOrServerError(err)) {
        // Network/server error — DON'T logout, keep the token
        const message = getErrorMessage(err);
        let cachedUser = null;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth_user');
          if (stored) {
            try {
              cachedUser = JSON.parse(stored);
            } catch {
              
            }
          }
        }
        set({
          isLoading: false,
          isAuthenticated: !!cachedUser,
          user: cachedUser,
          networkError: message,
        });
      } else {
        // Genuine auth failure (401) — token is invalid, clear everything
        authService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false, networkError: null });
      }
    }
  },

  retryInitialize: async () => {
    set({ isLoading: true, networkError: null });
    await get().initialize();
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        networkError: null,
      });
      return { success: true };
    } catch (err) {
      const message = authService.getErrorMessage(err);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signUp: async (email, password, firstName, lastName, role, profileImage) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ email, password, firstName, lastName, role, profileImage });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        networkError: null,
      });
      return { success: true };
    } catch (err) {
      const message = authService.getErrorMessage(err);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  oauthSignIn: async (email, firstName, lastName, profileImage, role = 'client') => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.oauthLogin({ email, firstName, lastName, profileImage, role });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        networkError: null,
      });
      return { success: true };
    } catch (err) {
      const message = authService.getErrorMessage(err);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signOut: () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
    set({ user: null, isAuthenticated: false, isLoading: false, error: null, networkError: null });
  },

  clearError: () => set({ error: null }),

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  updatePassword: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },
}));
