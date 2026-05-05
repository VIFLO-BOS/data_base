/**
 * dashboard_store Store
 * TODO: Implement Zustand store for dashboard_store.
 */
import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  // State
  data: null,
  // Actions
  setData: (data: any) => set({ data }),
}));
