import React from"react";

/**
 * AddAccountModal Component
 * Modal form for adding an account to a project.
 */
export function AddAccountModal() {
 return (
 <div className="w-[1440px] h-[979px] p-8 left-0 top-0 absolute bg-black/30 flex justify-center items-center gap-2.5 overflow-hidden">
 <div className="w-[595px] p-6 bg-white rounded-xl shadow-md border-0 bg-white inline-flex flex-col justify-start items-start gap-4">
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-between items-center">
 <div className="justify-center text-stone-900 text-2xl font-medium leading-6">
 Add Account
 </div>
 <div className="p-1.5 flex justify-start items-center gap-[3.20px]">
 <div className="w-5 h-5 relative overflow-hidden">
 <div className="w-5 h-5 left-0 top-0 absolute" />
 <div className="w-2.5 h-2.5 left-[4.20px] top-[4.20px] absolute bg-text-primary outline outline-[1.60px] outline-offset-[-0.80px] outline-text-primary" />
 <div className="w-2.5 h-2.5 left-[4.20px] top-[4.20px] absolute bg-text-primary outline outline-[1.60px] outline-offset-[-0.80px] outline-text-primary" />
 </div>
 </div>
 </div>
 <div className="self-stretch flex flex-col justify-start items-start gap-2">
 <div className="self-stretch justify-start text-text-primary text-sm font-medium leading-6">
 Project
 </div>
 <div className="self-stretch p-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-line-default inline-flex justify-between items-center">
 <div className="flex-1 justify-start text-text-primary text-sm font-medium leading-6">
 Ventree
 </div>
 <div className="w-2.5 h-5 relative origin-top-left rotate-90 rounded-[90px] overflow-hidden">
 <div className="w-2.5 h-1.5 left-[4.69px] top-[2.57px] absolute bg-stone-300" />
 </div>
 </div>
 </div>
 <div className="self-stretch flex flex-col justify-start items-start gap-2">
 <div className="self-stretch inline-flex justify-between items-start">
 <div className="justify-start text-text-primary text-sm font-medium leading-6">
 Search Account
 </div>
 <div
 data-property-1="Secondary"
 className="p-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-600 flex justify-center items-center gap-1.5"
 >
 <div className="justify-start text-indigo-600 text-xs font-medium leading-4">
 Add New Account
 </div>
 <div className="w-4 h-4 relative overflow-hidden">
 <div className="w-2.5 h-2.5 left-[3.33px] top-[3.33px] absolute bg-indigo-600" />
 </div>
 </div>
 </div>
 <div className="self-stretch h-14 px-5 bg-neutral-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-line-default inline-flex justify-start items-center gap-3">
 <div className="w-5 h-5 relative">
 <div className="w-3.5 h-3.5 left-[2.32px] top-[2.32px] absolute rounded-full outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 <div className="w-[2.94px] h-[2.93px] left-[15.02px] top-[15.40px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 </div>
 <div className="flex-1 justify-center text-stone-300 text-sm font-medium leading-6">
 Search here
 </div>
 </div>
 </div>
 <div className="self-stretch flex flex-col justify-start items-start gap-2">
 <div className="self-stretch justify-start text-text-primary text-sm font-medium leading-6">
 {""}
 Assigned Tasker(s)
 </div>
 <div className="self-stretch h-14 px-5 bg-neutral-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-line-default inline-flex justify-start items-center gap-3">
 <div className="w-5 h-5 relative">
 <div className="w-3.5 h-3.5 left-[2.32px] top-[2.32px] absolute rounded-full outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 <div className="w-[2.94px] h-[2.93px] left-[15.02px] top-[15.40px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-stone-300" />
 </div>
 <div className="flex-1 justify-center text-stone-300 text-sm font-medium leading-6">
 Search here
 </div>
 </div>
 </div>
 <div
 data-property-1="Primary"
 className="self-stretch px-4 py-3 opacity-50 bg-indigo-600 rounded-lg inline-flex justify-center items-center gap-1.5"
 >
 <div className="justify-start text-text-inverse text-base font-medium leading-6">
 Add Account
 </div>
 </div>
 </div>
 </div>
 );
}

