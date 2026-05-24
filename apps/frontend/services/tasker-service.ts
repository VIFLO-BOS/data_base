/**
 * Tasker Service
 * Frontend service layer for tasker CRUD operations.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface Tasker {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  phone?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  totalHours?: number;
  projects?: any[];
  payments?: any[];
  timesheets?: any[];
  createdAt: string;
  updatedAt: string;
}

export async function getTaskers(page = 1, limit = 20, status?: string): Promise<Tasker[]> {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  const { data } = await apiClient.get<any>('/taskers', { params });
  const payload = data.data;
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}

export async function getTaskerById(id: string) {
  const { data } = await apiClient.get<any>(`/taskers/${id}`);
  return data.data;
}

export async function createTasker(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}) {
  const { data } = await apiClient.post<Tasker>('/taskers', payload);
  return data;
}

export async function updateTasker(id: string, payload: Partial<Tasker>) {
  const { data } = await apiClient.patch<Tasker>(`/taskers/${id}`, payload);
  return data;
}

export async function deleteTasker(id: string) {
  const { data } = await apiClient.delete(`/taskers/${id}`);
  return data;
}

export async function deleteTaskerPermanently(id: string) {
  const { data } = await apiClient.delete(`/taskers/${id}/permanent`);
  return data;
}

export async function addTaskerPayment(
  taskerId: string,
  payload: { amount: number; paymentDate: string; projectId?: string },
) {
  const { data } = await apiClient.post(`/taskers/${taskerId}/payments`, payload);
  return data;
}

export async function addTaskerDailyHour(
  taskerId: string,
  payload: {
    hours: number;
    date: string;
    casualties?: string;
    projectId: string;
    accountId: string;
  },
) {
  const { data } = await apiClient.post(`/taskers/${taskerId}/hours`, payload);
  return data;
}

export async function updateTaskerPayment(taskerId: string, paymentId: string, payload: any) {
  const { data } = await apiClient.patch(`/taskers/${taskerId}/payments/${paymentId}`, payload);
  return data;
}

export async function updateTaskerDailyHour(taskerId: string, hourId: string, payload: any) {
  const { data } = await apiClient.patch(`/taskers/${taskerId}/hours/${hourId}`, payload);
  return data;
}
