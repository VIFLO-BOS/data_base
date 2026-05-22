/**
 * Notification Service
 * Frontend service layer for notification operations.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export async function getNotifications(page = 1, limit = 20) {
  const { data } = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
    params: { page, limit },
  });
  return data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data;
}

export async function markAsRead(ids: string[]) {
  const { data } = await apiClient.patch('/notifications/mark-read', { ids });
  return data;
}

export async function markAllAsRead() {
  const { data } = await apiClient.patch('/notifications/mark-all-read');
  return data;
}

export async function deleteNotification(id: string) {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
}
