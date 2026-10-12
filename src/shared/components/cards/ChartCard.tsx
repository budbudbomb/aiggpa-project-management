import React from 'react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerBorder?: boolean;
  minHeight?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  icon,
  iconBg = 'bg-primary/10 text-primary',
  badge,
  action,
  toolbar,
  footer,
  children,
  className = '',
  headerBorder = false,
  minHeight = 'min-h-65',
}) => {
  return (
    <div
      className={`p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 ${
          headerBorder
            ? 'pb-3 border-b border-slate-100 dark:border-slate-800'
            : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div
              className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs font-semibold`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {(action || toolbar) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {toolbar}
            {action}
          </div>
        )}
      </div>

      {/* Chart Canvas / Body */}
      <div
        className={`w-full ${minHeight} flex flex-col justify-center flex-1`}
      >
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {footer}
        </div>
      )}
    </div>
  );
};
