import React from 'react';
import { useThemeStore } from '../store/themeStore';

export default function Footer() {
  const { layoutStyle, layoutType } = useThemeStore();
  const isDetached = layoutStyle === 'detached' && layoutType === 'sidebar';

  return (
    <footer
      className={`bg-white dark:bg-slate-900 px-6 py-3 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto transition-all duration-200 ${
        isDetached
          ? 'mb-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs'
          : 'w-full border-t border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          AIGGPA ERP
        </span>
        <span>•</span>
        <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
        <span>Designed & Developed by :</span>
        <span className="font-semibold text-primary tracking-wide">NICSI</span>
      </div>
    </footer>
  );
}
