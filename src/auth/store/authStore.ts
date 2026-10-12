import { create } from 'zustand';
import {
  ROLE_PERMISSIONS,
  type HierarchyRole,
  type Permission,
} from '../permissions';

export type UserRole =
  | HierarchyRole
  | 'Super Admin'
  | 'Admin Head'
  | 'Finance Head'
  | 'Centre Head'
  | 'Section Head'
  | 'Employee';

export interface User {
  id: string; // Employee ID (e.g. EMP-CH-01, EMP-PM-01)
  code: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarColor?: string;
  defaultLandingPath: string;
  designation?: string;
  department?: string;
  empId?: string;
  reportsTo: string | null;
  centerId: string;
  assignedProjectIds: string[];
  permissions: Permission[];
}

export const HIERARCHY_ACCOUNTS: Record<string, User> = {
  'EMP-CH-01': {
    id: 'EMP-CH-01',
    code: 'EMP-CH-01',
    name: 'Dr. Rajeshwar Rao',
    email: 'rajeshwar.rao@aiggpa.mp.gov.in',
    role: 'Center Head',
    designation: 'Director & Center Head',
    department: 'Center for Policy Governance & Evaluation',
    reportsTo: null,
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-02', 'PRJ-03', 'PRJ-04'],
    permissions: ROLE_PERMISSIONS['Center Head'],
    defaultLandingPath: '/activities',
    avatarColor: '#1d4ed8',
  },
  'EMP-PM-01': {
    id: 'EMP-PM-01',
    code: 'EMP-PM-01',
    name: 'Priya Sharma',
    email: 'priya.sharma@aiggpa.mp.gov.in',
    role: 'Project Manager',
    designation: 'Senior Project Manager',
    department: 'Digital Infrastructure & Field Operations',
    reportsTo: 'EMP-CH-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-02'],
    permissions: ROLE_PERMISSIONS['Project Manager'],
    defaultLandingPath: '/activities',
    avatarColor: '#0284c7',
  },
  'EMP-RA-01': {
    id: 'EMP-RA-01',
    code: 'EMP-RA-01',
    name: 'Dr. Vikramaditya',
    email: 'vikramaditya@aiggpa.mp.gov.in',
    role: 'Research Analyst',
    designation: 'Lead Research Analyst',
    department: 'Quantitative Evaluation & Statistics',
    reportsTo: 'EMP-CH-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-03'],
    permissions: ROLE_PERMISSIONS['Research Analyst'],
    defaultLandingPath: '/activities',
    avatarColor: '#0f766e',
  },
  'EMP-FL-01': {
    id: 'EMP-FL-01',
    code: 'EMP-FL-01',
    name: 'Aakash Mehta',
    email: 'aakash.mehta@aiggpa.mp.gov.in',
    role: 'Fellow',
    designation: 'Lead Policy Fellow',
    department: 'Field Operations & Surveys',
    reportsTo: 'EMP-PM-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01'],
    permissions: ROLE_PERMISSIONS['Fellow'],
    defaultLandingPath: '/activities',
    avatarColor: '#3b82f6',
  },
  'EMP-IN-01': {
    id: 'EMP-IN-01',
    code: 'EMP-IN-01',
    name: 'Rohan Verma',
    email: 'rohan.verma@aiggpa.mp.gov.in',
    role: 'Intern',
    designation: 'Field Research Intern',
    department: 'Field Operations & Surveys',
    reportsTo: 'EMP-FL-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01'],
    permissions: ROLE_PERMISSIONS['Intern'],
    defaultLandingPath: '/activities',
    avatarColor: '#6366f1',
  },
};

export const ROLE_ACCOUNTS: Record<string, User> = {
  ...HIERARCHY_ACCOUNTS,
  E0001: {
    id: 'EMP-CH-01',
    code: 'E0001',
    name: 'Dr. Rajeshwar Rao (Super Admin)',
    email: 'superadmin@aiggpa.mp.gov.in',
    role: 'Center Head',
    defaultLandingPath: '/activities',
    reportsTo: null,
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-02', 'PRJ-03'],
    permissions: ROLE_PERMISSIONS['Center Head'],
    designation: 'Director & Center Head',
    department: 'Center for Policy Governance & Evaluation',
  },
  E0002: {
    id: 'EMP-PM-01',
    code: 'E0002',
    name: 'Priya Sharma (Admin Head)',
    email: 'adminhead@aiggpa.mp.gov.in',
    role: 'Project Manager',
    defaultLandingPath: '/activities',
    reportsTo: 'EMP-CH-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-02'],
    permissions: ROLE_PERMISSIONS['Project Manager'],
    designation: 'Senior Project Manager',
    department: 'Digital Infrastructure',
  },
  E0003: {
    id: 'EMP-RA-01',
    code: 'E0003',
    name: 'Dr. Vikramaditya (Finance Head)',
    email: 'financehead@aiggpa.mp.gov.in',
    role: 'Research Analyst',
    defaultLandingPath: '/activities',
    reportsTo: 'EMP-CH-01',
    centerId: 'CPGE-01',
    assignedProjectIds: ['PRJ-01', 'PRJ-03'],
    permissions: ROLE_PERMISSIONS['Research Analyst'],
    designation: 'Lead Research Analyst',
    department: 'Evaluation & Statistics',
  },
  E0004: {
    ...HIERARCHY_ACCOUNTS['EMP-CH-01'],
    code: 'E0004',
  },
  E0005: {
    ...HIERARCHY_ACCOUNTS['EMP-FL-01'],
    code: 'E0005',
  },
  'EMP-1042': {
    ...HIERARCHY_ACCOUNTS['EMP-PM-01'],
    code: 'EMP-1042',
  },
};

export function findUserByUsername(input: string): User {
  const clean = input.trim().toUpperCase();
  if (HIERARCHY_ACCOUNTS[clean]) {
    return HIERARCHY_ACCOUNTS[clean];
  }
  if (ROLE_ACCOUNTS[clean]) {
    return ROLE_ACCOUNTS[clean];
  }

  const lower = input.trim().toLowerCase();

  // 1. Center Head matches
  if (
    lower.includes('center_head') ||
    lower.includes('center head') ||
    lower.includes('rajeshwar') ||
    lower === 'ch' ||
    lower === 'ch01' ||
    lower === 'e0001' ||
    lower === 'e0004'
  ) {
    return HIERARCHY_ACCOUNTS['EMP-CH-01'];
  }

  // 2. Project Manager matches
  if (
    lower.includes('project_manager') ||
    lower.includes('project manager') ||
    lower.includes('pm') ||
    lower.includes('priya') ||
    lower === 'pm01' ||
    lower === 'e0002' ||
    lower === 'aiggpa'
  ) {
    return HIERARCHY_ACCOUNTS['EMP-PM-01'];
  }

  // 3. Research Analyst matches
  if (
    lower.includes('research_analyst') ||
    lower.includes('research analyst') ||
    lower.includes('analyst') ||
    lower.includes('vikram') ||
    lower === 'ra' ||
    lower === 'ra01' ||
    lower === 'e0003'
  ) {
    return HIERARCHY_ACCOUNTS['EMP-RA-01'];
  }

  // 4. Fellow matches
  if (
    lower.includes('fellow') ||
    lower.includes('aakash') ||
    lower === 'fl' ||
    lower === 'fl01' ||
    lower === 'e0005'
  ) {
    return HIERARCHY_ACCOUNTS['EMP-FL-01'];
  }

  // 5. Intern matches
  if (
    lower.includes('intern') ||
    lower.includes('rohan') ||
    lower === 'in' ||
    lower === 'in01'
  ) {
    return HIERARCHY_ACCOUNTS['EMP-IN-01'];
  }

  // Fallback to Center Head
  return HIERARCHY_ACCOUNTS['EMP-CH-01'];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password?: string) => Promise<User>;
  switchUser: (employeeIdOrUsername: string) => User;
  logout: () => void;
}

const STORAGE_KEY = 'app_auth_user';

const getInitialUser = (): User => {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.code || parsed.role)) {
          return findUserByUsername(parsed.id || parsed.code || parsed.role);
        }
      } catch {
        return HIERARCHY_ACCOUNTS['EMP-CH-01'];
      }
    }
  }
  return HIERARCHY_ACCOUNTS['EMP-CH-01'];
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>(set => ({
  user: initialUser,
  isAuthenticated: true,
  token: 'mock-jwt-token-123456',

  login: async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const userData = findUserByUsername(username);

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    sessionStorage.setItem('aiggpa_user_name', userData.name);
    sessionStorage.setItem('aiggpa_user_role', userData.role);
    sessionStorage.setItem('aiggpa_role_key', userData.code);
    localStorage.setItem('aiggpa_active_role_user', userData.id);

    set({
      user: userData,
      isAuthenticated: true,
      token: `mock-token-${userData.code}`,
    });

    return userData;
  },

  switchUser: (employeeIdOrUsername: string) => {
    const userData = findUserByUsername(employeeIdOrUsername);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    sessionStorage.setItem('aiggpa_user_name', userData.name);
    sessionStorage.setItem('aiggpa_user_role', userData.role);
    sessionStorage.setItem('aiggpa_role_key', userData.code);
    localStorage.setItem('aiggpa_active_role_user', userData.id);

    set({
      user: userData,
      isAuthenticated: true,
      token: `mock-token-${userData.code}`,
    });

    return userData;
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('aiggpa_user_name');
    sessionStorage.removeItem('aiggpa_user_role');
    sessionStorage.removeItem('aiggpa_role_key');
    set({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  },
}));
