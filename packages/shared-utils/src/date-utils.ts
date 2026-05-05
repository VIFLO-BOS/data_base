export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  // TODO: Implement date formatting
  return new Date(date).toISOString();
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function getPeriodFilter(period: 'day' | 'week' | 'month' | 'year', date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      return getWeekRange(date);
    case 'month':
      start.setDate(1);
      end.setMonth(date.getMonth() + 1, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
  }

  return { start, end };
}
