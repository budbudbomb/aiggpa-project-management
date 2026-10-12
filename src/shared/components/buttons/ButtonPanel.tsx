import React from 'react';

export interface ButtonPanelProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
  bordered?: boolean;
  borderTop?: boolean;
}

export const ButtonPanel: React.FC<ButtonPanelProps> = ({
  children,
  align = 'right',
  className = '',
  bordered = false,
  borderTop = false,
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const hasTopBorder = bordered || borderTop;
  const borderClasses = hasTopBorder
    ? 'pt-4 border-t border-slate-200 dark:border-slate-800 mt-2'
    : 'py-2';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 w-full ${borderClasses} ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
};
