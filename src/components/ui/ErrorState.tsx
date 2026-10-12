import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorStateProps {
  type?: AlertType;
  title?: string;
  message: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const typeStyles: Record<
  AlertType,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  error: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />,
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />,
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Info className="w-4 h-4 shrink-0 text-blue-600" />,
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />,
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'error',
  title,
  message,
  className = '',
  onDismiss,
}) => {
  if (!message) return null;
  const config = typeStyles[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 p-3.5 rounded-lg border text-xs ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 font-semibold p-0.5 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const AlertBanner = ErrorState;
export default ErrorState;
