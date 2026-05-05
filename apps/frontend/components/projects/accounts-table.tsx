import React from"react";

interface Account {
 name: string;
 assignedTaskers: string;
 totalHours: number;
}

interface AccountsTableProps {
 accounts: Account[];
 count: number;
}

/**
 * AccountsTable Component
 * Displays the accounts list table within a project detail view.
 */
export function AccountsTable({ accounts, count }: AccountsTableProps) {
 return (
 <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 bg-white flex flex-col justify-start items-start gap-6">
 <div className="self-stretch flex flex-col justify-start items-start gap-4">
 <div className="self-stretch flex flex-col justify-start items-start gap-6">
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-between items-center">
 <div className="flex justify-start items-center gap-4">
 <div className="flex justify-center items-center gap-1">
 <div className="text-center justify-start text-stone-900 text-base font-medium leading-6">
 Accounts
 </div>
 <div className="h-6 p-2 bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] flex justify-center items-center gap-3 overflow-hidden">
 <div className="justify-start text-stone-900 text-xs font-medium leading-4">
 {count}
 </div>
 </div>
 </div>
 </div>
 <div className="p-0.5 bg-neutral-50 rounded-lg shadow-sm border-0 flex justify-center items-center gap-1">
 <div className="px-3 py-1.5 rounded shadow-[-6px_2px_12px_0px_rgba(0,0,0,0.04)] inline-flex flex-col justify-start items-start gap-2.5">
 <div className="self-stretch inline-flex justify-start items-center gap-2.5">
 <div className="justify-start text-stone-900 text-xs font-medium leading-4">
 All
 </div>
 </div>
 </div>
 <div className="px-3 py-1.5 bg-white rounded shadow-[-6px_2px_12px_0px_rgba(0,0,0,0.04)] inline-flex flex-col justify-start items-start gap-2.5">
 <div className="self-stretch inline-flex justify-start items-center gap-2.5">
 <div className="justify-start text-stone-900 text-xs font-medium leading-4">
 Active
 </div>
 </div>
 </div>
 <div className="px-3 py-1.5 rounded shadow-[-6px_2px_12px_0px_rgba(0,0,0,0.04)] inline-flex flex-col justify-start items-start gap-2.5">
 <div className="self-stretch inline-flex justify-start items-center gap-2.5">
 <div className="justify-start text-stone-900 text-xs font-medium leading-4">
 Archived
 </div>
 </div>
 </div>
 </div>
 <div
 data-property-1="Secondary"
 className="p-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-600 flex justify-center items-center gap-1.5"
 >
 <div className="justify-start text-indigo-600 text-xs font-medium leading-4">
 Add Account
 </div>
 <div className="w-4 h-4 relative overflow-hidden">
 <div className="w-2.5 h-2.5 left-[3.33px] top-[3.33px] absolute bg-indigo-600" />
 </div>
 </div>
 </div>
 <div className="self-stretch flex flex-col justify-start items-start gap-5">
 {/* Table Header */}
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-between items-center">
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Account Name
 </div>
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Assigned Tasker(s)
 </div>
 <div className="flex-1 justify-start text-zinc-500 text-sm font-medium leading-6">
 Total Hours{""}
 </div>
 <div className="w-6 h-6 relative origin-top-left -rotate-90 opacity-0 overflow-hidden">
 <div className="w-1 h-4 left-[10px] top-[3px] absolute bg-black" />
 </div>
 </div>
 {/* Table Rows */}
 {accounts.map((account, index) => (
 <div
 key={index}
 className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-between items-start"
 >
 <div className="flex-1 justify-start text-stone-900 text-sm font-medium leading-6">
 {account.name}
 </div>
 <div className="flex-1 inline-flex flex-col justify-start items-start gap-3">
 <div className="self-stretch inline-flex justify-start items-center gap-2">
 <div className="justify-start text-stone-900 text-sm font-medium leading-6">
 {account.assignedTaskers}
 </div>
 </div>
 </div>
 <div className="flex-1 justify-start text-stone-900 text-sm font-medium leading-6">
 {account.totalHours}
 </div>
 <div className="w-6 h-6 relative origin-top-left -rotate-90">
 <div className="w-1 h-4 left-[10px] top-[3px] absolute bg-black" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

