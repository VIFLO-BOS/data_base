/**
 * User Service
 * Frontend service layer for user management (admin).
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface UserRecord {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getUsers(page = 1, limit = 20, search?: string) {
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  const { data } = await apiClient.get<PaginatedResponse<UserRecord>>('/users', { params });
  return data;
}

export async function getUserById(id: string) {
  const { data } = await apiClient.get<UserRecord>(`/users/${id}`);
  return data;
}

export async function updateUser(id: string, payload: Partial<{ status: string; roles: string[] }>) {
  const { data } = await apiClient.patch<UserRecord>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}
