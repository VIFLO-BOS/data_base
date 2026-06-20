"use client";

import React from "react";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  Platform Settings
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Manage global preferences and configurations
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

          <div className="w-full max-w-3xl grid gap-8">
            {/* General Settings */}
            <div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">General Configuration</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Platform Name</label>
                  <input type="text" defaultValue="Paylio" className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Support Email</label>
                  <input type="email" defaultValue="support@paylio.com" className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">Admin Notifications</h3>
              <div className="grid gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500" />
                  <span className="text-sm text-stone-700">Email me when a new Tasker registers</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500" />
                  <span className="text-sm text-stone-700">Email me on payout failures</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500" />
                  <span className="text-sm text-stone-700">Weekly platform summary report</span>
                </label>
              </div>
            </div>
            
            {/* Theme / Appearance */}
            <div className="grid gap-4">
              <h3 className="text-stone-900 font-semibold border-b border-stone-100 pb-2">Appearance</h3>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 border-2 border-indigo-500 bg-stone-50 rounded-lg font-medium text-indigo-700 text-sm cursor-pointer flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border border-indigo-200"></div> Light
                </div>
                <div className="px-4 py-2 border border-stone-200 bg-stone-50 rounded-lg font-medium text-stone-600 text-sm cursor-pointer flex items-center gap-2 hover:border-stone-300">
                  <div className="w-4 h-4 rounded-full bg-stone-800 border border-stone-700"></div> Dark
                </div>
                <div className="px-4 py-2 border border-stone-200 bg-stone-50 rounded-lg font-medium text-stone-600 text-sm cursor-pointer flex items-center gap-2 hover:border-stone-300">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-stone-200 to-stone-800 border border-stone-300"></div> System
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
