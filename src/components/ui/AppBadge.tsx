import React from 'react';

export type AppBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface AppBadgeProps {
  children: React.ReactNode;
  variant?: AppBadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AppBadgeVariant, string> = {
  primary: 'bg-blue-50 text-blue-700 border-blue-200/60',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  info: 'bg-sky-50 text-sky-700 border-sky-200/60',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200/60',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const AppBadge: React.FC<AppBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default AppBadge;
