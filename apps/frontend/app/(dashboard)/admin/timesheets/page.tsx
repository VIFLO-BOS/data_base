'use client';

import React, { useState } from 'react';
import { TimelineHeader } from '../../../../components/timesheets/timeline-header';
import { TimelinePeriodFilter } from '../../../../components/timesheets/timeline-period-filter';
import { TimelineSearchFilter } from '../../../../components/timesheets/timeline-search-filter';
import { TimesheetTable } from '../../../../components/timesheets/timesheet-table';
import { Pagination } from '../../../../components/accounts/pagination';
import { InputTimeModal } from '../../../../components/timesheets/input-time-modal';
import { PaymentDetailsModal } from '../../../../components/timesheets/payment-details-modal';
import { useDashboardStore } from '../../../../store/dashboardStore';

const dayColumns = [
  { label: 'Mon 2/26' },
  { label: 'Tue 3/26' },
  { label: 'Wed 4/26' },
  { label: 'Thur 5/26' },
  { label: 'Fri 6/26' },
  { label: 'Sat 7/26' },
  { label: 'Sun 8/26' },
];

/**
 * Admin Timesheets Page
 * Weekly timesheet view with tasker/account rows, day columns, and time input.
 */
export default function TimesheetsPage() {
  const { timesheets, updateTimesheet } = useDashboardStore();
  
  // Time Input Modal State
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; dayIndex: number; dateLabel: string; initialValue: string } | null>(null);

  // Payment Details Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState<any>(null);

  const handleTimeCellClick = (row: any, dayIndex: number) => {
    setEditingCell({ 
      rowId: row.id, 
      dayIndex, 
      dateLabel: dayColumns[dayIndex].label,
      initialValue: row.days[dayIndex]
    });
    setIsTimeModalOpen(true);
  };

  const handleTimeSubmit = (hours: string, minutes: string) => {
    if (editingCell) {
      updateTimesheet(editingCell.rowId, editingCell.dayIndex, `${hours}h:${minutes.padStart(2, '0')}m`);
    }
    setIsTimeModalOpen(false);
  };

  const handleViewPaymentDetails = (row: any) => {
    setSelectedPaymentRow(row);
    setIsPaymentModalOpen(true);
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
          <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-4">
            {/* Header */}
            <TimelineHeader />

            {/* Period Filter (Day/Week/Month/Year + Date) */}
            <TimelinePeriodFilter activePeriod="Day" />

            {/* Search & Project Filter */}
            <TimelineSearchFilter projectFilter="Ventree" />

            {/* Timesheet Table */}
            <TimesheetTable 
              rows={timesheets} 
              dayColumns={dayColumns} 
              onTimeCellClick={(row, dayIndex) => {
                handleTimeCellClick(row, dayIndex);
              }}
              onViewPaymentDetails={handleViewPaymentDetails}
            />

            {/* Pagination */}
            <Pagination currentPage={1} totalPages={Math.ceil(timesheets.length / 9) || 1} totalItems={timesheets.length} itemsPerPage={9} />
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
