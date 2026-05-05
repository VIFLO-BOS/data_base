"use client";

import React from"react";
import { useRouter } from"next/navigation";
import { LogOut } from"lucide-react";

/**
 * LogoutButton Component
 * Navigates to the login page on click. Uses lucide LogOut icon.
 */
export function LogoutButton() {
 const router = useRouter();

 const handleLogout = () => {
 // Clear any auth tokens/state here if needed
 router.push("/login");
 };

 return (
 <button
 onClick={handleLogout}
 className="self-stretch px-4 py-3 rounded-md flex justify-start items-center gap-3 cursor-pointer hover:bg-red-50 transition-colors w-full"
 >
 <LogOut className="w-5 h-5 text-red-600" />
 <span className="text-red-600 text-base font-medium leading-6">
 Log out
 </span>
 </button>
 );
}

