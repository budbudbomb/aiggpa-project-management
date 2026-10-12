import type { ElementType } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  TableProperties,
  BookOpen,
  Layers,
  AlertCircle,
} from 'lucide-react';

export interface SubSubMenuItemConfig {
  label: string;
  path: string;
  icon: ElementType;
  description?: string;
}

export interface SubMenuItemConfig {
  label: string;
  path: string;
  icon: ElementType;
  description?: string;
  children?: SubSubMenuItemConfig[];
}

export interface MenuItemConfig {
  label: string;
  path: string;
  icon: ElementType;
  description?: string;
  children?: SubMenuItemConfig[];
}

export interface MenuSectionConfig {
  title: string;
  items: MenuItemConfig[];
}

// ============================================================================
// 1. OVERVIEW
// ============================================================================
export const dashboardMenuItem: MenuItemConfig = {
  label: 'Dashboard',
  path: '/dashboard',
  icon: LayoutDashboard,
  description: 'Project performance analytics, KPIs & operational summary',
};

export const overviewSection: MenuSectionConfig = {
  title: 'Overview',
  items: [dashboardMenuItem],
};

// ============================================================================
// 2. PROJECT GOVERNANCE
// ============================================================================
export const projectsDeskMenuItem: MenuItemConfig = {
  label: 'Projects Desk',
  path: '/create-project',
  icon: FolderKanban,
  description: 'Project proposal, estimation & budget management',
};

export const activitiesMenuItem: MenuItemConfig = {
  label: 'Activities & Tasks',
  path: '/activities',
  icon: CheckCircle2,
  description: 'Task assignments, milestones & activity tracker',
};

export const projectManagementSection: MenuSectionConfig = {
  title: 'Project Governance',
  items: [projectsDeskMenuItem, activitiesMenuItem],
};

// ============================================================================
// 3. SURVEY STUDIO & RESEARCH
// ============================================================================
export const surveysMenuItem: MenuItemConfig = {
  label: 'Surveys',
  path: '/surveys',
  icon: TableProperties,
  description: 'Field surveys, questionnaire builder & questions',
  children: [
    {
      label: 'All Surveys',
      path: '/surveys',
      icon: TableProperties,
      description: 'Survey directory and fieldwork status',
    },
    {
      label: 'Create Survey',
      path: '/create-survey',
      icon: BookOpen,
      description: 'Interactive survey form & logic builder',
    },
    {
      label: 'Question Bank',
      path: '/question-bank',
      icon: Layers,
      description: 'Central reusable question library',
    },
  ],
};

export const surveysSection: MenuSectionConfig = {
  title: 'Survey Studio',
  items: [surveysMenuItem],
};

// ============================================================================
// 4. GRIEVANCE & SUPPORT
// ============================================================================
export const complaintsMenuItem: MenuItemConfig = {
  label: 'Complaints Desk',
  path: '/complaints',
  icon: AlertCircle,
  description: 'Citizen grievances & ticket resolution desk',
};

export const grievanceSection: MenuSectionConfig = {
  title: 'Helpdesk & Support',
  items: [complaintsMenuItem],
};

// ============================================================================
// 5. MASTER DATA MANAGEMENT
// ============================================================================
export const masterDataSection: MenuSectionConfig = {
  title: 'Master Data Management',
  items: [
    {
      label: 'Master Data',
      path: '/masters/employees',
      icon: Layers,
      description: 'Organizational & financial reference master definitions',
      children: [
        {
          label: 'Employee Directory',
          path: '/masters/employees',
          icon: Layers,
          description: 'Employee profiles, roles & reporting hierarchy',
        },
        {
          label: 'Centers & Departments',
          path: '/masters/centers',
          icon: Layers,
          description: 'Research centres, mandates & center heads',
        },
        {
          label: 'Financial Years',
          path: '/masters/financial-years',
          icon: Layers,
          description: 'FY periods and active accounting cycle',
        },
        {
          label: 'Government Schemes',
          path: '/masters/schemes',
          icon: Layers,
          description: 'Sponsored schemes, accounting codes & budget caps',
        },
        {
          label: 'Budget Heads',
          path: '/masters/budget-heads',
          icon: Layers,
          description: 'Budget categories, sub-heads & calculation modes',
        },
        {
          label: 'Question Categories',
          path: '/masters/question-categories',
          icon: Layers,
          description: 'Taxonomy and tagging for research question banks',
        },
        {
          label: 'Grievance Categories',
          path: '/masters/grievance-categories',
          icon: Layers,
          description: 'SLA parameters, priorities & escalation roles',
        },
        {
          label: 'Survey Milestones',
          path: '/masters/milestones',
          icon: Layers,
          description: 'Survey lifecycle milestones, sequence & target offsets',
        },
      ],
    },
  ],
};

// ============================================================================
// NAVIGATION STRUCTURE (PROJECT MANAGEMENT ONLY)
// ============================================================================
export const navigationMenuSections: MenuSectionConfig[] = [
  overviewSection,
  projectManagementSection,
  surveysSection,
  grievanceSection,
  masterDataSection,
];

export const navigationMenuItems: MenuItemConfig[] =
  navigationMenuSections.flatMap(section => section.items);

export function getMenuSectionsForRole(role?: string): MenuSectionConfig[] {
  if (role === 'Intern') {
    return [
      overviewSection,
      {
        title: 'Project Tasks',
        items: [
          {
            ...activitiesMenuItem,
            label: 'My Tasks & Submissions',
            description: 'Assigned field tasks, evidence capture & review status',
          },
        ],
      },
    ];
  }

  if (role === 'Fellow') {
    return [
      overviewSection,
      {
        title: 'Project Governance',
        items: [activitiesMenuItem],
      },
      surveysSection,
      grievanceSection,
    ];
  }

  if (role === 'Research Analyst') {
    return [
      overviewSection,
      projectManagementSection,
      surveysSection,
      grievanceSection,
    ];
  }

  return navigationMenuSections;
}

export function getMenuItemsForRole(role?: string): MenuItemConfig[] {
  return getMenuSectionsForRole(role).flatMap(section => section.items);
}

export function isRouteAllowedForRole(pathname: string, role?: string): boolean {
  if (!role) return true;

  const normalized = pathname.toLowerCase();

  // Intern route restrictions: strictly execution-focused
  if (role === 'Intern') {
    if (
      normalized.startsWith('/create-project') ||
      normalized.startsWith('/create-survey') ||
      normalized.startsWith('/masters') ||
      normalized.startsWith('/question-bank')
    ) {
      return false;
    }
    return true;
  }

  // Fellow route restrictions: cannot create projects or manage master data
  if (role === 'Fellow') {
    if (
      normalized.startsWith('/create-project') ||
      normalized.startsWith('/masters')
    ) {
      return false;
    }
    return true;
  }

  // Research Analyst restrictions: cannot edit core master data
  if (role === 'Research Analyst') {
    if (normalized.startsWith('/masters')) {
      return false;
    }
    return true;
  }

  return true;
}

