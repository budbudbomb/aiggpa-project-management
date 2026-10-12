import React from 'react';
import { useNavigate } from 'react-router';
import {
  Building2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  FolderKanban,
  CheckCircle2,
  TableProperties,
  Layers,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '../store/authStore';

interface RoleQuickAction {
  id: string;
  title: string;
  category: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  theme: {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeColor: string;
    hoverBorder: string;
    accentBar: string;
  };
}

interface RoleConfig {
  tagline: string;
  quickActions: RoleQuickAction[];
  instructions: string[];
}

const COMMON_PROJECT_ACTIONS: RoleQuickAction[] = [
  {
    id: 'projects-desk',
    title: 'Projects Desk',
    category: 'Governance & Budget',
    desc: 'Create, estimate and monitor project proposals, financial heads, and budgets.',
    path: '/create-project',
    icon: FolderKanban,
    theme: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      badgeColor: 'text-indigo-700 dark:text-indigo-300',
      hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      accentBar: 'from-indigo-500 to-purple-600',
    },
  },
  {
    id: 'tasks-activities',
    title: 'Tasks & Activities',
    category: 'Work Plan',
    desc: 'Manage milestone schedules, team deliverables, and operational progress.',
    path: '/activities',
    icon: CheckCircle2,
    theme: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      badgeColor: 'text-emerald-700 dark:text-emerald-300',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      accentBar: 'from-emerald-500 to-teal-600',
    },
  },
  {
    id: 'surveys-desk',
    title: 'Survey Management',
    category: 'Research & Fieldwork',
    desc: 'Review published surveys, field data collection, and respondent metrics.',
    path: '/surveys',
    icon: TableProperties,
    theme: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/50',
      badgeColor: 'text-blue-700 dark:text-blue-300',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
      accentBar: 'from-blue-500 to-indigo-600',
    },
  },
  {
    id: 'create-survey',
    title: 'Survey Builder',
    category: 'Questionnaire Studio',
    desc: 'Build new surveys with customizable questions, validation, and logic.',
    path: '/create-survey',
    icon: BookOpen,
    theme: {
      iconBg: 'bg-purple-50 dark:bg-purple-950/60',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
      badgeColor: 'text-purple-700 dark:text-purple-300',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
      accentBar: 'from-purple-500 to-fuchsia-600',
    },
  },
  {
    id: 'question-bank',
    title: 'Question Bank',
    category: 'Central Library',
    desc: 'Access the standardized central repository of reusable questionnaire items.',
    path: '/question-bank',
    icon: Layers,
    theme: {
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/50',
      badgeColor: 'text-cyan-700 dark:text-cyan-300',
      hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      accentBar: 'from-cyan-500 to-blue-600',
    },
  },
  {
    id: 'complaints-desk',
    title: 'Complaints Desk',
    category: 'Grievance Redressal',
    desc: 'Track citizen complaints, review status updates, and document resolution notes.',
    path: '/complaints',
    icon: AlertCircle,
    theme: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
      badgeColor: 'text-amber-700 dark:text-amber-300',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
      accentBar: 'from-amber-500 to-orange-600',
    },
  },
];

const COMMON_INSTRUCTIONS: string[] = [
  'Create and configure projects with detailed milestones, deliverables, and budget heads.',
  'Track operational tasks and update progress status in the Activities & Tasks module.',
  'Publish surveys and leverage the Central Question Bank for consistent research data.',
  'Monitor citizen grievances and ensure timely resolution through the Complaints Desk.',
];

const DEFAULT_ROLE_CONFIG: RoleConfig = {
  tagline: 'Central Project Governance, Surveys & Grievance Portal',
  quickActions: COMMON_PROJECT_ACTIONS,
  instructions: COMMON_INSTRUCTIONS,
};

const ROLE_DASHBOARD_DATA: Record<UserRole, RoleConfig> = {
  'Center Head': DEFAULT_ROLE_CONFIG,
  'Project Manager': DEFAULT_ROLE_CONFIG,
  'Research Analyst': DEFAULT_ROLE_CONFIG,
  Fellow: DEFAULT_ROLE_CONFIG,
  Intern: DEFAULT_ROLE_CONFIG,
  'Super Admin': DEFAULT_ROLE_CONFIG,
  'Admin Head': DEFAULT_ROLE_CONFIG,
  'Finance Head': DEFAULT_ROLE_CONFIG,
  'Centre Head': DEFAULT_ROLE_CONFIG,
  'Section Head': DEFAULT_ROLE_CONFIG,
  Employee: DEFAULT_ROLE_CONFIG,
};

export default function Features() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role || 'Super Admin';

  const currentConfig = ROLE_DASHBOARD_DATA[role] || DEFAULT_ROLE_CONFIG;

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const isNameSameAsRole = user?.name === role;

  return (
    <div className="relative flex flex-col gap-6 w-full py-1">
      {/* Background Watermark */}
      <div className="fixed bottom-6 right-10 pointer-events-none opacity-5 dark:opacity-10 z-0 select-none">
        <img
          src="/Aiggpa_Logo.svg"
          alt="AIGGPA Logo"
          className="w-56 h-56 object-contain"
        />
      </div>

      {/* ── 1. Executive Welcome Header ──────────────────────────────────────── */}
      <div className="relative z-10 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 w-full">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isNameSameAsRole
                  ? `Welcome, ${role}`
                  : `Welcome, ${user?.name || 'Administrator'}`}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4" />
                {isNameSameAsRole
                  ? user?.code || 'E0001'
                  : `${role} [${user?.code || 'E0001'}]`}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {currentConfig.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{todayFormatted}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Project Governance 2025-26
          </span>
        </div>
      </div>

      {/* ── 2. Two-Column Layout: Left (Quick Actions) | Right (Instructions) ─── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Quick Actions
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Frequently accessed modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentConfig.quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className={`group relative flex flex-col justify-between p-5 min-h-37 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md ${action.theme.hoverBorder} transition-all duration-200 translate-y-0 hover:-translate-y-0.5 text-left cursor-pointer overflow-hidden`}
                >
                  <div>
                    {/* Top Bar: Icon + Category Badge + Arrow */}
                    <div className="flex items-center justify-between w-full mb-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.theme.iconBg} ${action.theme.iconColor}`}
                      >
                        <Icon className="w-5.5 h-5.5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-2xs font-bold px-2 py-0.5 rounded-md ${action.theme.badgeBg} ${action.theme.badgeColor}`}
                        >
                          {action.category}
                        </span>
                        <div className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>

                  {/* Bottom link indicator */}
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Open module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover bottom gradient line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-linear-to-r ${action.theme.accentBar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: General Instructions */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Project Guidelines
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Best Practices
            </span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between gap-5">
            <ul className="space-y-4">
              {currentConfig.instructions.map((inst, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium"
                >
                  <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="pt-0.5">{inst}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  IT Cell & Project Support
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6">
                Technical queries:{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  support@aiggpa.mp.gov.in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
