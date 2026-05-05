/**
 * auth_store Store
 * TODO: Implement Zustand store for auth_store.
 */
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // State
  data: null,
  // Actions
  setData: (data: any) => set({ data }),
}));
