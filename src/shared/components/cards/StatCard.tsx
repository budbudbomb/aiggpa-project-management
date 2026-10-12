import React from 'react';
import {
  IndianRupee,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { type KpiMetric } from 'types/dashboard';

const iconMap = {
  rupee: IndianRupee,
  dollar: IndianRupee,
  users: Users,
  chart: TrendingUp,
  activity: Activity,
};

const colorStyles = {
  rupee: {
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    barColor: 'bg-blue-600 dark:bg-blue-500',
  },
  dollar: {
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    barColor: 'bg-blue-600 dark:bg-blue-500',
  },
  users: {
    iconBg:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    barColor: 'bg-emerald-600 dark:bg-emerald-500',
  },
  chart: {
    iconBg:
      'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    barColor: 'bg-amber-500',
  },
  activity: {
    iconBg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
    barColor: 'bg-cyan-600 dark:bg-cyan-500',
  },
};

export interface StatCardProps {
  metric: KpiMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const IconComponent = iconMap[metric.iconName] || Activity;
  const colors = colorStyles[metric.iconName] || colorStyles.activity;

  return (
    <div className="relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {metric.title}
        </span>
        <div className={`p-2.5 rounded-lg ${colors.iconBg} transition-colors`}>
          <IconComponent className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
          {metric.value}
        </span>

        <div
          className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${
            metric.isPositive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
              : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
          }`}
        >
          {metric.isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          )}
          {metric.change}
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-normal">{metric.period}</span>
        {/* Simple Sparkline Preview */}
        <div className="flex items-end gap-1 h-3.5">
          {metric.sparklineData.map((val, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-xs transition-all duration-200 ${colors.barColor}`}
              style={{
                height: `${Math.min(100, (val / Math.max(...metric.sparklineData)) * 100)}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
