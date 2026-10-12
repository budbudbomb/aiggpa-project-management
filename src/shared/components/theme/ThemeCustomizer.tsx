import React from 'react';
import {
  useThemeStore,
  PRIMARY_COLORS,
  BORDER_RADIUS_OPTIONS,
  type PrimaryColor,
  type BorderRadiusPreset,
} from 'auth/store/themeStore';
import {
  X,
  Sun,
  Moon,
  Palette,
  Check,
  RefreshCw,
  Sparkles,
  PanelLeft,
  LayoutGrid,
  Square,
  Layers,
  Layers2,
} from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const {
    mode,
    primaryColor,
    borderRadius,
    layoutType,
    layoutStyle,
    sidebarBgStyle,
    isCustomizerOpen,
    setCustomizerOpen,
    setMode,
    setPrimaryColor,
    setBorderRadius,
    setLayoutType,
    setLayoutStyle,
    setSidebarBgStyle,
  } = useThemeStore();

  if (!isCustomizerOpen) return null;

  const handleReset = () => {
    setMode('light');
    setPrimaryColor('indigo');
    setBorderRadius('sm');
    setLayoutType('smart');
    setLayoutStyle('detached');
    setSidebarBgStyle('filled');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setCustomizerOpen(false)}
      />

      {/* Slide-in Right Customization Drawer */}
      <aside className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-250 transition-colors overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Theme Customizer
                </h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Real-time appearance & layout controls
                </p>
              </div>
            </div>

            <button
              onClick={() => setCustomizerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Appearance Mode */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Appearance Mode
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Section 2: Navigation Layout Type */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation Layout Type
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayoutType('sidebar')}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                  layoutType === 'sidebar'
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <PanelLeft className="w-4 h-4" />
                <span className="text-center leading-tight">Sidebar</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('navbar')}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                  layoutType === 'navbar'
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-center leading-tight">Top Navbar</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('smart')}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                  layoutType === 'smart'
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers2 className="w-4 h-4" />
                <span className="text-center leading-tight">Smart</span>
              </button>
            </div>
          </div>

          {/* Section 3: Sidebar Background Style (Only for Sidebar Mode, not Smart) */}
          {layoutType === 'sidebar' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sidebar Background Fill
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarBgStyle('filled')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                    sidebarBgStyle === 'filled'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4 fill-current opacity-90" />
                  <span className="text-center">Solid 100%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarBgStyle('tinted')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                    sidebarBgStyle === 'tinted'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4 fill-current opacity-45" />
                  <span className="text-center">Light Tint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarBgStyle('transparent')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-2xs font-medium transition-all cursor-pointer ${
                    sidebarBgStyle === 'transparent'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4 text-slate-400" />
                  <span className="text-center">Neutral BG</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Layout Style Variant (Only for Sidebar Mode, not Smart) */}
          {layoutType === 'sidebar' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Layout Style Variant
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setLayoutStyle('flat')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    layoutStyle === 'flat'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>Flat Edge Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutStyle('detached')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    layoutStyle === 'detached'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Detached Cards</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 5: Primary Accent Palette */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Primary Accent Color
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {PRIMARY_COLORS.map(col => {
                const isSelected = primaryColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setPrimaryColor(col.id as PrimaryColor)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-3" />}
                    </span>
                    <span className="truncate">{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Border Radius Preset */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Border Radius Preset
            </span>

            <div className="grid grid-cols-2 gap-2">
              {BORDER_RADIUS_OPTIONS.map(opt => {
                const isSelected = borderRadius === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setBorderRadius(opt.id as BorderRadiusPreset)
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomizerOpen(false)}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
};
