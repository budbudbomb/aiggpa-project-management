import React, { useState, useSyncExternalStore } from 'react';
import { ThemeCustomizer } from 'shared/components/theme/ThemeCustomizer';
import Header from '../Header';
import Footer from '../Footer';
import SmartSidebar from './SmartSidebar';
import RightSidebar from '../RightSidebar';
import './SmartLayout.css';

// ─── Mobile Hook ──────────────────────────────────

function useIsMobile(breakpoint = 1023) {
  const subscribe = (callback: () => void) => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─── SmartLayout (Root) ────────────────────────────

export const SmartLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMobile = useIsMobile(1023);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobile);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
    if (isMobile) {
      window.dispatchEvent(new Event('smart-sidebar-mobile'));
    } else {
      window.dispatchEvent(new Event('smart-sidebar-collapse'));
    }
  };

  return (
    <div className="smart-layout-root">
      <SmartSidebar />
      <div className="smart-layout-main">
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <div className="smart-layout-middle">
          <div className="smart-layout-content">
            <div className="smart-layout-body">{children}</div>
          </div>
          {!isMobile && <RightSidebar />}
        </div>
        <Footer />
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default SmartLayout;
