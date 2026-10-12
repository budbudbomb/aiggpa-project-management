import React from 'react';
import { Card } from './Card';

export interface InputPanelProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  cols?: number;
  variant?: 'card' | 'plain';
}

const colsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

export const InputPanel: React.FC<InputPanelProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  cols = 4,
  variant = 'plain',
}) => {
  const gridColsClass =
    colsMap[cols] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

  if (variant === 'card' || title) {
    return (
      <Card
        title={title}
        subtitle={subtitle}
        footer={actions}
        className={className}
      >
        <div className={`grid gap-4 sm:gap-5 ${gridColsClass}`}>{children}</div>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-5 ${gridColsClass} ${className}`}>
      {children}
    </div>
  );
};
