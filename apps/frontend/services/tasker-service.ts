import { apiClient } from './api-client';

export interface Tasker {
  status: string;
  totalHours: number;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  availabilityStatus?: string;
  hourlyRate?: number;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  user?: any;
  projects?: any[];
  timesheets?: any[];
  payments?: any[];
}

export async function getTaskerById(id: string): Promise<Tasker> {
  const { data } = await apiClient.get(`/taskers/${id}`);
  return (data as any).data || data;
}

export async function updateTasker(id: string, payload: Partial<Tasker>) {
  const { data } = await apiClient.patch(`/taskers/${id}`, payload);
  return (data as any).data || data;
}

export async function addTaskerPayment(taskerId: string, payload: any) {
  const { data } = await apiClient.post(`/taskers/${taskerId}/payments`, payload);
  return (data as any).data || data;
}

export async function updateTaskerPayment(taskerId: string, paymentId: string, payload: any) {
  const { data } = await apiClient.patch(`/taskers/${taskerId}/payments/${paymentId}`, payload);
  return (data as any).data || data;
}

export async function addTaskerDailyHour(taskerId: string, payload: any) {
  const { data } = await apiClient.post(`/taskers/${taskerId}/hours`, payload);
  return (data as any).data || data;
}

export async function updateTaskerDailyHour(taskerId: string, hourId: string, payload: any) {
  const { data } = await apiClient.patch(`/taskers/${taskerId}/hours/${hourId}`, payload);
  return (data as any).data || data;
}

export async function getTaskers(page: number = 1, limit: number = 100): Promise<Tasker[]> {
  const { data } = await apiClient.get('/taskers', { params: { page, limit } });
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.data)) return (data as any).data;
  if (Array.isArray((data as any)?.data?.data)) return (data as any).data.data;
  return (data as any)?.data?.data || (data as any)?.data || data || [];
}

export async function createTasker(payload: Partial<Tasker>) {
  const { data } = await apiClient.post('/taskers', payload);
  return (data as any).data || data;
}

export async function deleteTaskerPermanently(id: string) {
  const { data } = await apiClient.delete(`/taskers/${id}`);
  return (data as any).data || data;
}
