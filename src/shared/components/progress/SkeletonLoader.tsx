import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table' | 'avatar';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const renderItem = (key: number) => {
    if (variant === 'avatar') {
      return (
        <div
          key={key}
          className={`w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
        />
      );
    }

    if (variant === 'card') {
      return (
        <div
          key={key}
          className={`p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 animate-pulse ${className}`}
        >
          <div className="w-1/3 h-4 rounded-md bg-slate-300 dark:bg-slate-800" />
          <div className="w-1/2 h-8 rounded-lg bg-slate-300 dark:bg-slate-800" />
          <div className="w-full h-3 rounded-md bg-slate-200 dark:bg-slate-800/60" />
        </div>
      );
    }

    if (variant === 'table') {
      return (
        <div
          key={key}
          className={`w-full flex flex-col gap-2 animate-pulse ${className}`}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        key={key}
        className={`h-4 w-full rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
      />
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
    </div>
  );
};
