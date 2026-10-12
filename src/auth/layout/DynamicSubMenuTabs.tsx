import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useCurrentTabGroup, type TabItem } from '../hooks/useCurrentTabGroup';

export default function DynamicSubMenuTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTabGroup = useCurrentTabGroup();
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll refs
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse Wheel Scroll Translation
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 1.5;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!currentTabGroup || currentTabGroup.items.length === 0) {
    return null;
  }

  // Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftStart.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Delay resetting dragging to prevent click triggers immediately after drag
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
      e.preventDefault();
      containerRef.current.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="w-full px-3 sm:px-4 pt-2 flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none shrink-0 bg-transparent cursor-grab active:cursor-grabbing select-none"
    >
      {currentTabGroup.items.map((item: TabItem, idx: number) => {
        const IconComponent = item.icon;
        const isActive = idx === currentTabGroup.activeIndex;

        return (
          <button
            key={idx}
            onClick={e => {
              // If the user was dragging, block the click navigation trigger
              if (isDragging.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (item.path && item.path !== location.pathname) {
                navigate(item.path);
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-bold transition-all duration-150 cursor-pointer shrink-0 rounded-t-xl rounded-b-none ${
              isActive
                ? 'bg-primary-light text-primary'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
            }`}
          >
            <IconComponent className="w-4 h-4 shrink-0 pointer-events-none" />
            <span className="pointer-events-none">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
