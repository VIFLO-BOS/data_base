import React from 'react';
import { Wallet } from 'lucide-react';

interface TaskerSuccessModalProps {
  onClose: () => void;
}

/**
 * TaskerSuccessModal Component
 * Shown after a tasker is added successfully.
 */
export function TaskerSuccessModal({ onClose }: TaskerSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
      <div className="w-[400px] p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <div className="w-32 h-32 relative flex items-center justify-center">
          {/* Outer circle thin */}
          <div className="absolute inset-0 rounded-full border border-indigo-200"></div>
          {/* Inner circle thick/filled */}
          <div className="absolute inset-2 rounded-full bg-indigo-50 flex items-center justify-center">
            <Wallet className="w-12 h-12 text-indigo-600" strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-center text-stone-900 text-xl font-medium leading-6">
          Tasker Added Successfully
        </h2>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

