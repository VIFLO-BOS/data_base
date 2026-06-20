'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

type FilterType = 'Day' | 'Week' | 'Month' | 'Year' | 'All Time';

interface OverviewFilterProps {
  activeFilter: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * OverviewFilter Component
 * Features a beautifully styled custom Calendar popover and active states.
 */
export function OverviewFilter({
  activeFilter,
  onFilterChange,
  selectedDate,
  onDateChange,
}: OverviewFilterProps) {
  const filters: FilterType[] = ['Day', 'Week', 'Month', 'Year', 'All Time'];

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for the calendar view (which month/year we are currently looking at)
  const getSafeDate = (dStr?: string) => {
    if (!dStr) return new Date();
    if (dStr.includes('-')) {
      const [y, m, d] = dStr.split('T')[0].split('-').map(Number);
      return new Date(y, m - 1, d || 1, 12, 0, 0);
    }
    return new Date(dStr);
  };

  const [currentViewDate, setCurrentViewDate] = useState(getSafeDate(selectedDate));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'Select Date';
    const d = getSafeDate(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calendar logic
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    // Format YYYY-MM-DD
    const newDate = new Date(year, month, day);
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    onDateChange?.(formatted);
    setIsCalendarOpen(false);
  };

  const parsedSelectedDate = selectedDate ? getSafeDate(selectedDate) : null;

  return (
    <div className="self-stretch flex flex-wrap justify-start items-center gap-2.5">
      {/* Filter Toggle */}
      <div className="p-1 bg-[#F9F9F9] rounded-lg border border-zinc-100 flex justify-center items-center gap-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange?.(filter)}
            className={`px-4 py-1.5 rounded-md font-medium transition-all duration-200 ${filter === activeFilter
                ? 'bg-white shadow-sm text-stone-900 text-[13px]'
                : 'hover:bg-zinc-200/40 text-[13px] text-[#A0A0A0]'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Custom Date Picker Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 outline-none
            ${isCalendarOpen
              ? 'bg-zinc-100 border border-zinc-200 text-stone-900'
              : 'bg-[#F9F9F9] border border-zinc-100 text-stone-700 hover:bg-zinc-50'
            }
          `}
        >
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-[13px] font-medium">{formatDisplayDate(selectedDate) === 'Select Date' ? 'Date' : formatDisplayDate(selectedDate)}</span>
          <ChevronDown
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Calendar Panel */}
        {isCalendarOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border-0 shadow-sm ring-1 ring-zinc-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header: Month / Year controls */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-900 text-sm font-medium">
                {MONTH_NAMES[month]} {year}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap- mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-medium text-zinc-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty slots for first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected =
                  parsedSelectedDate &&
                  parsedSelectedDate.getDate() === day &&
                  parsedSelectedDate.getMonth() === month &&
                  parsedSelectedDate.getFullYear() === year;

                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDate(day)}
                    className={`
                      h-8 w-full rounded-md text-sm font-medium flex items-center justify-center transition-colors
                      ${isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : isToday
                          ? 'bg-zinc-100 text-stone-900 font-medium ring-1 ring-inset ring-zinc-200'
                          : 'text-stone-700 hover:bg-zinc-100 hover:text-stone-900'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center">
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentViewDate(today);
                  handleSelectDate(today.getDate());
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

