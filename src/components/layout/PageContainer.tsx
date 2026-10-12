import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const spacingMap = {
  none: 'space-y-0',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-5 sm:space-y-6',
  lg: 'space-y-8',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'full',
  className = '',
  spacing = 'md',
}) => {
  return (
    <div
      className={`w-full mx-auto p-4 sm:p-6 transition-all ${maxWidthMap[maxWidth]} ${spacingMap[spacing]} ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
