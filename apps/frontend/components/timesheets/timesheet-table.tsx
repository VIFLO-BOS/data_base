'use client';

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface DayColumn {
  label: string;
}

interface TimesheetRowData {
  id?: string;
  taskerId?: string;
  projectId?: string;
  tasker: string;
  account: string;
  project: string;
  days: string[];
  totalHours: string;
  totalAmount: string;
  rawAmount?: number;
}

interface TimesheetTableProps {
  rows: TimesheetRowData[];
  dayColumns: DayColumn[];
  onViewPaymentDetails?: (row: TimesheetRowData) => void;
  onMarkAsPaid?: (row: TimesheetRowData) => void;
  onTimeCellClick?: (row: TimesheetRowData, dayIndex: number) => void;
}

/**
 * TimeCell Component
 * Renders a single time cell with --:-- format.
 */
function TimeCell({
  value,
  onClick,
  className = '',
}: {
  value: string;
  onClick?: () => void;
  className?: string;
}) {
  const isFilled = value !== '--:--';
  return (
    <div
      className={`flex items-center ${onClick ? 'cursor-pointer hover:bg-indigo-50 rounded-md px-1.5 py-0.5 -mx-1 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      <span
        className={`text-sm leading-6 whitespace-nowrap ${isFilled ? 'text-stone-900 font-medium' : 'text-stone-400 font-medium'}`}
      >
        {isFilled ? value : '--'}
      </span>
      {!isFilled && (
        <>
          <span className="text-indigo-400 text-sm font-medium leading-6 mx-0.5">:</span>
          <span className="text-stone-400 text-sm font-medium leading-6">--</span>
        </>
      )}
    </div>
  );
}

/* ─── Sticky column style helpers ─── */
const stickyLeftBase = 'sticky z-10 bg-white group-hover:bg-zinc-50 transition-colors';
const stickyHeaderBase = 'sticky z-20 bg-white';
const stickyCornerBase = 'sticky z-30 bg-white'; // header cells that are ALSO sticky-left

/**
 * TimesheetTable Component
 * Professional spreadsheet-style table with sticky left columns (Tasker/Account/Project)
 * and sticky right columns (Total Hours, Total Amount, Action).
 * Day columns scroll horizontally in the middle.
 * On mobile, renders as cards.
 */
export function TimesheetTable({
  rows,
  dayColumns,
  onViewPaymentDetails,
  onTimeCellClick,
}: TimesheetTableProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col gap-0">
      {/* ═══════════ DESKTOP TABLE (md+) ═══════════ */}
      <div className="hidden md:block w-full">
        <div
          className="w-full overflow-x-auto overflow-y-visible pb-20 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
          style={{ scrollbarGutter: 'stable' }}
        >
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="border-b border-zinc-200">
                {/* Sticky corner: Tasker (both top & left) */}
                <th
                  className={`${stickyCornerBase} left-0 text-left py-3 pr-4 pl-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[140px]`}
                >
                  Tasker
                </th>
                {/* Sticky corner: Account */}
                <th
                  className={`${stickyCornerBase} left-[140px] text-left py-3 px-4 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[130px]`}
                >
                  Account
                </th>
                {/* Sticky corner: Project */}
                <th
                  className={`${stickyCornerBase} left-[270px] text-left py-3 px-4 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[110px]`}
                  style={{ boxShadow: '2px 0 4px -1px rgba(0,0,0,0.06)' }}
                >
                  Project
                </th>

                {/* Scrollable day columns */}
                {dayColumns.map((col, i) => (
                  <th
                    key={i}
                    className="text-left py-3 px-3 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[90px] whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}

                {/* Right side: Total Hours */}
                <th className="text-left py-3 px-4 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[100px] border-l border-zinc-100 whitespace-nowrap">
                  Total Hours
                </th>
                {/* Right side: Total Amount */}
                <th className="text-left py-3 px-4 text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[110px] whitespace-nowrap">
                  Total Amount
                </th>
                {/* Action */}
                <th className="py-3 px-2 w-[48px]"></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-100 group hover:bg-zinc-50 transition-colors"
                  style={{ position: 'relative', zIndex: openMenuIndex === index ? 40 : 'auto' }}
                >
                  {/* Sticky left: Tasker */}
                  <td className={`${stickyLeftBase} left-0 py-3.5 pr-4 pl-2 min-w-[140px]`}>
                    <span className="text-stone-900 text-sm font-medium">{row.tasker}</span>
                  </td>
                  {/* Sticky left: Account */}
                  <td className={`${stickyLeftBase} left-[140px] py-3.5 px-4 min-w-[130px]`}>
                    <span className="text-stone-700 text-sm">{row.account}</span>
                  </td>
                  {/* Sticky left: Project (with shadow edge) */}
                  <td
                    className={`${stickyLeftBase} left-[270px] py-3.5 px-4 min-w-[110px]`}
                    style={{ boxShadow: '2px 0 4px -1px rgba(0,0,0,0.06)' }}
                  >
                    <span className="text-stone-700 text-sm">{row.project}</span>
                  </td>

                  {/* Day cells — iterate dayColumns to guarantee column count matches header */}
                  {dayColumns.map((col, dayIndex) => (
                    <td key={dayIndex} className="py-3.5 px-3 min-w-[90px]">
                      <TimeCell
                        value={row.days[dayIndex] ?? '--:--'}
                        onClick={() => onTimeCellClick?.(row, dayIndex)}
                      />
                    </td>
                  ))}

                  {/* Total Hours */}
                  <td className="py-3.5 px-4 min-w-[100px] border-l border-zinc-100">
                    <TimeCell value={row.totalHours} />
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-4 min-w-[110px]">
                    <span className="text-stone-900 text-sm font-medium whitespace-nowrap">
                      {row.totalAmount}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-2 w-[48px]">
                    <div className="relative flex justify-end items-center">
                      <button
                        onClick={() => toggleMenu(index)}
                        className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-stone-500" />
                      </button>

                      {openMenuIndex === index && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl border border-zinc-200 shadow-xl py-2 z-50 flex flex-col">
                          <button
                            onClick={() => {
                              toggleMenu(index);
                             
                            }}
                            className="px-4 py-2 text-left text-sm text-stone-700 hover:bg-zinc-50 transition-colors whitespace-nowrap"
                          >
                            Mark as Paid
                          </button>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ MOBILE CARDS (<md) ═══════════ */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex flex-col gap-3"
            style={{ zIndex: openMenuIndex === index ? 40 : 'auto' }}
          >
            {/* Header: Tasker info + action */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <div className="text-stone-900 text-[15px] font-semibold">{row.tasker}</div>
                <div className="text-zinc-500 text-xs">
                  {row.project} · {row.account}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => toggleMenu(index)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-stone-500" />
                </button>
                {openMenuIndex === index && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl border border-zinc-200 shadow-xl py-2 z-50 flex flex-col">
                   
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

            {/* Day cells grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {dayColumns.map((col, dayIndex) => (
                <div
                  key={dayIndex}
                  className="flex flex-col items-center bg-zinc-50 rounded-lg border border-zinc-100 py-2 px-1.5 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  onClick={() => onTimeCellClick?.(row, dayIndex)}
                >
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    {col.label}
                  </span>
                  <TimeCell value={row.days[dayIndex] ?? '--:--'} className="justify-center" />
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Total Hours
                </span>
                <TimeCell value={row.totalHours} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Total Amount
                </span>
                <span className="text-indigo-600 text-base font-semibold">{row.totalAmount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
