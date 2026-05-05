"use client";

import { useState } from"react";
import { StatCard } from"../../../../components/dashboard/stat-card";
import { OverviewFilter } from"../../../../components/dashboard/overview-filter";
import { ChartArea } from"../../../../components/dashboard/chart-area";
import { useDashboardStore } from "../../../../store/dashboardStore";

type FilterType ="Day" |"Week" |"Month" |"Year";

/** Label sets for each filter period */
const chartLabelsByFilter: Record<FilterType, string[]> = {
 Day: ["12am","4am","8am","12pm","4pm","8pm","11pm"],
 Week: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
 Month: ["Week 1","Week 2","Week 3","Week 4"],
 Year: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

/** Comparison text suffix for each filter period */
const comparisonText: Record<FilterType, string> = {
 Day:"Than last Day",
 Week:"Than last Week",
 Month:"Than last Month",
 Year:"Than last Year",
};

/**
 * Admin Dashboard Page
 * Analytics cards, charts, recent activities, filter by day/week/month/year.
 */
export default function AdminDashboardPage() {
 const [activeFilter, setActiveFilter] = useState<FilterType>("Day");
 const [selectedDate, setSelectedDate] = useState<string>("");

 const { accounts, taskers } = useDashboardStore();
 const activeAccountsCount = accounts.filter(a => a.status === 'Active').length;
 const activeTaskersCount = taskers.filter(t => t.status === 'Assigned').length;

 return (
 <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
 {/* Dashboard Content */}
 <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
 <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-end gap-4">
 {/* Dashboard Title */}
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center gap-2">
 <div className="flex-1 flex justify-start items-center gap-2">
 <div className="justify-start text-stone-900 text-xl lg:text-2xl font-semibold leading-6">
 Dashboard
 </div>
 </div>
 </div>

 {/* Overview Section */}
 <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-sm border-0 flex flex-col justify-start items-start gap-4">
 {/* Overview Title */}
 <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex justify-start items-center">
 <div className="justify-center text-stone-900 text-xl lg:text-2xl font-semibold leading-6">
 Overview
 </div>
 </div>

 {/* Interactive Filter Buttons + Date Picker */}
 <OverviewFilter
 activeFilter={activeFilter}
 onFilterChange={setActiveFilter}
 selectedDate={selectedDate}
 onDateChange={setSelectedDate}
 />

 {/* Stat Cards - 2×2 Grid (1 col on mobile, 2 cols on md+) */}
 <div className="self-stretch w-full grid grid-cols-1 md:grid-cols-2 gap-4">
 <StatCard
 label="Projects"
 value="30"
 percentage="10.23%"
 comparisonText={comparisonText[activeFilter]}
 trend="up"
 />
 <StatCard
 label="Active Accounts"
 value={activeAccountsCount.toString()}
 percentage="10.23%"
 comparisonText={comparisonText[activeFilter]}
 trend="up"
 />
 <StatCard
 label="Active Taskers"
 value={activeTaskersCount.toString()}
 percentage="10.23%"
 comparisonText={comparisonText[activeFilter]}
 trend="up"
 />
 <StatCard
 label="Hours Today"
 value="80"
 percentage="10.23%"
 comparisonText={comparisonText[activeFilter]}
 trend="down"
 />
 </div>

 {/* Chart */}
 <ChartArea
 labels={chartLabelsByFilter[activeFilter]}
 data={{
 projects: 30,
 activeAccounts: activeAccountsCount,
 activeTaskers: activeTaskersCount,
 hoursToday: 80,
 }}
 />
 </div>
 </div>
 </div>
 </div>
 );
}
