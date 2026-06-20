'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshOnFocus, notifyDataMutated } from '../../../../hooks/use-refresh-on-focus';
import { TimelineHeader } from '../../../../components/timesheets/timeline-header';
import { OverviewFilter } from '../../../../components/dashboard/overview-filter';
import { TimelineSearchFilter } from '../../../../components/timesheets/timeline-search-filter';
import { TimesheetTable } from '../../../../components/timesheets/timesheet-table';
import { Pagination } from '../../../../components/accounts/pagination';
import { InputTimeModal } from '../../../../components/timesheets/input-time-modal';
import { PaymentDetailsModal } from '../../../../components/timesheets/payment-details-modal';
import { getTimesheets, updateTimesheetEntry } from '../../../../services/timesheet-service';
import { addTaskerPayment } from '../../../../services/tasker-service';
import { showError } from '@/lib/toast';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

/** Timezone-safe: always returns the LOCAL date string (YYYY-MM-DD), not UTC. */
function toLocalISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}



/**
 * Compute the columns based on the active period.
 */
function getColumns(
  dateStr?: string,
  period: 'Day' | 'Week' | 'Month' | 'Year' | 'All Time' = 'Week',
) {
  let base = new Date();
  if (dateStr && dateStr.includes('-')) {
    // Safely parse YYYY-MM-DD into a local Date at noon to prevent UTC boundary shifts
    const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
    base = new Date(y, m - 1, d || 1, 12, 0, 0);
  } else if (dateStr) {
    base = new Date(dateStr);
  } else {
    base.setHours(12, 0, 0, 0); // Secure current date at noon too
  }

  if (period === 'Day') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const isoDate = toLocalISODate(base);
    return {
      columns: [
        {
          label: `${dayNames[base.getDay()]} ${base.getMonth() + 1}/${base.getDate()}`,
          date: isoDate,
        },
      ],
      queryWeek: undefined,
    };
  }

  if (period === 'Month') {
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const columns = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isoDate = toLocalISODate(d);
      columns.push({ label: `${dayNames[d.getDay()]} ${month + 1}/${i}`, date: isoDate });
    }
    return { columns, queryWeek: undefined };
  }

  if (period === 'Year') {
    const year = base.getFullYear();
    const columns = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let i = 0; i < 12; i++) {
      // Use YYYY-MM prefix to match
      const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
      columns.push({ label: monthNames[i], date: prefix, isMonth: true });
    }
    return { columns, queryWeek: undefined };
  }

  if (period === 'All Time') {
    const year = base.getFullYear();
    const columns = [
      { label: String(year - 4), date: String(year - 4), isYear: true },
      { label: String(year - 3), date: String(year - 3), isYear: true },
      { label: String(year - 2), date: String(year - 2), isYear: true },
      { label: String(year - 1), date: String(year - 1), isYear: true },
      { label: String(year), date: String(year), isYear: true },
      { label: String(year + 1), date: String(year + 1), isYear: true },
    ];
    return { columns, queryWeek: undefined };
  }

  // Week
  const dayOfWeek = base.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const columns = dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const isoDate = toLocalISODate(d);
    return { label: `${name} ${month}/${day}`, date: isoDate };
  });

  const weekStarting = toLocalISODate(monday);
  return { columns, queryWeek: weekStarting };
}

/**
 * Admin Timesheets Page
 */
export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Period filter state
  const [activePeriod, setActivePeriod] = useState<'Day' | 'Week' | 'Month' | 'Year' | 'All Time'>(
    'All Time',
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Derive dynamic columns from selected date
  const { columns: dayColumns, queryWeek } = getColumns(selectedDate, activePeriod);

  // Time Input Modal State
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    dayIndex: number;
    dateLabel: string;
    date: string;
    initialValue: string;
  } | null>(null);

  const fetchTimesheets = useCallback(
    async (week?: string, period: string = 'Week') => {
      setIsLoading(true);
      try {
        const timesheetsData = await getTimesheets(1, 100, undefined, week);
        const cols = getColumns(selectedDate, period as any).columns;

        const mapped = timesheetsData.map((t: any) => {
          const days: string[] = cols.map(() => '--:--');

          if (t.entries && t.entries.length > 0) {
            if (period === 'Year') {
              // Aggregate by month prefix
              const monthTotals: Record<string, number> = {};
              t.entries.forEach((entry: any) => {
                const entryDateStr = entry.entryDate;
                const prefix = entryDateStr.substring(0, 7); // YYYY-MM
                monthTotals[prefix] = (monthTotals[prefix] || 0) + Number(entry.hoursWorked || 0);
              });
              cols.forEach((col, i) => {
                const total = monthTotals[col.date] || 0;
                if (total > 0) {
                  const h = Math.floor(total);
                  const m = Math.round((total - h) * 60);
                  days[i] = `${h}h:${String(m).padStart(2, '0')}m`;
                }
              });
            } else if (period === 'All Time') {
              const yearTotals: Record<string, number> = {};
              t.entries.forEach((entry: any) => {
                const entryDateStr = entry.entryDate;
                const yearStr = entryDateStr.substring(0, 4); // YYYY
                yearTotals[yearStr] = (yearTotals[yearStr] || 0) + Number(entry.hoursWorked || 0);
              });
              cols.forEach((col, i) => {
                const total = yearTotals[col.date] || 0;
                if (total > 0) {
                  const h = Math.floor(total);
                  const m = Math.round((total - h) * 60);
                  days[i] = `${h}h:${String(m).padStart(2, '0')}m`;
                }
              });
            } else {
              t.entries.forEach((entry: any) => {
                const entryDateStr = entry.entryDate;
                const colIndex = cols.findIndex((col) => col.date === entryDateStr);
                if (colIndex >= 0) {
                  const h = Math.floor(Number(entry.hoursWorked));
                  const m = Math.round((Number(entry.hoursWorked) - h) * 60);
                  days[colIndex] = `${h}h:${String(m).padStart(2, '0')}m`;
                }
              });
            }
          }

          const taskerName = t.tasker
            ? `${t.tasker.firstName || ''} ${t.tasker.lastName || ''}`.trim() ||
            t.tasker.user?.email ||
            'Unknown Tasker'
            : t.taskerName || 'Unknown Tasker';

          // Calculate precise total hours and amount from the matched entries in the current columns
          let columnTotalHours = 0;
          days.forEach((d) => {
            if (d !== '--:--') {
              const match = d.match(/(\d+)h:(\d+)m/);
              if (match) {
                columnTotalHours += parseInt(match[1]) + parseInt(match[2]) / 60;
              }
            }
          });

          // If period is Week, the backend exact values are accurate for that period.
          // For Day/Month/Year/All Time, use the dynamically calculated ones from columns.
          let finalTotalHoursNum = (period === 'Week') ? Number(t.totalHours || 0) : columnTotalHours;
          let finalRawAmount = t.rawAmount;
          let finalTotalAmount = t.totalAmount || '₦0.00';

          if (period !== 'Week') {
            const hourlyRate = Number(t.project?.pricePerHour || 0);
            const exactMinutes = Math.round(finalTotalHoursNum * 60);
            finalRawAmount = exactMinutes * (hourlyRate / 60);
            finalTotalAmount = finalRawAmount > 0
              ? `₦${finalRawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '₦0.00';
          }

          const th = Math.floor(finalTotalHoursNum);
          const tm = Math.round((finalTotalHoursNum - th) * 60);
          const totalHoursLabel = tm > 0 ? `${th}h:${String(tm).padStart(2, '0')}m` : `${th}h:00m`;

          return {
            id: t.id,
            taskerId: t.taskerId,
            projectId: t.projectId,
            rawAmount: finalRawAmount,
            tasker: taskerName,
            account: t.account?.name || 'Unassigned',
            project: t.project?.name || 'Unassigned',
            days,
            totalHours: totalHoursLabel,
            totalAmount: finalTotalAmount,
            status:
              t.status === 'approved'
                ? 'Approved'
                : t.status === 'submitted'
                  ? 'Submitted'
                  : 'Pending',
            weekStarting: t.weekStarting,
          };
        });

        // Show all taskers, including those with no hours logged yet
        const filteredMapped = mapped;

        setTimesheets(filteredMapped);
      } catch (error) {
        showError(error, 'Failed to fetch timesheets');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  const fetchTimesheetsStable = useCallback(() => {
    fetchTimesheets(queryWeek, activePeriod);
  }, [queryWeek, activePeriod, fetchTimesheets]);

  useEffect(() => {
    fetchTimesheetsStable();
  }, [fetchTimesheetsStable]);

  useRefreshOnFocus(fetchTimesheetsStable);

  // Payment Details Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState<any>(null);

  const handleTimeCellClick = (row: any, dayIndex: number) => {
    setEditingCell({
      rowId: row.id,
      dayIndex,
      dateLabel: dayColumns[dayIndex].label,
      date: dayColumns[dayIndex].date,
      initialValue: row.days[dayIndex],
    });
    setIsTimeModalOpen(true);
  };

  const handleTimeSubmit = async (hours: string, minutes: string) => {
    if (editingCell) {
      try {
        const totalHours = Number(hours) + Number(minutes) / 60;
        await updateTimesheetEntry(editingCell.rowId, editingCell.date, totalHours);
        await fetchTimesheets(queryWeek, activePeriod);
        notifyDataMutated();
      } catch (error) {
        showError(error, 'Failed to update timesheet entry');
      }
    }
    setIsTimeModalOpen(false);
  };

  const handleViewPaymentDetails = (row: any) => {
    setSelectedPaymentRow(row);
    setIsPaymentModalOpen(true);
  };

  const handleMarkAsPaid = async (row: any) => {
    if (!row.taskerId || !row.projectId || !row.rawAmount) {
      toast.error('Cannot mark as paid. Missing required data.');
      return;
    }

    try {
      const paymentDateStr = new Date().toISOString();
      await addTaskerPayment(row.taskerId, {
        amount: row.rawAmount,
        paymentDate: paymentDateStr,
        projectId: row.projectId,
      });
      toast.success(`Successfully logged payment of ${row.totalAmount} for ${row.tasker}`);
      await fetchTimesheets(queryWeek, activePeriod);
    } catch (err) {
      showError(err, 'Failed to save payment');
    }
  };

  let initialHours = '';
  let initialMinutes = '';
  if (editingCell && editingCell.initialValue !== '--:--') {
    const match = editingCell.initialValue.match(/(\d+)h:(\d+)m/);
    if (match) {
      initialHours = match[1];
      initialMinutes = match[2];
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-6 w-full">
      {/* Timeline Content */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch p-3 sm:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-4">
            {/* Header */}
            <TimelineHeader />

            {/* Period Filter (Day/Week/Month/Year + Date) */}
            <OverviewFilter
              activeFilter={activePeriod}
              onFilterChange={(f) => setActivePeriod(f)}
              selectedDate={selectedDate}
              onDateChange={(d) => setSelectedDate(d)}
            />

            {/* Search & Project Filter */}
            <TimelineSearchFilter projectFilter="Ventree" />

            {/* Timesheet Table */}
            {isLoading ? (
              <div className="w-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : timesheets.length === 0 ? (
              <div className="w-full py-12 text-center text-sm text-zinc-500">
                No timesheets found for the selected period.
              </div>
            ) : (
              <>
                <TimesheetTable
                  rows={timesheets}
                  dayColumns={dayColumns}
                  onTimeCellClick={
                    activePeriod === 'Year' || activePeriod === 'All Time'
                      ? undefined
                      : (row, dayIndex) => handleTimeCellClick(row, dayIndex)
                  }
                  onViewPaymentDetails={handleViewPaymentDetails}
                 
                />

                {/* Pagination */}
                <Pagination
                  currentPage={1}
                  totalPages={Math.ceil(timesheets.length / 9) || 1}
                  totalItems={timesheets.length}
                  itemsPerPage={9}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {isTimeModalOpen && editingCell && (
        <InputTimeModal
          date={editingCell.dateLabel}
          initialHours={initialHours}
          initialMinutes={initialMinutes}
          onClose={() => setIsTimeModalOpen(false)}
          onSubmit={handleTimeSubmit}
        />
      )}

      {isPaymentModalOpen && selectedPaymentRow && (
        <PaymentDetailsModal
          onClose={() => setIsPaymentModalOpen(false)}
          taskerName={selectedPaymentRow.tasker}
          amount={selectedPaymentRow.totalAmount}
          bankName="Glass Bank"
          accountName={selectedPaymentRow.tasker}
          accountNumber="00987654321"
        />
      )}
    </div>
  );
}
