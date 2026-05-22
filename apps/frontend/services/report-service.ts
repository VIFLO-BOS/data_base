/**
 * Report Service
 * Frontend service layer for report generation and management.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface Report {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: string;
  generatedById: string;
  createdAt: string;
  updatedAt: string;
}

export async function getReports(page = 1, limit = 20, type?: string) {
  const params: Record<string, any> = { page, limit };
  if (type) params.type = type;
  const { data } = await apiClient.get<PaginatedResponse<Report>>('/reports', { params });
  return data;
}

export async function getReportById(id: string) {
  const { data } = await apiClient.get<Report>(`/reports/${id}`);
  return data;
}

export async function generateReport(payload: { name: string; type: string }) {
  const { data } = await apiClient.post<Report>('/reports', payload);
  return data;
}

export async function deleteReport(id: string) {
  const { data } = await apiClient.delete(`/reports/${id}`);
  return data;
}
