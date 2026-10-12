import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  FolderTree,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { layoutStyle, layoutType } = useThemeStore();
  const isSmart = layoutType === 'smart';
  const isDetachedSidebar =
    layoutStyle === 'detached' && layoutType === 'sidebar';

  const [isExpanded, setIsExpanded] = useState(false);

  const isVoucherPage =
    location.pathname.includes('/finance/voucher') ||
    location.pathname.includes('/finance/accounting-voucher');

  if (!isVoucherPage) {
    return null;
  }

  const shortcuts = [
    {
      id: 'ledger',
      title: 'Ledger',
      subtitle: 'Accounts & SubLedger',
      icon: BookOpen,
      path: '/finance/masters/finance?tab=ledger',
      badge: 'Finance',
    },
    {
      id: 'group',
      title: 'Group',
      subtitle: 'Chart of Accounts',
      icon: FolderTree,
      path: '/finance/masters/finance?tab=group',
      badge: 'Finance',
    },
  ];

  const layoutClass = isSmart
    ? 'my-2.5 mr-3 ml-0 rounded-2xl'
    : isDetachedSidebar
      ? 'my-3 ml-3 mr-0 rounded-2xl'
      : 'my-0 ml-3 mr-0 rounded-l-2xl border-r-0';

  return (
    <>
      {/* ── Right Compact / Expandable Sidebar Rail ── */}
      <aside
        className={`self-stretch shrink-0 flex flex-col items-center justify-start py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden ${layoutClass} ${
          isExpanded ? 'w-56 sm:w-60 px-2' : 'w-14 sm:w-16 px-1 gap-2.5'
        }`}
      >
        {/* ── EXPANDED VIEW (Showing full menu names) ── */}
        {isExpanded ? (
          <div className="flex flex-col w-full">
            {/* Header with Title & Collapse Button */}
            <div className="flex items-center justify-between w-full px-2 py-1 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Shortcuts
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Menu items list with icons & names */}
            <div className="flex flex-col gap-1.5 w-full mt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mt-1">
                Baseline
              </span>

              {shortcuts.map(item => {
                const Icon = item.icon;
                const currentFullUrl = location.pathname + location.search;
                const isActive =
                  currentFullUrl === item.path ||
                  (location.pathname === item.path && !location.search);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl w-full text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] opacity-75 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── DEFAULT COLLAPSED VIEW (Compact Icon Rail) ── */
          <>
            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Expand Shortcuts Bar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

            {/* Shortcuts Icons */}
            {shortcuts.map(item => {
              const Icon = item.icon;
              const currentFullUrl = location.pathname + location.search;
              const isActive =
                currentFullUrl === item.path ||
                (location.pathname === item.path && !location.search);
              return (
                <div key={item.id} className="relative group flex items-center">
                  <button
                    onClick={() => navigate(item.path)}
                    className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-primary" />
                    )}
                  </button>

                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-xl whitespace-nowrap shadow-xl transition-all duration-200 flex flex-col z-50">
                    <span className="font-semibold flex items-center gap-1.5">
                      {item.title}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/20 text-primary-hover dark:text-primary font-medium">
                        {item.badge}
                      </span>
                    </span>
                    <span className="text-[11px] opacity-75">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </aside>
    </>
  );
}
