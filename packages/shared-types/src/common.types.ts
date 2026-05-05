export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardFilter {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}
