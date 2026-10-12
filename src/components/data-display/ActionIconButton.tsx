import React from 'react';

export type ActionIconVariant = 'primary' | 'danger' | 'neutral' | 'success';

export interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  variant?: ActionIconVariant;
}

const variantStyles: Record<ActionIconVariant, string> = {
  neutral: 'text-slate-500 hover:text-blue-700 hover:bg-blue-50',
  primary: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
  danger: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
  success: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50',
};

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  icon,
  tooltip,
  variant = 'neutral',
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={disabled}
      className={`p-1.5 rounded-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export default ActionIconButton;
