import React from 'react';
import { StatCard } from 'shared/components/cards/StatCard';
import { mockKpiMetrics } from 'services/mockData';

export const CardsSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          KPI Metrics & Stat Cards
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Metric cards with sparkline previews, growth badges, and subtle
          background glow effects
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKpiMetrics.map(metric => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
};
