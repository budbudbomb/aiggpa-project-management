import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import { useThemeStore } from '../store/themeStore';
import { ThemeCustomizer } from 'shared/components/theme/ThemeCustomizer';
import SmartLayout from './smart/SmartLayout';

function useIsMobile(breakpoint = 992) {
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

export default function AppLayout({ children }: React.PropsWithChildren) {
  const isMobile = useIsMobile(992);
  const { layoutType, layoutStyle } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobile);

  // All hooks must run unconditionally — smart check is in JSX below
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // ── Smart Layout: completely separate shell ──────────────────
  if (layoutType === 'smart') {
    return <SmartLayout>{children}</SmartLayout>;
  }
  // ─────────────────────────────────────────────────────────────

  const showSidebar = layoutType === 'sidebar' || isMobile;
  const showNavbar = layoutType === 'navbar' && !isMobile;
  const isDetached = layoutStyle === 'detached' && layoutType === 'sidebar';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 overflow-x-clip ${
        isDetached
          ? 'bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100'
          : 'bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Left Sidebar (Active when layoutType === 'sidebar') */}
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
          isMobile={isMobile}
        />
      )}

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ${
          isDetached ? 'pr-3' : 'pr-0'
        } ${
          showSidebar && !isMobile
            ? isDetached
              ? isSidebarOpen
                ? 'lg:pl-70'
                : 'lg:pl-26'
              : isSidebarOpen
                ? 'lg:pl-64'
                : 'lg:pl-20'
            : isDetached
              ? 'pl-3'
              : 'pl-0'
        }`}
      >
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />

        {/* Top Navbar (Active when layoutType === 'navbar') */}
        {showNavbar && <Navbar />}

        {/* Main Body Section (Between Header and Footer) */}
        <div className="flex-1 flex w-full min-w-0">
          <div
            className={`flex-1 flex flex-col w-full min-w-0 ${
              showNavbar ? 'max-w-360 mx-auto px-4 sm:px-6 lg:px-8' : ''
            }`}
          >
            <main
              className={`flex-1 w-full min-w-0 flex flex-col transition-all duration-200 ${
                showNavbar
                  ? 'py-6'
                  : isDetached
                    ? 'my-3'
                    : 'px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6'
              }`}
            >
              {children}
            </main>
          </div>

          {/* Right Sidebar Dock (Height matches page height) */}
          {!isMobile && <RightSidebar />}
        </div>

        <Footer />
      </div>

      {/* Right Theme Customization Sidebar Drawer */}
      <ThemeCustomizer />
    </div>
  );
}
