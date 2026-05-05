import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddNewTaskerModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

/**
 * AddNewTaskerModal Component
 * Modal form for adding a new tasker with name, phone, email, and bank details.
 */
export function AddNewTaskerModal({ onClose, onSubmit }: AddNewTaskerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    accountName: '',
    bank: '',
    accountNumber: '',
  });

  const isFormValid = Object.values(formData).every((val) => val.trim() !== '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
      <div className="w-full max-w-[600px] p-8 bg-white rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] pb-4">
          <h2 className="text-stone-900 text-2xl font-medium leading-6">
            Add New Taskers
          </h2>
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
              <label className="text-stone-900 text-sm font-medium">Tasker's Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-stone-900 text-sm font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/2 pr-2">
            <label className="text-stone-900 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email Address"
              className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-stone-900 text-sm font-medium">Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Enter Name"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-stone-900 text-sm font-medium">Bank</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                placeholder="Enter Name of Bank"
                className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/2 pr-2">
            <label className="text-stone-900 text-sm font-medium">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter Account Number"
              className="w-full p-3 rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 outline-none focus:border-indigo-600 transition-colors placeholder:text-stone-400"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded-xl text-white font-medium transition-colors mt-2 ${
              isFormValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600/50 cursor-not-allowed'
            }`}
          >
            Add Tasker
          </button>
        </form>
      </div>
    </div>
  );
}

