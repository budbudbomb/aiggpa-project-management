import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, applyThemeClass } from 'auth/store/themeStore';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme, primaryColor, borderRadius } = useThemeStore();

  useEffect(() => {
    applyThemeClass(mode, primaryColor, borderRadius);
  }, [mode, primaryColor, borderRadius]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
      title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {mode === 'light' ? (
        <>
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-blue-400 transition-transform duration-300 rotate-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};
