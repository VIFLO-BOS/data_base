import React from"react";

interface ProjectDetailHeaderProps {
 name: string;
 dateCreated: string;
 websiteLink: string;
 totalAccounts: number;
 totalTaskers: number;
 totalHoursLogged: number;
}

/**
 * ProjectDetailHeader Component
 * Displays the project detail view with name, status, date, website, and stats.
 */
export function ProjectDetailHeader({
 name,
 dateCreated,
 websiteLink,
 totalAccounts,
 totalTaskers,
 totalHoursLogged,
}: ProjectDetailHeaderProps) {
 return (
 <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 bg-white flex flex-col justify-start items-start gap-4">
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center gap-2">
 <div className="flex-1 flex justify-start items-center gap-2">
 <div className="justify-start text-stone-900 text-2xl font-medium leading-6">
 {name}
 </div>
 <div className="w-1.5 h-1.5 bg-green-500 rounded-full outline outline-[3px] outline-green-500/10" />
 </div>
 <div className="w-6 h-6 relative origin-top-left -rotate-90">
 <div className="w-1 h-4 left-[10px] top-[3px] absolute bg-black" />
 </div>
 </div>
 <div className="self-stretch inline-flex justify-start items-start gap-4">
 <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex justify-between items-center overflow-hidden">
 <div className="flex-1 inline-flex flex-col justify-center items-start gap-0.5">
 <div className="self-stretch justify-start text-text-secondary text-sm font-medium leading-6">
 Date Created
 </div>
 <div className="self-stretch justify-start text-text-secondary text-base font-medium leading-6">
 {dateCreated}
 </div>
 </div>
 </div>
 <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex justify-between items-center overflow-hidden">
 <div className="flex-1 inline-flex flex-col justify-center items-start gap-0.5">
 <div className="self-stretch justify-start text-text-secondary text-sm font-medium leading-6">
 Website link
 </div>
 <div className="self-stretch justify-start text-indigo-600 text-base font-medium underline leading-6">
 {websiteLink}
 </div>
 </div>
 </div>
 </div>
 <div className="self-stretch inline-flex justify-start items-start gap-4">
 <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex justify-start items-center gap-3 overflow-hidden">
 <div className="flex-1 inline-flex flex-col justify-center items-start gap-3">
 <div className="self-stretch h-14 flex flex-col justify-start items-start gap-0.5">
 <div className="self-stretch flex-1 inline-flex justify-start items-center gap-2.5">
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Total Accounts
 </div>
 </div>
 <div className="self-stretch justify-start text-stone-900 text-2xl font-medium leading-6">
 {totalAccounts}
 </div>
 </div>
 </div>
 </div>
 <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex justify-start items-center gap-3 overflow-hidden">
 <div className="flex-1 inline-flex flex-col justify-center items-start gap-3">
 <div className="self-stretch h-14 flex flex-col justify-start items-start gap-0.5">
 <div className="self-stretch flex-1 inline-flex justify-start items-center gap-2.5">
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Total Taskers
 </div>
 </div>
 <div className="self-stretch justify-start text-stone-900 text-2xl font-medium leading-6">
 {totalTaskers}
 </div>
 </div>
 </div>
 </div>
 <div className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-zinc-100 flex justify-start items-center gap-3 overflow-hidden">
 <div className="flex-1 inline-flex flex-col justify-center items-start gap-3">
 <div className="self-stretch h-14 flex flex-col justify-start items-start gap-0.5">
 <div className="self-stretch flex-1 inline-flex justify-start items-center gap-2.5">
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Total Hours Logged{""}
 </div>
 </div>
 <div className="self-stretch justify-start text-stone-900 text-2xl font-medium leading-6">
 {totalHoursLogged}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

