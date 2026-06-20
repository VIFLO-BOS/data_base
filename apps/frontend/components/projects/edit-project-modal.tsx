import React, { useState } from "react";
import { X } from "lucide-react";
import { Project } from "../../services/project-service";

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function EditProjectModal({ project, onClose, onUpdate }: EditProjectModalProps) {
  const [name, setName] = useState(project.name || "");
  const [platformUrl, setPlatformUrl] = useState(project.platformUrl || "");
  const [pricePerHour, setPricePerHour] = useState(project.pricePerHour?.toString() || "");

  const handleSubmit = () => {
    onUpdate(project.id, {
      name,
      platformUrl,
      pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-[595px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* ---- Header ---- */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-stone-900 text-2xl font-medium leading-6">
            Edit Project
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* ---- Body ---- */}
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-900">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full h-14 px-5 bg-neutral-50 rounded-2xl border border-zinc-200 text-sm font-medium text-stone-900 placeholder:text-stone-300 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-colors"
            />
          </div>



          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-900">Platform URL</label>
            <input
              type="url"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-14 px-5 bg-neutral-50 rounded-2xl border border-zinc-200 text-sm font-medium text-stone-900 placeholder:text-stone-300 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-900">Taskers Hourly Fee</label>
            <input
              type="number"
              step="0.01"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              placeholder="0.00"
              className="w-full h-14 px-5 bg-neutral-50 rounded-2xl border border-zinc-200 text-sm font-medium text-stone-900 placeholder:text-stone-300 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-colors"
            />
          </div>

          {/* ---- Submit button ---- */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
