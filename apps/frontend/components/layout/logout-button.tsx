"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

/**
 * LogoutButton Component
 * Navigates to the login page on click. Uses lucide LogOut icon.
 */
export function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        useAuthStore.getState().signOut();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="group self-stretch px-4 py-3 rounded-lg flex justify-start items-center gap-3 cursor-pointer  hover:bg-rose-50 transition-all duration-200 w-full"
        >
            <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500 transition-colors duration-200" />
            <span className="text-rose-400 text-base font-medium leading-6 group-hover:text-rose-600 transition-colors duration-200">
                Log out
            </span>
        </button>
    );
}
