import React from "react";

interface ProjectSuccessModalProps {
  onClose: () => void;
}

/**
 * ProjectSuccessModal Component
 * Shown after a project is created successfully.
 */
export function ProjectSuccessModal({ onClose }: ProjectSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[400px] p-8 bg-white rounded-xl shadow-xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon Container */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center rounded-full border border-indigo-600">
          <div className="absolute inset-2 sm:inset-3 bg-indigo-50 rounded-full flex items-center justify-center">
            {/* Custom Wallet/Ticket SVG */}
            <svg width="68" height="58" viewBox="0 0 68 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 15L48 5L56 22" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="5" y="15" width="58" height="38" rx="6" stroke="#4F46E5" strokeWidth="4"/>
              <circle cx="15" cy="27" r="2" fill="#4F46E5"/>
              <circle cx="15" cy="41" r="2" fill="#4F46E5"/>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center text-stone-900 text-xl sm:text-2xl font-medium leading-8 px-2">
          New Project Created Successfully
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg flex justify-center items-center text-white"
        >
          <span className="text-sm font-medium leading-6">
            Close
          </span>
        </button>
      </div>
    </div>
  );
}

