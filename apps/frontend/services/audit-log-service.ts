/**
 * Audit Log Service
 * Frontend service layer for audit log retrieval.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failed';
  createdAt: string;
}

export async function getAuditLogs(
  page = 1,
  limit = 50,
  filters?: { action?: string; user?: string },
) {
  const params: Record<string, any> = { page, limit, ...filters };
  const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params });
  return data;
}
