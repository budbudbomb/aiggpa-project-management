import React from 'react';

export interface FilterBarProps {
  label?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  label,
  icon,
  children,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {icon && (
          <div className="text-slate-400 dark:text-slate-500 shrink-0">
            {icon}
          </div>
        )}
        {label && (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {label}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-50">
          {children}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};
