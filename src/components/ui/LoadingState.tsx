import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
  size = 'md',
}) => {
  return (
    <div
      className={`py-12 px-4 flex flex-col items-center justify-center text-center gap-3 ${className}`}
    >
      <Loader2 className={`${sizeMap[size]} text-blue-700 animate-spin`} />
      {message && (
        <p className="text-xs font-medium text-slate-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingState;
