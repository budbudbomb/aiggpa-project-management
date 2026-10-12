import React from 'react';

export interface ChartTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
  unit?: string;
  dataKey?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  valueFormatter?: (val: number, name?: string) => string;
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter,
  className = '',
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const defaultFormatter = (val: number) => {
    if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return val.toLocaleString('en-IN');
  };

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-xs select-none min-w-40 z-50 animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {label !== undefined && label !== null && (
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800 tracking-wide">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, index) => {
          const color =
            entry.color || entry.fill || 'var(--color-primary, #1d4ed8)';
          const numVal =
            typeof entry.value === 'number'
              ? entry.value
              : Number(entry.value) || 0;
          const formattedVal = valueFormatter
            ? valueFormatter(numVal, entry.name)
            : typeof entry.value === 'number'
              ? defaultFormatter(entry.value)
              : entry.value;

          return (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                  {entry.name || 'Value'}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                {formattedVal}
                {entry.unit ? ` ${entry.unit}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
