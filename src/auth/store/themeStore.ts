import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type PrimaryColor =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'sky';
export type BorderRadiusPreset = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LayoutType = 'sidebar' | 'navbar' | 'smart';
export type LayoutStyle = 'flat' | 'detached';
export type SidebarBgStyle = 'filled' | 'tinted' | 'transparent';

export const PRIMARY_COLORS: {
  id: PrimaryColor;
  label: string;
  hex: string;
  hoverHex: string;
  bgClass: string;
}[] = [
  {
    id: 'indigo',
    label: 'AIGGPA Blue',
    hex: '#2563EB',
    hoverHex: '#1D4ED8',
    bgClass: 'bg-blue-600',
  },
  {
    id: 'violet',
    label: 'Deep Violet',
    hex: '#5c4db1',
    hoverHex: '#4d3ea0',
    bgClass: 'bg-violet-600',
  },
  {
    id: 'emerald',
    label: 'Executive Emerald',
    hex: '#059669',
    hoverHex: '#047857',
    bgClass: 'bg-emerald-700',
  },
  {
    id: 'rose',
    label: 'Refined Rose',
    hex: '#DC2626',
    hoverHex: '#B91C1C',
    bgClass: 'bg-rose-700',
  },
  {
    id: 'amber',
    label: 'Classic Bronze',
    hex: '#D97706',
    hoverHex: '#B45309',
    bgClass: 'bg-amber-800',
  },
  {
    id: 'sky',
    label: 'Steel Sky',
    hex: '#0284C7',
    hoverHex: '#0369A1',
    bgClass: 'bg-sky-700',
  },
];

export const BORDER_RADIUS_OPTIONS: {
  id: BorderRadiusPreset;
  label: string;
  value: string;
}[] = [
  { id: 'sm', label: 'Small (8px)', value: '0.5rem' },
  { id: 'md', label: 'Medium (12px)', value: '0.75rem' },
  { id: 'lg', label: 'Large (16px)', value: '1rem' },
  { id: 'xl', label: 'Extra Large (24px)', value: '1.5rem' },
  { id: '2xl', label: 'Full Round (32px)', value: '2rem' },
];

interface ThemeState {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  borderRadius: BorderRadiusPreset;
  layoutType: LayoutType;
  layoutStyle: LayoutStyle;
  sidebarBgStyle: SidebarBgStyle;
  isCustomizerOpen: boolean;

  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  setBorderRadius: (radius: BorderRadiusPreset) => void;
  setLayoutType: (layoutType: LayoutType) => void;
  setLayoutStyle: (layoutStyle: LayoutStyle) => void;
  setSidebarBgStyle: (sidebarBgStyle: SidebarBgStyle) => void;
  setCustomizerOpen: (isOpen: boolean) => void;
  toggleCustomizer: () => void;
}

const getInitialMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme_mode') as ThemeMode;
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'light';
};

const getInitialPrimaryColor = (): PrimaryColor => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme_primary_color') as PrimaryColor;
    if (PRIMARY_COLORS.some(c => c.id === saved)) return saved;
  }
  return 'indigo';
};

const getInitialBorderRadius = (): BorderRadiusPreset => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(
      'theme_border_radius'
    ) as BorderRadiusPreset;
    if (BORDER_RADIUS_OPTIONS.some(r => r.id === saved)) return saved;
  }
  return 'md'; // 12px standard enterprise card radius
};

const getInitialLayoutType = (): LayoutType => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme_layout_type') as LayoutType;
    if (saved === 'sidebar' || saved === 'navbar' || saved === 'smart')
      return saved;
  }
  return 'sidebar'; // Default to standard ERP sidebar
};

const getInitialLayoutStyle = (): LayoutStyle => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme_layout_style') as LayoutStyle;
    if (saved === 'flat' || saved === 'detached') return saved;
  }
  return 'flat';
};

const getInitialSidebarBgStyle = (): SidebarBgStyle => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(
      'theme_sidebar_bg_style'
    ) as SidebarBgStyle;
    if (saved === 'filled' || saved === 'tinted' || saved === 'transparent')
      return saved;
  }
  return 'filled';
};

const initialMode = getInitialMode();
const initialPrimaryColor = getInitialPrimaryColor();
const initialBorderRadius = getInitialBorderRadius();
const initialLayoutType = getInitialLayoutType();
const initialLayoutStyle = getInitialLayoutStyle();
const initialSidebarBgStyle = getInitialSidebarBgStyle();

// Apply initial styles immediately
applyThemeClass(initialMode, initialPrimaryColor, initialBorderRadius);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  primaryColor: initialPrimaryColor,
  borderRadius: initialBorderRadius,
  layoutType: initialLayoutType,
  layoutStyle: initialLayoutStyle,
  sidebarBgStyle: initialSidebarBgStyle,
  isCustomizerOpen: false,

  setMode: mode => {
    localStorage.setItem('theme_mode', mode);
    applyThemeClass(mode, get().primaryColor, get().borderRadius);
    set({ mode });
  },

  toggleTheme: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme_mode', newMode);
    applyThemeClass(newMode, get().primaryColor, get().borderRadius);
    set({ mode: newMode });
  },

  setPrimaryColor: primaryColor => {
    localStorage.setItem('theme_primary_color', primaryColor);
    applyThemeClass(get().mode, primaryColor, get().borderRadius);
    set({ primaryColor });
  },

  setBorderRadius: borderRadius => {
    localStorage.setItem('theme_border_radius', borderRadius);
    applyThemeClass(get().mode, get().primaryColor, borderRadius);
    set({ borderRadius });
  },

  setLayoutType: layoutType => {
    localStorage.setItem('theme_layout_type', layoutType);
    set({ layoutType });
  },

  setLayoutStyle: layoutStyle => {
    localStorage.setItem('theme_layout_style', layoutStyle);
    set({ layoutStyle });
  },

  setSidebarBgStyle: sidebarBgStyle => {
    localStorage.setItem('theme_sidebar_bg_style', sidebarBgStyle);
    set({ sidebarBgStyle });
  },

  setCustomizerOpen: isCustomizerOpen => set({ isCustomizerOpen }),
  toggleCustomizer: () => set({ isCustomizerOpen: !get().isCustomizerOpen }),
}));

export function applyThemeClass(
  mode: ThemeMode = 'light',
  primaryColor: PrimaryColor = 'indigo',
  borderRadius: BorderRadiusPreset = 'md'
) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // 1. Mode Class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Primary Color attribute & CSS Variables
  const colorObj =
    PRIMARY_COLORS.find(c => c.id === primaryColor) || PRIMARY_COLORS[0];
  root.setAttribute('data-primary-color', primaryColor);
  root.style.setProperty('--color-primary', colorObj.hex);
  root.style.setProperty('--color-primary-hover', colorObj.hoverHex);

  // 3. Border Radius Preset
  const radiusObj =
    BORDER_RADIUS_OPTIONS.find(r => r.id === borderRadius) ||
    BORDER_RADIUS_OPTIONS[1];
  root.setAttribute('data-border-radius', borderRadius);
  root.style.setProperty('--radius-preset', radiusObj.value);
}
