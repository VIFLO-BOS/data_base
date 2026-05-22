import React from 'react';

export default function TaskerDashboardPage() {
  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex flex-col">
              <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                Tasker Dashboard
              </div>
              <div className="text-zinc-400 text-xs font-medium mt-0.5">
                Welcome back! Overview of your tasks and timesheets.
              </div>
            </div>
          </div>
          <div className="w-full text-center py-12 text-stone-500">
            Tasker dashboard features coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
