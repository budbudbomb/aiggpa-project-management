import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class merge utility */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format ISO date string to readable display */
export function formatDate(dateStr?: string, fmt = 'dd MMM yyyy'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    if (fmt.includes('HH:mm')) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    }
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/** "2 hours ago" style */
export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

/** Truncate long strings */
export function truncate(str: string, maxLen = 60): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin',
    pc: 'Program Coordinator',
    fellow: 'Fellow',
    intern: 'Intern',
    pmu: 'PMU',
    pm: 'Program Manager',
    spm_cpm: 'Senior Program Manager',
  };
  return map[role] ?? role;
}

export function complaintCategoryLabel(category?: string): string {
  if (!category) return 'General Issue';
  const map: Record<string, string> = {
    stipend: 'Stipend & Allowances',
    field_travel: 'Field & Travel Logistics',
    workload_tasks: 'Workload & Assignments',
    infrastructure: 'Device, SIM & Portal',
    interpersonal: 'Interpersonal Grievance',
    other: 'Other Issue',
  };
  return map[category] ?? category;
}

export function complaintStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    pending: 'Pending Review',
    escalated: 'Moved to Center Head',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return (status && map[status]) || status || 'Pending';
}

export function complaintStatusColor(status?: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    escalated: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    (status && map[status]) || 'bg-slate-100 text-slate-700 border-slate-200'
  );
}

export function complaintPriorityLabel(priority?: string): string {
  const map: Record<string, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return (priority && map[priority]) || priority || 'Medium';
}

export function complaintPriorityColor(priority?: string): string {
  const map: Record<string, string> = {
    urgent: 'bg-rose-100 text-rose-800 border-rose-200',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    (priority && map[priority]) ||
    'bg-slate-100 text-slate-700 border-slate-200'
  );
}
