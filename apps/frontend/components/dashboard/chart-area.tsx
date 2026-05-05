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

  // Map labels to Recharts array structure
  const chartData = labels.map((label, index) => ({
    name: label,
    value: hasData ? MOCK_CURVE[index % MOCK_CURVE.length] : 0,
  }));

  // Custom Recharts Tooltip matching original design
  const CustomTooltip = ({ active }: any) => {
    if (active) {
      return (
        <div className="relative">
          <div className="bg-indigo-600 rounded-lg px-3 py-2 flex flex-col gap-1 shadow-lg shadow-indigo-600/20 min-w-[120px]">
            <div className="text-center text-white text-[10px] sm:text-xs font-medium leading-4 pb-1">
              {stats.projects} Projects
            </div>
            <div className="border-t border-white/10 pt-1 text-center text-white text-[10px] sm:text-xs font-medium leading-4">
              {stats.activeAccounts} Active Accounts
            </div>
            <div className="border-t border-white/10 pt-1 text-center text-white text-[10px] sm:text-xs font-medium leading-4">
              {stats.activeTaskers} Active Taskers
            </div>
            <div className="border-t border-white/10 pt-1 text-center text-white text-[10px] sm:text-xs font-medium leading-4">
              {stats.hoursToday} Hrs Today
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-600" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="self-stretch bg-white rounded-2xl shadow-sm border-0 flex flex-col gap-2 overflow-hidden pt-6 pb-2">
      <div className="w-full aspect-[2/1] sm:aspect-[5/2] min-h-[180px] max-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={hasData ? 0.2 : 0.05} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f4f4f5" vertical={true} horizontal={false} strokeWidth={1} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717a', fontSize: 11 }}
              dy={10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#e4e4e7', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              animationDuration={200}
              offset={15}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
              activeDot={{ r: 4, fill: '#4f46e5', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

