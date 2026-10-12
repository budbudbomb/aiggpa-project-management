import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Landmark, FolderKanban, Users } from 'lucide-react';

export interface DashboardSwitcherProps {
  className?: string;
}

export const DashboardSwitcher: React.FC<DashboardSwitcherProps> = ({
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHr =
    location.pathname.includes('/hr/dashboard') ||
    location.pathname.includes('/finance/dashboard/hr');
  const isProjects = location.pathname.includes('/projects');
  const isFinance = !isHr && !isProjects;

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs select-none ${className}`}
    >
      {/* Finance Dashboard Button */}
      <button
        onClick={() => navigate('/finance/dashboard/finance')}
        title="Switch to Finance Dashboard"
        className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
          isFinance
            ? 'bg-primary text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium'
        }`}
      >
        <Landmark className="w-4 h-4 shrink-0" />
        <span>Finance Dashboard</span>
      </button>

      {/* Projects Dashboard Button */}
      <button
        onClick={() => navigate('/finance/dashboard/projects')}
        title="Switch to Projects Dashboard"
        className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
          isProjects
            ? 'bg-primary text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium'
        }`}
      >
        <FolderKanban className="w-4 h-4 shrink-0" />
        <span>Projects Dashboard</span>
      </button>

      {/* HR Dashboard Button */}
      <button
        onClick={() => navigate('/hr/dashboard')}
        title="Switch to HR Dashboard"
        className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
          isHr
            ? 'bg-primary text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium'
        }`}
      >
        <Users className="w-4 h-4 shrink-0" />
        <span>HR Dashboard</span>
      </button>
    </div>
  );
};
