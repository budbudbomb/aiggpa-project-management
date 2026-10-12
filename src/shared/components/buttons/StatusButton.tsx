import React from 'react';
import { toast } from '../feedback/toastService';

export interface StatusButtonProps {
  status?: 'Active' | 'Pending' | 'Inactive';
  isActive?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
  size?: 'sm' | 'md';
  showToast?: boolean;
  toastMessage?: string;
  itemName?: string;
  className?: string;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  status: statusProp,
  isActive,
  onClick,
  onToggle,
  size = 'md',
  showToast = true,
  toastMessage,
  itemName,
  className = '',
}) => {
  const currentStatus =
    statusProp ??
    (isActive !== undefined ? (isActive ? 'Active' : 'Inactive') : 'Active');
  const handleClick = onClick ?? onToggle;
  const isInteractive = Boolean(handleClick);

  const statusStyles = {
    Active:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/70',
    Pending:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-950/70',
    Inactive:
      'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-950/70',
  };

  const bulletColors = {
    Active: 'bg-emerald-500 dark:bg-emerald-400',
    Pending: 'bg-amber-500 dark:bg-amber-400',
    Inactive: 'bg-rose-500 dark:bg-rose-400',
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!handleClick) return;

    handleClick();

    if (showToast) {
      const nextStatus =
        currentStatus === 'Active'
          ? 'Inactive'
          : currentStatus === 'Inactive'
            ? 'Active'
            : 'Active';

      if (toastMessage) {
        toast.info(toastMessage);
      } else if (nextStatus === 'Active') {
        toast.success(
          itemName ? `${itemName} is now Active` : 'Status updated to Active',
          'Status Changed'
        );
      } else if (nextStatus === 'Inactive') {
        toast.warning(
          itemName
            ? `${itemName} is now Inactive`
            : 'Status updated to Inactive',
          'Status Changed'
        );
      } else {
        toast.info(`Status updated to ${nextStatus}`, 'Status Changed');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={!isInteractive}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold text-xs tracking-tight rounded-full border transition-all duration-150 select-none ${
        isInteractive
          ? 'cursor-pointer hover:shadow-xs active:scale-95'
          : 'cursor-default'
      } ${
        size === 'sm'
          ? 'w-16 min-w-16 px-1.5 py-0.5 text-[10px]'
          : 'w-19 min-w-19 px-2 py-0.5 text-[11px]'
      } ${statusStyles[currentStatus]} ${className}`}
      title={
        isInteractive
          ? `Click to set as ${currentStatus === 'Active' ? 'Inactive' : 'Active'}`
          : undefined
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${bulletColors[currentStatus]}`}
      />
      <span className="whitespace-nowrap">{currentStatus}</span>
    </button>
  );
};
