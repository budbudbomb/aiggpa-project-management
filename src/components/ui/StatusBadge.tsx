import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status:
    | boolean
    | 'active'
    | 'inactive'
    | 'urgent'
    | 'high'
    | 'medium'
    | 'low'
    | string;
  label?: string;
  onClick?: () => void;
  title?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  onClick,
  title,
  className = '',
}) => {
  const isInteractive = Boolean(onClick);

  // Boolean active/inactive
  if (
    typeof status === 'boolean' ||
    status === 'active' ||
    status === 'inactive'
  ) {
    const isActive = status === true || status === 'active';
    const text = label || (isActive ? 'Active' : 'Inactive');

    const colorClasses = isActive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80'
      : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/80';

    return (
      <span
        onClick={onClick}
        title={
          title ||
          (isInteractive
            ? `Click to ${isActive ? 'deactivate' : 'activate'}`
            : undefined)
        }
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
          isInteractive ? 'cursor-pointer select-none active:scale-95' : ''
        } ${colorClasses} ${className}`}
      >
        {isActive ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        {text}
      </span>
    );
  }

  // Priority or text status
  const normalized = String(status).toLowerCase();
  let priorityStyle = 'bg-slate-50 text-slate-700 border-slate-200';

  if (normalized === 'urgent') {
    priorityStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized === 'high') {
    priorityStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (normalized === 'medium') {
    priorityStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'low') {
    priorityStyle = 'bg-slate-50 text-slate-600 border-slate-200';
  }

  return (
    <span
      onClick={onClick}
      title={title}
      role={isInteractive ? 'button' : undefined}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border ${priorityStyle} ${
        isInteractive ? 'cursor-pointer hover:opacity-85 active:scale-95' : ''
      } ${className}`}
    >
      {label || status}
    </span>
  );
};

export default StatusBadge;
