/**
 * Analytics Service
 * Frontend service layer for dashboard summary metrics.
 */
import { apiClient } from './api-client';

export interface DashboardSummary {
  data(data: any): unknown;
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
  const { data } = await apiClient.get<DashboardSummary>('/dashboard-analytics/summary', { params });
  return data;
}
