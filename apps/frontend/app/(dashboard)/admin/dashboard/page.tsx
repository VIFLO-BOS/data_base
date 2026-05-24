'use client';

import { useState, useCallback } from 'react';
import { useRefreshOnFocus } from '../../../../hooks/use-refresh-on-focus';
import { StatCard } from '../../../../components/dashboard/stat-card';
import { OverviewFilter } from '../../../../components/dashboard/overview-filter';
import { ChartArea } from '../../../../components/dashboard/chart-area';
import { getDashboardSummary, DashboardSummary } from '../../../../services/analytics-service';
import { Loader2 } from 'lucide-react';

type FilterType = 'Day' | 'Week' | 'Month' | 'Year';

/** Label sets for each filter period */
const chartLabelsByFilter: Record<FilterType, string[]> = {
  Day: ['12am', '4am', '8am', '12pm', '4pm', '8pm', '11pm'],
  Week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  Month: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  Year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Comparison text suffix for each filter period */
const comparisonText: Record<FilterType, string> = {
  Day: 'Than last Day',
  Week: 'Than last Week',
  Month: 'Than last Month',
  Year: 'Than last Year',
};

/** Helper to format trend numbers into percentage and direction */
function getTrendInfo(trend?: number): { percentage: string; trend: 'up' | 'down' | 'neutral' } {
  if (trend === undefined || trend === null || trend === 0)
    return { percentage: '0%', trend: 'neutral' };
  const val = Number(trend);
  if (val > 0) return { percentage: `${val.toFixed(2)}%`, trend: 'up' };
  if (val < 0) return { percentage: `${Math.abs(val).toFixed(2)}%`, trend: 'down' };
  return { percentage: '0%', trend: 'neutral' };
}

/**
 * Admin Dashboard Page
 * Analytics cards, charts, recent activities, filter by day/week/month/year.
 */
export default function AdminDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Day');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    const periodMap: Record<string, string> = {
      Day: 'day',
      Week: 'week',
      Month: 'month',
      Year: 'year',
      'All Time': 'all',
    };
    try {
      const data = await getDashboardSummary(
        periodMap[activeFilter] || 'day',
        selectedDate || undefined,
      );
      if (data) setSummary(data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, selectedDate]);

  useRefreshOnFocus(fetchSummary);

  const projectsTrend = getTrendInfo(summary?.projectsTrend);
  const accountsTrend = getTrendInfo(summary?.accountsTrend);
  const taskersTrend = getTrendInfo(summary?.taskersTrend);
  const hoursTrend = getTrendInfo(summary?.hoursTrend);

  const currentComparisonText = comparisonText[activeFilter] || '';

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
   

      {/* Main Overview Card */}
      <div className="self-stretch bg-white rounded-[20px] border border-zinc-200 shadow-sm flex flex-col p-6 lg:p-4 gap-6 w-full">
        {/* Overview Title */}
        <div className="self-stretch pb-4 border-b border-zinc-100 flex justify-start items-center">
          <div className="text-stone-900 text-[22px] font-semibold">Overview</div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-indigo-500 ml-2" />}
        </div>

        {/* Filter Buttons + Date Picker */}
        <OverviewFilter
          activeFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f as FilterType)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Stat Cards — 2×2 grid */}
        <div
          className={`w-full grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'} mb`}
        >
          <StatCard
            label="Projects"
            value={summary?.totalProjects ?? '-'}
            percentage={projectsTrend.percentage}
            comparisonText={currentComparisonText}
            trend={projectsTrend.trend}
          />
          <StatCard
            label="Active Accounts"
            value={summary?.activeAccounts ?? '-'}
            percentage={accountsTrend.percentage}
            comparisonText={currentComparisonText}
            trend={accountsTrend.trend}
          />
          <StatCard
            label="Active Taskers"
            value={summary?.activeTaskers ?? '-'}
            percentage={taskersTrend.percentage}
            comparisonText={currentComparisonText}
            trend={taskersTrend.trend}
          />
          <StatCard
            label="Total Hours Logged"
            value={summary?.totalHoursToday ?? '-'}
            percentage={hoursTrend.percentage}
            comparisonText={currentComparisonText}
            trend={hoursTrend.trend}
          />
        </div>

        {/* Chart */}
        <div
          className={`w-full transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        >
          <ChartArea
            labels={
              summary?.chartData?.labels?.length
                ? summary.chartData.labels
                : chartLabelsByFilter[activeFilter] || chartLabelsByFilter['Day']
            }
            data={{
              projects: summary?.totalProjects ?? 0,
              activeAccounts: summary?.activeAccounts ?? 0,
              activeTaskers: summary?.activeTaskers ?? 0,
              hoursToday: summary?.totalHoursToday ?? 0,
              chartData: summary?.chartData,
            }}
          />
        </div>
      </div>
    </div>
  );
}
