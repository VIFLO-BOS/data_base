'use client';

import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartAreaProps {
  labels: string[];
  data?: {
    projects: number;
    activeAccounts: number;
    activeTaskers: number;
    hoursToday: number;
    hoursLabel?: string;
    chartData?: {
      labels: string[];
      projects: number[];
      accounts: number[];
      taskers: number[];
      hours: number[];
    };
  };
}

// Mock curve data points to match the original visual design
const MOCK_CURVE = [15, 35, 20, 50, 45, 65, 85, 40, 60, 30, 70, 90];

/**
 * ChartArea Component
 * Displays the overview area chart using Recharts for standard interactive behavior.
 */
export function ChartArea({ labels, data }: ChartAreaProps) {
  const stats = data || {
    projects: 0,
    activeAccounts: 0,
    activeTaskers: 0,
    hoursToday: 0,
  };

  const hasData =
    stats.projects > 0 ||
    stats.activeAccounts > 0 ||
    stats.activeTaskers > 0 ||
    stats.hoursToday > 0;

  // Use real backend chart data if available, otherwise fallback to mock
  const realChartData = stats.chartData?.hours || [];

  // Map labels to Recharts array structure
  const chartData = labels.map((label, index) => ({
    name: label,
    value: hasData ? (realChartData[index] ?? MOCK_CURVE[index % MOCK_CURVE.length]) : 0,
  }));

  const CustomTooltip = ({ active }: any) => {
    if (active) {
      return (
        <div className="relative flex flex-col items-center">
          <div className="bg-[#4F46E5] rounded-xl px-4 py-3 flex flex-col gap-1 shadow-lg shadow-indigo-500/20 min-w-[160px]">
            <div className="text-center text-white text-[13px] font-medium leading-5">
              {stats.projects} Projects
            </div>
            <div className="text-center text-white text-[13px] font-medium leading-5">
              {stats.activeAccounts} Active Accounts
            </div>
            <div className="text-center text-white text-[13px] font-medium leading-5">
              {stats.activeTaskers} Active Taskers
            </div>
            <div className="text-center text-white text-[13px] font-medium leading-5">
              {stats.hoursLabel || stats.hoursToday} Hrs Today
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#4F46E5]" />

          {/* Custom vertical line and dot for the active point */}
          <div className="absolute top-full flex flex-col items-center translate-y-[-6px]">
            <div className="w-4 h-4 rounded-full bg-white border-[4px] border-[#4F46E5] z-10 shadow-sm" />
            <div className="w-[1px] h-32 bg-gradient-to-b from-[#4F46E5]/40 to-transparent" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="self-stretch bg-white rounded-2xl shadow-sm border-0 flex flex-col gap-2 pt-6 pb-2 ring-1 ring-zinc-100">
      <div className="w-full aspect-[2/1] sm:aspect-[5/2] min-h-[180px] max-h-[300px] overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 60, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={hasData ? 0.15 : 0.03} />
                <stop offset="50%" stopColor="#6366f1" stopOpacity={hasData ? 0.06 : 0.01} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f4f4f5" vertical={true} horizontal={false} strokeWidth={1} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              animationDuration={200}
              offset={10}
              position={{ y: -80 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartGradient)"
              activeDot={false}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
