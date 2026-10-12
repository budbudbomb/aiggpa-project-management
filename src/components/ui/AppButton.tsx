import React from 'react';
import { Loader2 } from 'lucide-react';

export type AppButtonVariant =
  'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';

export type AppButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles: Record<AppButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const iconOnlySizes: Record<AppButtonSize, string> = {
    xs: 'p-1 w-6 h-6 text-xs',
    sm: 'p-1.5 w-8 h-8 text-xs',
    md: 'p-2 w-9.5 h-9.5 text-sm',
    lg: 'p-2.5 w-11 h-11 text-base',
  };

  const variantStyles: Record<AppButtonVariant, string> = {
    primary:
      'bg-blue-700 hover:bg-blue-800 text-white shadow-xs hover:shadow focus:ring-blue-500/30 active:scale-[0.98]',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 focus:ring-slate-300 active:scale-[0.98]',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-blue-700 shadow-2xs focus:ring-blue-500/20 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/30 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-200',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500/30 active:scale-[0.98]',
  };

  const appliedSize = iconOnly ? iconOnlySizes[size] : sizeStyles[size];
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${appliedSize} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default AppButton;
