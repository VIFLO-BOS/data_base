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
 * Modal for inputting hours and minutes for a specific date.
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
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
      <div className="w-[500px] p-6 bg-white rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-stone-900 text-lg font-medium">Input time</h2>
            <div className="w-px h-4 bg-zinc-300"></div>
            <span className="text-zinc-500 text-sm">Date</span>
            <div className="px-3 py-1 bg-zinc-100 rounded-full flex items-center">
              <span className="text-stone-900 text-xs font-medium">{date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-stone-900 text-sm font-medium">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Enter"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-stone-900 text-sm font-medium">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Enter"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded-xl text-white font-medium transition-colors mt-2 ${
              isFormValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'
            }`}
          >
            Add Time
          </button>
        </form>
      </div>
    </div>
  );
}

