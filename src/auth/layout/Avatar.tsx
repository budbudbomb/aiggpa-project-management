import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Check, ArrowRightLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ActivityTaskStore } from '../../stores/activityTaskStore';

interface AvatarProps {
  onLogout: () => void;
}

const DEMO_ACCOUNTS = [
  {
    id: 'EMP-CH-01',
    role: 'Center Head',
    name: 'Dr. Rajeshwar Rao',
    icon: '👑',
    tier: 'Tier 1 • Super Admin',
  },
  {
    id: 'EMP-ADV-01',
    role: 'Advisor',
    name: 'Priya Sharma',
    icon: '💼',
    tier: 'Tier 2 • Senior Reviewer',
  },
  {
    id: 'EMP-FL-01',
    role: 'Fellow',
    name: 'Aakash Mehta',
    icon: '🎓',
    tier: 'Tier 3 • Execution',
  },
  {
    id: 'EMP-IN-01',
    role: 'Intern',
    name: 'Rohan Verma',
    icon: '📋',
    tier: 'Tier 3 • Execution',
  },
  {
    id: 'EMP-FI-01',
    role: 'Field Instructor',
    name: 'Surendra Patel',
    icon: '🧭',
    tier: 'Tier 3 • Execution',
  },
  {
    id: 'EMP-RA-01',
    role: 'Research Analyst',
    name: 'Dr. Vikramaditya',
    icon: '🔬',
    tier: 'Tier 3 • Execution',
  },
];

export default function Avatar({ onLogout }: AvatarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, switchUser } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSwitch = (empId: string) => {
    switchUser(empId);
    ActivityTaskStore.setActiveUser(empId);
    setIsDropdownOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs tracking-wider"
        title="User Account & Switcher"
      >
        {getInitials(user?.name)}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Active Profile Info */}
          <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Active User'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                {user?.role}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {user?.email}
            </p>
          </div>

          {/* Quick Perspective Switcher (Dev / Demo) */}
          <div className="py-2">
            <div className="flex items-center justify-between px-2.5 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                <span>Switch Role (Demo)</span>
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              {DEMO_ACCOUNTS.map(acc => {
                const isActive = user?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleSwitch(acc.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{acc.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{acc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">
                          {acc.role} ({acc.tier})
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
