/**
 * Analytics Service
 * Frontend service layer for dashboard summary metrics.
 */
import { apiClient } from './api-client';

export interface DashboardSummary {
  totalProjects: number;
  activeAccounts: number;
  activeTaskers: number;
  totalHoursToday: number;
  projectsTrend?: number;
  accountsTrend?: number;
  taskersTrend?: number;
  hoursTrend?: number;
  chartData?: {
    labels: string[];
    projects: number[];
    accounts: number[];
    taskers: number[];
    hours: number[];
  };
}

export async function getDashboardSummary(period?: string, date?: string) {
  const params: Record<string, any> = {};
  if (period) params.period = period;
  if (date) params.date = date;
  const { data } = await apiClient.get<any>('/dashboard-analytics/summary', { params });
  // Backend wraps in { data: { ... }, statusCode, timestamp } via TransformInterceptor
  return data.data ?? data;
}
