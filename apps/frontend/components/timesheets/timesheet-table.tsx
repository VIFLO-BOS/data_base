'use client';

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface DayColumn {
  label: string;
}

interface TimesheetRowData {
  tasker: string;
  account: string;
  days: string[];
  totalHours: string;
  totalAmount: string;
}

interface TimesheetTableProps {
  rows: TimesheetRowData[];
  dayColumns: DayColumn[];
  onViewPaymentDetails?: (row: TimesheetRowData) => void;
  onTimeCellClick?: (row: TimesheetRowData, dayIndex: number) => void;
}

/**
 * TimeCell Component
 * Renders a single time cell with --:-- format.
 */
function TimeCell({ 
  value, 
  width = 'w-16', 
  onClick 
}: { 
  value: string; 
  width?: string;
  onClick?: () => void;
}) {
  const isFilled = value !== '--:--';
  return (
    <div 
      className={`${width} flex items-center ${onClick ? 'cursor-pointer hover:bg-zinc-100 rounded px-1 -mx-1 transition-colors' : ''}`}
      onClick={onClick}
    >
      <span className={`text-sm leading-6 ${isFilled ? 'text-stone-900 font-medium' : 'text-stone-900 font-medium opacity-50'}`}>
        {isFilled ? value : '--'}
      </span>
      {!isFilled && (
        <>
          <span className="text-indigo-600 text-sm font-medium leading-6 opacity-50 mx-0.5">:</span>
          <span className="text-stone-900 text-sm font-medium leading-6 opacity-50">--</span>
        </>
      )}
    </div>
  );
}

/**
 * TimesheetTable Component
 * Weekly timesheet table with Tasker, Account, day columns (Mon-Sun),
 * Total Hours, Total Amount, and action chevrons.
 */
export function TimesheetTable({ 
  rows, 
  dayColumns,
  onViewPaymentDetails,
  onTimeCellClick
}: TimesheetTableProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Table Content */}
      <div className="w-full flex flex-col">
        {/* Column Headers */}
        <div className="w-full py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[1.5fr_1.5fr_repeat(7,1fr)_1fr_1fr_48px] gap-2 items-center">
          <div className="text-zinc-500 text-sm font-medium">Tasker</div>
          <div className="text-zinc-500 text-sm font-medium">Account</div>
          {dayColumns.map((col, i) => (
            <div key={i} className="text-zinc-500 text-sm font-medium">
              {col.label}
            </div>
          ))}
          <div className="text-zinc-500 text-sm font-medium">Total Hours</div>
          <div className="text-zinc-500 text-sm font-medium">Total Amount</div>
          <div></div>
        </div>

        {/* Data Rows */}
        {rows.map((row, index) => (
          <div
            key={index}
            className="w-full py-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] grid grid-cols-[1.5fr_1.5fr_repeat(7,1fr)_1fr_1fr_48px] gap-2 items-center hover:bg-zinc-50 transition-colors group relative"
          >
            <div className="text-stone-900 text-sm font-medium">{row.tasker}</div>
            <div className="text-stone-900 text-sm">{row.account}</div>
            
            {row.days.map((day, dayIndex) => (
              <TimeCell 
                key={dayIndex} 
                value={day} 
                width="w-full" 
                onClick={() => onTimeCellClick?.(row, dayIndex)}
              />
            ))}
            
            <TimeCell value={row.totalHours} width="w-full" />
            
            <div className="text-stone-900 text-sm">{row.totalAmount}</div>
            
            <div className="flex justify-end items-center relative">
              <button
                onClick={() => toggleMenu(index)}
                className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-stone-500" />
              </button>
              
              {/* Dropdown Menu */}
              {openMenuIndex === index && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl border-0 shadow-sm py-2 z-10 flex flex-col">
                  <button 
                    onClick={() => {
                      toggleMenu(index);
                      onViewPaymentDetails?.(row);
                    }}
                    className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors whitespace-nowrap"
                  >
                    View Payment details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

