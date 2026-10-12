import {
  mockKpiMetrics,
  mockUsers,
  mockRevenueData,
  mockDistributionData,
  mockDepartmentOptions,
  mockRoleOptions,
} from './mockData';
import {
  type KpiMetric,
  type UserMember,
  type RevenueChartData,
  type DistributionData,
} from 'types/dashboard';
import { type SelectOption } from 'types/common';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  async getKpiMetrics(): Promise<KpiMetric[]> {
    await delay(350);
    return [...mockKpiMetrics];
  },

  async getUsers(department?: string, search?: string): Promise<UserMember[]> {
    await delay(450);
    let result = [...mockUsers];

    if (department && department !== 'ALL') {
      result = result.filter(u => u.department === department);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }

    return result;
  },

  async getRevenueChartData(): Promise<RevenueChartData[]> {
    await delay(300);
    return [...mockRevenueData];
  },

  async getDistributionData(): Promise<DistributionData[]> {
    await delay(300);
    return [...mockDistributionData];
  },

  async getDepartmentOptions(): Promise<SelectOption[]> {
    return [...mockDepartmentOptions];
  },

  async getRoleOptions(): Promise<SelectOption[]> {
    return [...mockRoleOptions];
  },
};
