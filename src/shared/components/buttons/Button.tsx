import React from 'react';
import { Loader2 } from 'lucide-react';
import { Ripple } from 'primereact/ripple';

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'iconOnly';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  disableRipple?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  icon,
  iconOnly = false,
  className = '',
  disabled,
  disableRipple = false,
  ...props
}) => {
  const isIconOnly =
    iconOnly ||
    variant === 'iconOnly' ||
    (!children && Boolean(icon || leftIcon));

  const baseStyles =
    'relative overflow-hidden p-ripple inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const regularSizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const iconOnlySizeStyles = {
    sm: 'w-8 h-8 p-1.5 text-xs shrink-0',
    md: 'w-9.5 h-9.5 p-2 text-sm shrink-0',
    lg: 'w-11 h-11 p-2.5 text-base shrink-0',
  };

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-hover text-white font-medium shadow-xs hover:shadow-md hover:-translate-y-[1px] focus:ring-primary/25 active:translate-y-0',
    secondary:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs hover:-translate-y-[0.5px] focus:ring-primary/20 active:translate-y-0',
    outline:
      'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs focus:ring-primary/20 active:translate-y-0',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs hover:shadow-md hover:-translate-y-[1px] focus:ring-rose-500/25 active:translate-y-0',
    ghost:
      'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium focus:ring-primary/20',
    iconOnly:
      'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs focus:ring-primary/20',
  };

  const sizeClass = isIconOnly
    ? iconOnlySizeStyles[size]
    : regularSizeStyles[size];
  const displayIcon = icon || leftIcon || children;

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeClass} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isIconOnly ? (
        <>
          {displayIcon}
          {!disableRipple && <Ripple />}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
          {!disableRipple && <Ripple />}
        </>
      )}
    </button>
  );
};
