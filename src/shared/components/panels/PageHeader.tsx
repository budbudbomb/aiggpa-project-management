import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  hideDivider?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  icon,
  hideDivider = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-2.5 pb-4 sm:pb-6 ${
        hideDivider ? '' : 'border-b border-slate-200/80 dark:border-slate-800'
      } ${className}`}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-primary transition-colors font-medium"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {icon && (
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0 [&_svg]:w-5 [&_svg]:h-5"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                borderColor:
                  'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center justify-end w-full sm:w-auto gap-2.5 sm:gap-3 shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
