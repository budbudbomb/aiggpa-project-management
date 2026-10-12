export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  iconName: 'rupee' | 'dollar' | 'users' | 'chart' | 'activity';
  sparklineData: number[];
}

export interface UserMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  department: string;
  joinedDate: string;
  avatar: string;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DistributionData {
  name: string;
  value: number;
  color: string;
}
