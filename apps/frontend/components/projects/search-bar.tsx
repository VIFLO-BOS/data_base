import React from"react";

/**
 * SearchBar Component
 * Reusable search input used across projects pages.
 */
export function SearchBar() {
 return (
 <div className="w-80 h-14 px-5 bg-neutral-50 rounded-2xl inline-flex justify-start items-center gap-3">
 <div className="w-5 h-5 relative">
 <div className="w-3.5 h-3.5 left-[2.32px] top-[2.32px] absolute rounded-full outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 <div className="w-[2.94px] h-[2.93px] left-[15.02px] top-[15.40px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 </div>
 <div className="flex-1 justify-center text-stone-300 text-sm font-medium leading-6">
 Search here
 </div>
 </div>
 );
}

