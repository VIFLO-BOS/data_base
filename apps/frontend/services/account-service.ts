/**
 * Account Service
 * Frontend service layer for account (client) CRUD operations.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface Account {
  id: string;
  name: string;
  email: string;
  status: string;
  settings?: any;
  projects?: any[];
  projectsCount?: number;
  totalHours?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAccounts(page = 1, limit = 20) {
  const { data } = await apiClient.get<any>('/accounts', {
    params: { page, limit },
  });
  return data.data;
}

export async function getAccountById(id: string) {
  const { data } = await apiClient.get<any>(`/accounts/${id}`);
  return data.data;
}

export async function createAccount(payload: { name: string; email: string }) {
  const { data } = await apiClient.post<any>('/accounts', payload);
  return data.data;
}

export async function updateAccount(id: string, payload: Partial<Account>) {
  const { data } = await apiClient.patch<any>(`/accounts/${id}`, payload);
  return data.data;
}

export async function deleteAccount(id: string) {
  const { data } = await apiClient.delete<any>(`/accounts/${id}`);
  return data.data;
}
