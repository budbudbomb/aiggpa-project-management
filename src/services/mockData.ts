import {
  type KpiMetric,
  type UserMember,
  type RevenueChartData,
  type DistributionData,
} from 'types/dashboard';
import { type SelectOption } from 'types/common';

export const mockKpiMetrics: KpiMetric[] = [
  {
    id: 'kpi-1',
    title: 'Total Revenue',
    value: '₹1,24,500',
    change: '+14.2%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'rupee',
    sparklineData: [40, 55, 62, 70, 68, 85, 92],
  },
  {
    id: 'kpi-2',
    title: 'Active Users',
    value: '18,420',
    change: '+8.7%',
    isPositive: true,
    period: 'vs last month',
    iconName: 'users',
    sparklineData: [120, 140, 135, 160, 175, 180, 195],
  },
  {
    id: 'kpi-3',
    title: 'Conversion Rate',
    value: '3.64%',
    change: '-1.2%',
    isPositive: false,
    period: 'vs last week',
    iconName: 'chart',
    sparklineData: [4.2, 4.0, 3.8, 3.9, 3.7, 3.5, 3.64],
  },
  {
    id: 'kpi-4',
    title: 'System Uptime',
    value: '99.98%',
    change: '+0.02%',
    isPositive: true,
    period: 'last 30 days',
    iconName: 'activity',
    sparklineData: [99.9, 99.92, 99.95, 99.96, 99.98, 99.97, 99.98],
  },
];

export const mockUsers: UserMember[] = [
  {
    id: 'USR-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'Administrator',
    status: 'Active',
    department: 'Engineering',
    joinedDate: '2025-01-15',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'USR-002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'Product Lead',
    status: 'Active',
    department: 'Product',
    joinedDate: '2025-02-01',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'USR-003',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    role: 'UI/UX Designer',
    status: 'Pending',
    department: 'Design',
    joinedDate: '2025-03-10',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'USR-004',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    role: 'Backend Developer',
    status: 'Active',
    department: 'Engineering',
    joinedDate: '2025-03-22',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'USR-005',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    role: 'DevOps Engineer',
    status: 'Inactive',
    department: 'Operations',
    joinedDate: '2024-11-05',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const mockRevenueData: RevenueChartData[] = [
  { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
  { month: 'Mar', revenue: 61000, expenses: 34000, profit: 27000 },
  { month: 'Apr', revenue: 68000, expenses: 37000, profit: 31000 },
  { month: 'May', revenue: 84000, expenses: 41000, profit: 43000 },
  { month: 'Jun', revenue: 95000, expenses: 46000, profit: 49000 },
  { month: 'Jul', revenue: 124500, expenses: 52000, profit: 72500 },
];

export const mockDistributionData: DistributionData[] = [
  { name: 'Engineering', value: 42, color: '#6366f1' },
  { name: 'Product & Design', value: 25, color: '#ec4899' },
  { name: 'Marketing', value: 18, color: '#10b981' },
  { name: 'Operations', value: 15, color: '#f59e0b' },
];

export const mockDepartmentOptions: SelectOption[] = [
  { label: 'All Departments', value: 'ALL' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Product', value: 'Product' },
  { label: 'Design', value: 'Design' },
  { label: 'Operations', value: 'Operations' },
];

export const mockRoleOptions: SelectOption[] = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Product Lead', value: 'Product Lead' },
  { label: 'UI/UX Designer', value: 'UI/UX Designer' },
  { label: 'Backend Developer', value: 'Backend Developer' },
  { label: 'DevOps Engineer', value: 'DevOps Engineer' },
];
