import React from 'react';

export interface DisplayItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export interface DisplayLayoutProps {
  items: DisplayItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const DisplayLayout: React.FC<DisplayLayoutProps> = ({
  items,
  columns = 2,
  className = '',
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={`grid ${colClasses[columns]} gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {item.value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
};
