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
  const [description, setDescription] = useState(project.description || "");
  const [platformName, setPlatformName] = useState(project.platformName || "");
  const [platformUrl, setPlatformUrl] = useState(project.platformUrl || "");
  const [pricePerHour, setPricePerHour] = useState(project.pricePerHour?.toString() || "");

  const handleSubmit = () => {
    onUpdate(project.id, {
      name,
      description,
      platformName,
      platformUrl,
      pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-stone-900 text-lg font-semibold">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Platform URL</label>
            <input
              type="url"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone-700 text-sm font-medium">Price Per Hour ($)</label>
            <input
              type="number"
              step="0.01"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
