/**
 * Export Service
 * Frontend service layer for data export operations.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  requestedById: string;
  createdAt: string;
  updatedAt: string;
}

export async function getExportJobs(page = 1, limit = 20) {
  const { data } = await apiClient.get<PaginatedResponse<ExportJob>>('/exports', {
    params: { page, limit },
  });
  return data;
}

export async function getExportJobById(id: string) {
  const { data } = await apiClient.get<ExportJob>(`/exports/${id}`);
  return data;
}

export async function requestExport(payload: { type: string; filters?: Record<string, any> }) {
  const { data } = await apiClient.post<ExportJob>('/exports', payload);
  return data;
}

export async function deleteExportJob(id: string) {
  const { data } = await apiClient.delete(`/exports/${id}`);
  return data;
}
