/**
 * filter_store Store
 * TODO: Implement Zustand store for filter_store.
 */
import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  // State
  data: null,
  // Actions
  setData: (data: any) => set({ data }),
}));
