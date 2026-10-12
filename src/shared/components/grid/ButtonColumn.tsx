import React from 'react';
import { Button, type ButtonProps } from '../buttons/Button';

// ─── Badge color map ──────────────────────────────────────────────────────────

type BadgeVariant = 'badge-view' | 'badge-edit' | 'badge-remove';

const badgeStyles: Record<BadgeVariant, string> = {
  'badge-view':
    'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-800/40 dark:hover:bg-sky-500/25',
  'badge-edit':
    'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
  'badge-remove':
    'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-800/40 dark:hover:bg-rose-500/25',
};

function isBadgeVariant(v: string): v is BadgeVariant {
  return v === 'badge-view' || v === 'badge-edit' || v === 'badge-remove';
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ButtonColumnProps {
  caption: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonProps['variant'] | BadgeVariant;
  iconOnly?: boolean;
}

// ─── ButtonColumn ─────────────────────────────────────────────────────────────

export default function ButtonColumn({
  caption,
  icon,
  onClick,
  variant = 'ghost',
  iconOnly = false,
}: ButtonColumnProps) {
  // ── Badge variant ──
  if (isBadgeVariant(variant)) {
    if (iconOnly) {
      return (
        <button
          type="button"
          title={caption}
          onClick={onClick}
          className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-150 select-none ${badgeStyles[variant]}`}
        >
          {icon}
        </button>
      );
    }
    return (
      <button
        type="button"
        title={caption}
        onClick={onClick}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors duration-150 select-none ${badgeStyles[variant]}`}
      >
        {icon && (
          <span className="w-3 h-3 flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        {caption}
      </button>
    );
  }

  // ── Icon-only square button ──
  if (iconOnly) {
    return (
      <Button
        type="button"
        variant={variant === 'danger' ? 'danger' : 'iconOnly'}
        size="sm"
        icon={icon}
        iconOnly
        title={caption}
        onClick={onClick}
      />
    );
  }

  // ── Default: text + icon button ──
  return (
    <Button
      type="button"
      variant={variant as ButtonProps['variant']}
      size="sm"
      leftIcon={icon}
      onClick={onClick}
      className="w-full"
    >
      {caption}
    </Button>
  );
}
