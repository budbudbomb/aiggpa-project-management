import React, { useRef, useState, useEffect } from 'react';

export interface SegmentedControlOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
  icon?: React.ElementType | React.ReactNode;
  count?: number;
  badge?: string | number;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: Array<SegmentedControlOption<T> | T>;
  value: T;
  onChange: (value: T) => void;
  variant?: 'primary' | 'white' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  variant = 'primary',
  size = 'sm',
  className = '',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOptionRef = useRef<HTMLButtonElement>(null);

  // Mouse Drag-to-Scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const hasDraggedRef = useRef(false);

  // Scroll active option into view inside container ONLY if overflowing
  useEffect(() => {
    if (containerRef.current && activeOptionRef.current) {
      const container = containerRef.current;
      const target = activeOptionRef.current;

      if (container.scrollWidth > container.clientWidth) {
        const targetLeft = target.offsetLeft;
        const targetWidth = target.offsetWidth;
        const containerScrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;

        if (targetLeft < containerScrollLeft) {
          container.scrollTo({
            left: Math.max(0, targetLeft - 6),
            behavior: 'smooth',
          });
        } else if (
          targetLeft + targetWidth >
          containerScrollLeft + containerWidth
        ) {
          container.scrollTo({
            left: targetLeft + targetWidth - containerWidth + 6,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [value]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Convert mouse wheel vertical scroll to horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-3.5 py-2 text-xs gap-2 rounded-xl',
    lg: 'px-4.5 py-2.5 text-sm gap-2 rounded-xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      className={`inline-flex w-fit max-w-full items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab sm:cursor-default'
      } ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {options.map(opt => {
        const optionValue = typeof opt === 'string' ? opt : opt.value;
        const optionLabel = typeof opt === 'string' ? opt : opt.label;
        const optionIcon = typeof opt === 'object' ? opt.icon : undefined;
        const optionCount =
          typeof opt === 'object'
            ? opt.count !== undefined
              ? opt.count
              : opt.badge
            : undefined;
        const isDisabled = typeof opt === 'object' ? opt.disabled : false;
        const isSelected = value === optionValue;

        const activeStyles =
          variant === 'primary'
            ? 'bg-primary text-white shadow-xs font-semibold'
            : variant === 'white'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold ring-1 ring-slate-200/90 dark:ring-slate-700'
              : 'bg-primary/10 text-primary border border-primary/20 font-semibold';

        const inactiveStyles =
          'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium';

        return (
          <button
            key={optionValue}
            ref={isSelected ? activeOptionRef : null}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!hasDraggedRef.current && !isDisabled) {
                onChange(optionValue as T);
              }
            }}
            className={`inline-flex items-center font-bold transition-all duration-150 cursor-pointer shrink-0 select-none ${
              sizeClasses[size]
            } ${
              isDisabled
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : isSelected
                  ? activeStyles
                  : inactiveStyles
            }`}
          >
            {optionIcon && (
              <span className="shrink-0 flex items-center justify-center">
                {React.isValidElement(optionIcon)
                  ? React.cloneElement(
                      optionIcon as React.ReactElement<{ className?: string }>,
                      {
                        className: `${iconSizes[size]} ${(optionIcon.props as { className?: string })?.className || ''}`,
                      }
                    )
                  : (() => {
                      const IconComponent = optionIcon as React.ComponentType<{
                        className?: string;
                      }>;
                      return <IconComponent className={iconSizes[size]} />;
                    })()}
              </span>
            )}

            <span className="whitespace-nowrap tracking-tight">
              {optionLabel}
            </span>

            {optionCount !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold leading-none ${
                  isSelected
                    ? variant === 'primary'
                      ? 'bg-white/25 text-white'
                      : 'bg-primary/15 text-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {optionCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
