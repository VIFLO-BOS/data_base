/**
 * ui_store Store
 * TODO: Implement Zustand store for ui_store.
 */
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // State
  data: null,
  // Actions
  setData: (data: any) => set({ data }),
}));
