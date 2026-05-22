'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InputTimeModalProps {
  date?: string;
  initialHours?: string;
  initialMinutes?: string;
  onClose: () => void;
  onSubmit: (hours: string, minutes: string) => void;
}

/**
 * InputTimeModal Component
 * Supabase-style modal for inputting hours and minutes.
 */
export function InputTimeModal({
  date = 'Monday 2nd, March, 2026',
  initialHours = '',
  initialMinutes = '',
  onClose,
  onSubmit,
}: InputTimeModalProps) {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  const isFormValid = hours.trim() !== '' && minutes.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(hours, minutes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="w-full max-w-[460px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-stone-900 text-lg font-semibold">Input Time</h2>
            <div className="w-px h-4 bg-zinc-300"></div>
            <span className="text-zinc-500 text-sm">Date</span>
            <div className="px-2.5 py-0.5 bg-indigo-50 rounded-full ring-1 ring-indigo-100">
              <span className="text-indigo-600 text-xs font-medium">{date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-stone-700 text-sm font-medium">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="00"
                className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
            >
              Add Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
