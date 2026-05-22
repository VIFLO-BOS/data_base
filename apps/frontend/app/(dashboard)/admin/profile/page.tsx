"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Camera } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const initials = user ? `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase() : "AD";
  const roleDisplay = user?.roles?.includes('super_admin') ? 'Super Admin' : (user?.roles?.[0] || 'Admin');
  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  My Profile
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Manage your personal admin account
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 mt-2">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner overflow-hidden relative">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white border border-stone-200 rounded-full shadow-sm text-stone-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full flex items-center gap-1.5 border border-stone-200">
                <Shield className="w-3 h-3" /> {roleDisplay}
              </span>
            </div>

            {/* Form Section */}
            <div className="flex-1 grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
                </label>
                <input type="email" value={user?.email || ""} readOnly className="h-10 px-3 bg-stone-100 border border-stone-200 text-stone-500 rounded-lg text-sm outline-none cursor-not-allowed" />
                <p className="text-xs text-stone-400 mt-0.5">Contact support to change your email address.</p>
              </div>

              <div className="border-t border-stone-100 pt-5 mt-2 flex justify-end gap-3">
                <button className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-lg transition-colors border border-stone-200">
                  Discard Changes
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                  Update Profile
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
