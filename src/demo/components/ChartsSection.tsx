import React from 'react';
import { ChartCard, ChartTooltip } from 'shared/components';
import { mockRevenueData, mockDistributionData } from 'services/mockData';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ChartsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Area Chart */}
      <ChartCard
        title="Revenue & Expense Growth"
        subtitle="Monthly performance breakdown for current fiscal year"
        icon={<TrendingUp className="w-5 h-5" />}
        iconBg="bg-primary/10 text-primary"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={mockRevenueData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary, #1d4ed8)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary, #1d4ed8)"
                  stopOpacity={0.0}
                />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              className="dark:stroke-slate-800"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={val => `$${val / 1000}k`}
            />
            <Tooltip
              content={
                <ChartTooltip
                  valueFormatter={val => `$${val.toLocaleString()}`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary, #1d4ed8)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Department Distribution Pie Chart */}
      <ChartCard
        title="Department Allocation"
        subtitle="Distribution across active operational teams"
        icon={<PieChartIcon className="w-5 h-5" />}
        iconBg="bg-primary/10 text-primary"
      >
        <div className="flex flex-col items-center w-full">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={mockDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                cornerRadius={4}
                dataKey="value"
              >
                {mockDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip valueFormatter={val => `${val}% Share`} />
                }
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 w-full mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            {mockDistributionData.map(item => (
              <div
                key={item.name}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
                  {item.name}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 ml-auto tabular-nums">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  );
};
