import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  footer,
  className = '',
  noPadding = false,
  padding = 'p-4',
}) => {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 overflow-hidden flex flex-col justify-between ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={noPadding ? '' : padding}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
