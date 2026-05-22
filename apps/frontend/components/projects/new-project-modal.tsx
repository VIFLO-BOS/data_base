import React, { useState } from "react";
import { X } from "lucide-react";

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (project: { name: string; platformName: string; platformUrl: string; pricePerHour: number }) => void;
}

/**
 * NewProjectModal Component
 * Supabase-style modal form for creating a new project.
 */
export function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");

  const isFormValid = name.trim() !== "" && platformName.trim() !== "" && platformUrl.trim() !== "" && pricePerHour.trim() !== "";

  const handleSubmit = () => {
    if (isFormValid) {
      onCreate({ 
        name, 
        platformName, 
        platformUrl, 
        pricePerHour: parseFloat(pricePerHour) 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-stone-900 text-lg font-semibold">New Project</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Project&apos;s Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Platform Name</label>
            <input
              type="text"
              placeholder="e.g. Upwork, Fiverr"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Platform URL</label>
            <input
              type="url"
              placeholder="https://"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Price Per Hour ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isFormValid 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
