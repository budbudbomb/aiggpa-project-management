import React from 'react';
import { ThemeToggle } from 'shared/components/theme/ThemeToggle';
import { Sun, Moon, Palette, Layers } from 'lucide-react';

export const ThemeSection: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Theme & Styling System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Default Light Mode with instant Dark Mode switching powered by
              Tailwind CSS v4 & PrimeReact
            </p>
          </div>
        </div>

        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sun className="w-4 h-4 text-amber-500" /> Default Light Theme
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clean, high-contrast light mode optimized for daytime legibility and
            professional UI density.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Moon className="w-4 h-4 text-indigo-400" /> Seamless Dark Mode
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toggles Tailwind{' '}
            <code className="text-indigo-600 dark:text-indigo-400">.dark</code>{' '}
            class & updates PrimeReact stylesheet dynamically.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-emerald-500" /> 100% Tailwind CSS v4
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Zero PrimeFlex dependency. All spacing, layout, cards, and overrides
            utilize pure utility classes.
          </p>
        </div>
      </div>
    </div>
  );
};
