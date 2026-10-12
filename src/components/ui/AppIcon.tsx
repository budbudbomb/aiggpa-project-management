import React, { type ElementType } from 'react';
import { clsx } from 'clsx';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppIconProps {
  /** Lucide icon component or custom SVG icon element */
  icon: ElementType;
  /** Predefined size token or custom className */
  size?: IconSize;
  /** Explicit stroke width (defaults to 2 for crisp readability) */
  strokeWidth?: number;
  /** Color class or style override */
  className?: string;
  /** Accessibility title/label when used as standalone visual */
  title?: string;
  /** Accessible aria-label */
  ariaLabel?: string;
}

const SIZE_MAP: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

/**
 * Standardized AppIcon component for AIGGPA ERP.
 * Guarantees consistent vector rendering, stroke weights, accessibility, and sizing across all pages.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  icon: IconComponent,
  size = 'md',
  strokeWidth = 2,
  className,
  title,
  ariaLabel,
}) => {
  const sizeClasses = SIZE_MAP[size];

  return (
    <IconComponent
      className={clsx('shrink-0 inline-block align-middle', sizeClasses, className)}
      strokeWidth={strokeWidth}
      aria-hidden={!ariaLabel && !title}
      aria-label={ariaLabel || title}
    >
      {title && <title>{title}</title>}
    </IconComponent>
  );
};

export default AppIcon;
