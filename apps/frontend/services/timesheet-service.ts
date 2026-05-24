/**
 * Timesheet Service
 * Frontend service layer for timesheet CRUD and workflow operations.
 */
import { apiClient } from './api-client';
import type { PaginatedResponse } from './project-service';

export interface Timesheet {
  id: string;
  taskerId: string;
  taskerName?: string;
  accountName?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  totalAmount?: string;
  entries?: TimesheetEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetEntry {
  date: string;
  hours: number;
  notes?: string;
}

export interface TimesheetRecord {
  id: string;
  taskerId: string;
  projectId: string;
  accountId?: string;
  status: string;
  totalHours: number;
  weekStarting?: string;
  tasker?: any;
  project?: any;
  account?: { id: string; name: string };
  entries?: any[];
}

export async function getTimesheets(
  page = 1,
  limit = 20,
  status?: string,
  weekStarting?: string,
): Promise<TimesheetRecord[]> {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  if (weekStarting) params.weekStarting = weekStarting;
  const { data } = await apiClient.get<any>('/timesheets', { params });
  const payload = data.data;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

export async function getTimesheetById(id: string) {
  const { data } = await apiClient.get<Timesheet>(`/timesheets/${id}`);
  return data;
}

export async function createTimesheet(payload: Partial<Timesheet>) {
  const { data } = await apiClient.post<Timesheet>('/timesheets', payload);
  return data;
}

export async function submitTimesheet(id: string) {
  const { data } = await apiClient.patch<Timesheet>(`/timesheets/${id}/submit`);
  return data;
}

export async function approveTimesheet(id: string) {
  const { data } = await apiClient.patch<Timesheet>(`/timesheets/${id}/approve`);
  return data;
}

export async function rejectTimesheet(id: string) {
  const { data } = await apiClient.patch<Timesheet>(`/timesheets/${id}/reject`);
  return data;
}

export async function updateTimesheetEntry(
  timesheetId: string,
  entryDate: string,
  hoursWorked: number,
  taskDescription?: string,
) {
  const { data } = await apiClient.patch<Timesheet>(`/timesheets/${timesheetId}/entries`, {
    entryDate,
    hoursWorked,
    taskDescription,
  });
  return data;
}

export async function updateTimesheet(id: string, payload: Partial<Timesheet>) {
  const { data } = await apiClient.patch<Timesheet>(`/timesheets/${id}`, payload);
  return data;
}
