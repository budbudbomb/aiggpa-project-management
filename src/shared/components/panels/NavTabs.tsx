import React, { useRef, useState, useEffect } from 'react';

export interface NavTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType | React.ReactNode;
  count?: number;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
}

export interface NavTabsProps<T extends string = string> {
  tabs: NavTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'primary' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  showDividers?: boolean;
  className?: string;
}

export function NavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'primary',
  size = 'md',
  showDividers = true,
  className = '',
}: NavTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Mouse Drag-to-Scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const hasDraggedRef = useRef(false);

  // Scroll active tab into view inside container ONLY if overflowing
  useEffect(() => {
    if (containerRef.current && activeTabRef.current) {
      const container = containerRef.current;
      const target = activeTabRef.current;

      if (container.scrollWidth > container.clientWidth) {
        const targetLeft = target.offsetLeft;
        const targetWidth = target.offsetWidth;
        const containerScrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;

        if (targetLeft < containerScrollLeft) {
          container.scrollTo({
            left: Math.max(0, targetLeft - 8),
            behavior: 'smooth',
          });
        } else if (
          targetLeft + targetWidth >
          containerScrollLeft + containerWidth
        ) {
          container.scrollTo({
            left: targetLeft + targetWidth - containerWidth + 8,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [activeTab]);

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
    const walk = (x - startX) * 1.5; // Drag speed multiplier
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
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2.5',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const iconGlyphSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const dividerHeights = {
    sm: 'h-3.5',
    md: 'h-4.5',
    lg: 'h-5',
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
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const isPrevActive = idx > 0 && activeTab === tabs[idx - 1].id;
        const Icon = tab.icon;

        // Visual styles depending on active/inactive state
        const activeStyles =
          variant === 'primary'
            ? 'bg-primary text-white shadow-xs font-semibold'
            : 'bg-primary/10 text-primary border border-primary/20 font-semibold';

        const inactiveStyles =
          'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium';

        const iconContainerActive =
          variant === 'primary'
            ? 'bg-white/20 text-white shadow-2xs'
            : 'bg-primary text-white shadow-2xs';

        const iconContainerInactive =
          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors';

        return (
          <React.Fragment key={tab.id}>
            {/* Divider Line between tabs */}
            {idx > 0 && showDividers && (
              <div
                className={`${dividerHeights[size]} w-px bg-slate-200/90 dark:bg-slate-800 shrink-0 self-center transition-opacity duration-150 ${
                  isActive || isPrevActive ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden="true"
              />
            )}

            <button
              ref={isActive ? activeTabRef : null}
              type="button"
              disabled={tab.disabled}
              onClick={() => {
                if (!hasDraggedRef.current && !tab.disabled) {
                  onChange(tab.id);
                }
              }}
              className={`group inline-flex items-center rounded-xl transition-all duration-200 cursor-pointer shrink-0 select-none ${
                sizeClasses[size]
              } ${
                tab.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : isActive
                    ? activeStyles
                    : inactiveStyles
              }`}
              title={tab.description}
            >
              {Icon && (
                <div
                  className={`${iconSizes[size]} rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isActive ? iconContainerActive : iconContainerInactive
                  }`}
                >
                  {React.isValidElement(Icon)
                    ? React.cloneElement(
                        Icon as React.ReactElement<{ className?: string }>,
                        {
                          className: `${iconGlyphSizes[size]} ${(Icon.props as { className?: string })?.className || ''}`,
                        }
                      )
                    : (() => {
                        const IconComponent = Icon as React.ComponentType<{
                          className?: string;
                        }>;
                        return (
                          <IconComponent className={iconGlyphSizes[size]} />
                        );
                      })()}
                </div>
              )}

              <span className="leading-tight tracking-wide whitespace-nowrap">
                {tab.label}
              </span>

              {(tab.count !== undefined || tab.badge !== undefined) && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-semibold leading-none ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.count !== undefined ? tab.count : tab.badge}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
