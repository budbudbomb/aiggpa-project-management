import type { CSSProperties } from 'react';

export type TopbarBell = 'none' | 'circle' | 'plain';

export interface TopbarUserVariant {
  style: 'blue' | 'white' | 'dark';
  avatar: string;
  name: string;
  role?: string;
  menuName: string;
  menuRole: string;
}

export interface TopbarConfig {
  searchPlaceholder?: string;
  crumb?: { label: string; page?: string };
  bell?: TopbarBell;
  user: TopbarUserVariant;
}

export interface LayoutPageConfig {
  mainClass?: string;
  mainStyle?: CSSProperties;
  topbar: TopbarConfig;
}

const BLUE_USER: TopbarUserVariant = {
  style: 'blue',
  avatar: 'AI',
  name: 'AIGGPA',
  menuName: 'AIGGPA Admin',
  menuRole: 'Center Head',
};

const WHITE_USER: TopbarUserVariant = {
  style: 'white',
  avatar: 'D',
  name: 'Dr. Rajesh Verma (Chief Program Manager)',
  role: 'Admin',
  menuName: 'Dr. Rajesh Verma',
  menuRole: 'Chief Program Manager',
};

const DARK_USER: TopbarUserVariant = {
  style: 'dark',
  avatar: 'D',
  name: 'Dr. Rajesh Verma (Chief Program Manager)',
  role: 'Admin',
  menuName: 'Dr. Rajesh Verma',
  menuRole: 'Chief Program Manager',
};

const DEFAULT_TOPBAR: TopbarConfig = {
  searchPlaceholder: 'Quick search projects, tasks, surveys...',
  bell: 'none',
  user: BLUE_USER,
};

export const PAGE_LAYOUTS: Record<string, LayoutPageConfig> = {
  '/dashboard': { topbar: { ...DEFAULT_TOPBAR } },
  '/create-project': { topbar: { ...DEFAULT_TOPBAR } },
  '/activities': {
    mainStyle: {},
    topbar: {
      crumb: { label: 'CMYP Admin' },
      bell: 'plain',
      user: DARK_USER,
    },
  },
  '/surveys': {
    mainStyle: { padding: '22px 28px' },
    topbar: {
      crumb: { label: 'CMYP Admin', page: 'Surveys' },
      bell: 'circle',
      user: WHITE_USER,
    },
  },
  '/create-survey': {
    mainStyle: { padding: '24px 32px', maxWidth: 1060, margin: '0 auto' },
    topbar: { searchPlaceholder: 'Search...', bell: 'none', user: BLUE_USER },
  },
  '/complaints': {
    mainClass: 'complaints-workspace',
    mainStyle: {},
    topbar: { searchPlaceholder: 'Search...', bell: 'circle', user: BLUE_USER },
  },
};

export const DEFAULT_LAYOUT: LayoutPageConfig = {
  topbar: { ...DEFAULT_TOPBAR },
};
