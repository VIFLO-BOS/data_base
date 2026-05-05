import React from 'react';
import { X } from 'lucide-react';

interface PaymentDetailsModalProps {
  onClose: () => void;
  taskerName: string;
  amount: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

/**
 * PaymentDetailsModal Component
 * Shows payment breakdown for a specific tasker.
 */
export function PaymentDetailsModal({
  onClose,
  taskerName,
  amount,
  bankName,
  accountName,
  accountNumber,
}: PaymentDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
      <div className="w-[500px] p-6 bg-white rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-stone-900 text-lg font-medium">Payment Details</h2>
            <div className="w-px h-4 bg-zinc-300"></div>
            <span className="text-zinc-500 text-sm">Tasker</span>
            <div className="px-2 py-1 bg-zinc-100 rounded-full flex items-center">
              <span className="text-stone-900 text-xs font-medium">{taskerName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 rounded-xl border-0 shadow-sm bg-white flex flex-col gap-1">
          <span className="text-zinc-500 text-sm">Amount</span>
          <span className="text-stone-900 text-3xl font-medium">{amount}</span>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-xl border-0 shadow-sm bg-white flex flex-col gap-1">
            <span className="text-zinc-500 text-xs">Bank</span>
            <span className="text-stone-900 text-sm font-medium">{bankName}</span>
          </div>
          <div className="flex-1 p-4 rounded-xl border-0 shadow-sm bg-white flex flex-col gap-1">
            <span className="text-zinc-500 text-xs">Account Name</span>
            <span className="text-stone-900 text-sm font-medium">{accountName}</span>
          </div>
          <div className="flex-1 p-4 rounded-xl border-0 shadow-sm bg-white flex flex-col gap-1">
            <span className="text-zinc-500 text-xs">Account Number</span>
            <span className="text-stone-900 text-sm font-medium">{accountNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

