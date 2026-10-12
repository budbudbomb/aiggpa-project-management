import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockService } from 'services/mockService';
import { Button } from 'shared/components/buttons/Button';
import { Loader } from 'shared/components/feedback/Loader';
import { Badge } from 'shared/components/feedback/Badge';
import { Database, RefreshCw, CheckCircle2 } from 'lucide-react';

export const QueryDemoSection: React.FC = () => {
  const {
    data: metrics,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['demo-kpis'],
    queryFn: () => mockService.getKpiMetrics(),
  });

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Static to Dynamic Ready (TanStack Query v5)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Components call custom hooks backed by TanStack Query. Easily
              switch from mockService to real REST APIs!
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => refetch()}
          isLoading={isRefetching}
        >
          Refetch Data
        </Button>
      </div>

      {isLoading ? (
        <Loader text="Fetching async mock data..." />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Query Status: <strong>Success</strong> (Simulated Latency:
                350ms)
              </span>
            </div>
            <Badge variant="success" dot size="sm">
              Cache Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics?.map(m => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-col gap-1"
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  {m.title}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {m.value}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
