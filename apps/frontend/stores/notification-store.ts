/**
 * notification_store Store
 * TODO: Implement Zustand store for notification_store.
 */
import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  // State
  data: null,
  // Actions
  setData: (data: any) => set({ data }),
}));
