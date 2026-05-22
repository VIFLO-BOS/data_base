/**
 * Project Service
 * Frontend service layer for project CRUD and tasker assignment.
 */
import { apiClient } from './api-client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  platformName?: string;
  platformUrl?: string;
  pricePerHour?: number;
  status: string;
  createdById?: string;
  accountsCount?: number;
  taskersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function getProjects(page = 1, limit = 20, status?: string) {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  const { data } = await apiClient.get<any>('/projects', { params });
  return data.data;
}

export async function getProjectById(id: string) {
  const { data } = await apiClient.get<any>(`/projects/${id}`);
  return data.data; // Unwrap the interceptor data wrapper
}

export async function createProject(payload: { name: string; description?: string; platformName?: string; platformUrl?: string; pricePerHour?: number; accountIds?: string[]; taskerIds?: string[] }) {
  const { data } = await apiClient.post<any>('/projects', payload);
  return data.data;
}

export async function updateProject(id: string, payload: Partial<{ name: string; description: string; platformName: string; platformUrl: string; pricePerHour: number; status: string; taskerIds: string[]; accountIds: string[] }>) {
  const { data } = await apiClient.patch<any>(`/projects/${id}`, payload);
  return data.data;
}

export async function deleteProject(id: string) {
  const { data } = await apiClient.delete<any>(`/projects/${id}`);
  return data.data;
}

export async function assignTaskerToProject(projectId: string, taskerId: string) {
  const { data } = await apiClient.post<any>(`/projects/${projectId}/taskers/${taskerId}`);
  return data.data;
}

export async function removeTaskerFromProject(projectId: string, taskerId: string) {
  const { data } = await apiClient.delete<any>(`/projects/${projectId}/taskers/${taskerId}`);
  return data.data;
}

export async function assignAccountToProject(projectId: string, accountId: string) {
  const { data } = await apiClient.post<any>(`/projects/${projectId}/accounts/${accountId}`);
  return data.data;
}

export async function removeAccountFromProject(projectId: string, accountId: string) {
  const { data } = await apiClient.delete<any>(`/projects/${projectId}/accounts/${accountId}`);
  return data.data;
}
