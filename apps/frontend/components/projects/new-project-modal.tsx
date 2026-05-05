import React, { useState } from "react";
import { X } from "lucide-react";

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (project: { name: string; websiteLink: string; hourlyFee: string }) => void;
}

/**
 * NewProjectModal Component
 * Modal form for creating a new project with fields for name, website link, and hourly fee.
 */
export function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [hourlyFee, setHourlyFee] = useState("");

  const isFormValid = name.trim() !== "" && websiteLink.trim() !== "" && hourlyFee.trim() !== "";

  const handleSubmit = () => {
    if (isFormValid) {
      onCreate({ name, websiteLink, hourlyFee });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[500px] p-6 bg-white rounded-xl shadow-xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
          <div className="text-stone-900 text-xl font-medium leading-6">
            New Project
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-stone-900 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-stone-900 text-sm font-medium leading-6">
              Project's Name
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-stone-900 text-sm placeholder:text-zinc-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-stone-900 text-sm font-medium leading-6">
              Website link
            </label>
            <input
              type="text"
              placeholder="Enter link"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-stone-900 text-sm placeholder:text-zinc-400 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-stone-900 text-sm font-medium leading-6">
              Tasker's Hourly Fee
            </label>
            <input
              type="text"
              placeholder="Enter Fee ($)"
              value={hourlyFee}
              onChange={(e) => setHourlyFee(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border-0 shadow-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-stone-900 text-sm placeholder:text-zinc-400 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full px-4 py-3 rounded-lg flex justify-center items-center transition-all duration-200 ${
            isFormValid 
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
              : "bg-[#9fa0ff] text-white cursor-not-allowed"
          }`}
        >
          <span className="text-sm font-medium leading-6">
            Create Project
          </span>
        </button>
      </div>
    </div>
  );
}

