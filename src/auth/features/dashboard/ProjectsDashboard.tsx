import React, { useState, useMemo } from 'react';
import { Page } from 'shared/components/panels';
import { DropDownList, TextBox } from 'shared/components/forms';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/components/buttons';
import { useAuthStore } from 'auth/store/authStore';
import { useThemeStore, PRIMARY_COLORS } from 'auth/store/themeStore';
import {
  initialCenterData,
  initialSchemeData,
  initialVoucherData,
  type ProjectSubHeadItem,
  type VoucherItem,
} from './dashboardData';
import {
  GanttChart,
  FunnelChart,
  DumbbellChart,
  HeadWiseBudgetChart,
} from './CustomCharts';
import projectStore from '../../../stores/projectStore';
import { MasterStore } from '../../../stores/masterStore';
import {
  FolderKanban,
  FolderPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  Percent,
  Calendar,
  Search,
  IndianRupee,
  Milestone,
  Info,
  RefreshCw,
  Filter,
  TrendingUp,
  ArrowLeft,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const schemes = initialSchemeData;
  const vouchers = initialVoucherData;
  const { primaryColor } = useThemeStore();

  const storedProjects = useMemo(() => {
    try {
      return projectStore.getProjects();
    } catch {
      return [];
    }
  }, []);

  // Active theme configuration
  const activeColor = useMemo(() => {
    return PRIMARY_COLORS.find(c => c.id === primaryColor) || PRIMARY_COLORS[0];
  }, [primaryColor]);

  // Filters State
  const [financialYear] = useState('fy-25-26');
  const [selectedScheme, setSelectedScheme] = useState('All');
  const [selectedCenter, setSelectedCenter] = useState(
    user?.role === 'Centre Head' ? 'cat-1' : 'All'
  );
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [projectSearch, setProjectSearch] = useState('');

  // Active View State ('All' = Portfolio, or project ID for Single-Project View)
  const [selectedProject, setSelectedProject] = useState('All');

  // KPI expansion state
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  const toggleKpi = (kpiId: string) => {
    setActiveKpi(prev => (prev === kpiId ? null : kpiId));
  };

  // Drilldown states inside Single-Project View
  const [projectDrilldown, setProjectDrilldown] = useState<{
    headId: string;
    headName: string;
    subHeadId?: string;
    subHeadName?: string;
  } | null>(null);

  // Vouchers detailed view for chart point clicks
  const [selectedChartPeriod, setSelectedChartPeriod] = useState<string | null>(
    null
  );

  // Rich set of projects combining real proposals with realistic mock portfolio entries
  const allProjects = useMemo(() => {
    const mockList = [
      {
        id: 'prop-1',
        proposalNumber: 'PRJ-PROP-2025-001',
        projectName:
          'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
        categoryId: 'cat-1',
        categoryName: 'Centre for Economy, Trade & Innovation (CETI)',
        schemeId: 'sch-1',
        schemeName:
          'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Approved',
        durationValue: 12,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-03-25',
        overheadsPercentage: 15,
        subTotal: 4500000,
        overheadsAmount: 675000,
        totalCost: 5175000,
        spent: 2400000,
        startMonthOffset: 0,
        heads: [
          {
            id: 'head-1',
            headNumber: 1,
            particulars: 'Human Resources (HR & Research Personnel)',
            type: 'Detailed' as const,
            subItems: [
              {
                id: 'sub-1-1',
                particulars: 'Lead Policy Fellow',
                units: 1,
                timePeriod: 12,
                timePeriodUnit: 'Months' as const,
                costPerUnit: 125000,
                estimatedCost: 1500000,
                spent: 750000,
              },
              {
                id: 'sub-1-2',
                particulars: 'Senior Research Associate (RA)',
                units: 2,
                timePeriod: 12,
                timePeriodUnit: 'Months' as const,
                costPerUnit: 65000,
                estimatedCost: 1560000,
                spent: 780000,
              },
            ],
            headTotal: 3060000,
            spent: 1530000,
          },
          {
            id: 'head-2',
            headNumber: 2,
            particulars: 'Travel Allowances & Field Mobility',
            type: 'Detailed' as const,
            subItems: [
              {
                id: 'sub-2-1',
                particulars: 'District Consultation & Stakeholder Travel',
                units: 4,
                timePeriod: 6,
                timePeriodUnit: 'Trips' as const,
                costPerUnit: 25000,
                estimatedCost: 600000,
                spent: 450000,
              },
            ],
            headTotal: 600000,
            spent: 450000,
          },
        ],
      },
      {
        id: 'prop-2',
        proposalNumber: 'PRJ-PROP-2025-002',
        projectName:
          'Urban Solid Waste & Sustainable Sanitation Roadmap for MP Municipalities',
        categoryId: 'cat-2',
        categoryName: 'Centre for Urban Governance (CUG)',
        schemeId: 'sch-2',
        schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Draft',
        durationValue: 6,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-04-02',
        overheadsPercentage: 15,
        subTotal: 1110000,
        overheadsAmount: 166500,
        totalCost: 1276500,
        spent: 0,
        startMonthOffset: 1,
        heads: [],
      },
      {
        id: 'mock-3',
        proposalNumber: 'PRJ-PROP-2025-003',
        projectName:
          'Direct Beneficiary Transfer (DBT) Leakage Audit & Policy Options',
        categoryId: 'cat-1',
        categoryName: 'Centre for Economy, Trade & Innovation (CETI)',
        schemeId: 'sch-1',
        schemeName:
          'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Approved',
        durationValue: 9,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-05-10',
        overheadsPercentage: 15,
        subTotal: 3000000,
        overheadsAmount: 450000,
        totalCost: 3450000,
        spent: 1800000,
        startMonthOffset: 2,
        heads: [
          {
            id: 'head-301',
            headNumber: 1,
            particulars: 'Human Resources',
            type: 'Detailed' as const,
            subItems: [
              {
                id: 'sub-301-1',
                particulars: 'Technical Consultant',
                units: 1,
                timePeriod: 9,
                timePeriodUnit: 'Months' as const,
                costPerUnit: 100000,
                estimatedCost: 900000,
                spent: 450000,
              },
            ],
            headTotal: 900000,
            spent: 450000,
          },
        ],
      },
      {
        id: 'mock-4',
        proposalNumber: 'PRJ-PROP-2025-004',
        projectName: 'AIGGPA Nutrition Tracker in Tribal Districts',
        categoryId: 'cat-4',
        categoryName: 'Centre for Health & Nutrition (CHN)',
        schemeId: 'sch-2',
        schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Approved',
        durationValue: 8,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-04-15',
        overheadsPercentage: 10,
        subTotal: 4000000,
        overheadsAmount: 400000,
        totalCost: 4400000,
        spent: 4800000,
        startMonthOffset: 0,
        heads: [
          {
            id: 'head-401',
            headNumber: 1,
            particulars: 'Field Enumerators',
            type: 'Detailed' as const,
            subItems: [
              {
                id: 'sub-401-1',
                particulars: 'Survey Honorarium',
                units: 10,
                timePeriod: 8,
                timePeriodUnit: 'Months' as const,
                costPerUnit: 25000,
                estimatedCost: 2000000,
                spent: 2300000,
              },
            ],
            headTotal: 2000000,
            spent: 2300000,
          },
          {
            id: 'head-402',
            headNumber: 2,
            particulars: 'Stay Arrangements',
            type: 'Lump Sum' as const,
            subItems: [],
            headTotal: 1000000,
            spent: 1300000,
          },
        ],
      },
      {
        id: 'mock-5',
        proposalNumber: 'PRJ-PROP-2025-005',
        projectName: 'CMYIP Fellowship Impact Assessment Study',
        categoryId: 'cat-5',
        categoryName: 'Centre for Social Sector Development (CSSD)',
        schemeId: 'sch-1',
        schemeName:
          'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Closed',
        durationValue: 6,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-03-12',
        overheadsPercentage: 15,
        subTotal: 2000000,
        overheadsAmount: 300000,
        totalCost: 2300000,
        spent: 2250000,
        startMonthOffset: 1,
        heads: [],
      },
      {
        id: 'mock-6',
        proposalNumber: 'PRJ-PROP-2025-006',
        projectName: 'Smart City Transport Optimization Model',
        categoryId: 'cat-2',
        categoryName: 'Centre for Urban Governance (CUG)',
        schemeId: 'sch-2',
        schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
        financialYearId: 'fy-25-26',
        financialYear: 'FY 2025-2026',
        status: 'Approved',
        durationValue: 12,
        durationUnit: 'Months' as const,
        dateOfPrc: '2025-06-01',
        overheadsPercentage: 12,
        subTotal: 5000000,
        overheadsAmount: 600000,
        totalCost: 5600000,
        spent: 3100000,
        startMonthOffset: 3,
        heads: [],
      },
    ];

    const masterCenters = MasterStore.getCenters();
    const masterSchemes = MasterStore.getSchemes();

    const mappedMock = mockList.map(item => {
      const real = storedProjects.find(
        p =>
          p.id === item.id || p.code === item.id || p.name === item.projectName
      );
      if (real) {
        return {
          ...item,
          projectName: real.name || item.projectName,
          status: real.status || item.status,
          totalCost: real.budgetSanctioned || item.totalCost,
          spent: real.budgetUtilized || item.spent,
          durationValue: real.durationMonths || item.durationValue,
          dateOfPrc: real.prcDate || item.dateOfPrc,
          categoryId: real.department
            ? masterCenters.find(c => c.name === real.department)?.id ||
              item.categoryId
            : item.categoryId,
          schemeId: real.scheme
            ? masterSchemes.find(s => s.name === real.scheme)?.id ||
              item.schemeId
            : item.schemeId,
        };
      }
      return item;
    });

    // Also include any user-created stored projects!
    const extraReal = storedProjects
      .filter(
        p =>
          !mappedMock.some(
            m =>
              m.id === p.id ||
              m.proposalNumber === p.id ||
              m.proposalNumber === p.code ||
              m.projectName === p.name
          )
      )
      .map(p => {
        const centerMatch = masterCenters.find(
          c => c.name === p.department || c.code === p.department
        );
        const schemeMatch = masterSchemes.find(
          s => s.name === p.scheme || s.code === p.scheme
        );
        return {
          id: p.id,
          proposalNumber: p.code || p.id,
          projectName: p.name,
          categoryId: centerMatch?.id || 'cat-1',
          categoryName:
            p.department || 'Centre for Policy Planning and Governance (CPPG)',
          schemeId: schemeMatch?.id || 'sch-1',
          schemeName: p.scheme || 'Atal Bihari Vajpayee Institute of GG',
          financialYearId: 'fy-25-26',
          financialYear: p.financialYear || 'FY 2025-2026',
          status: p.status || 'Approved',
          durationValue: p.durationMonths || 12,
          durationUnit: 'Months' as const,
          dateOfPrc: p.prcDate || '2026-04-01',
          overheadsPercentage: 15,
          subTotal: (p.budgetSanctioned || 500000) * 0.85,
          overheadsAmount: (p.budgetSanctioned || 500000) * 0.15,
          totalCost: p.budgetSanctioned || 500000,
          spent: p.budgetUtilized || 0,
          startMonthOffset: 0,
          heads: (p.budgetHeads || []).map((h, i) => ({
            id: h.id || `head-${i}`,
            headNumber: i + 1,
            particulars: h.name,
            type: (h.mode === 'lumpSum' ? 'Lump Sum' : 'Detailed') as
              'Lump Sum' | 'Detailed',
            subItems: (h.subItems || []).map(s => ({
              id: s.id,
              particulars: s.particular,
              units: parseFloat(String(s.units)) || 1,
              timePeriod: parseFloat(String(s.period)) || 1,
              timePeriodUnit: (s.unitType || 'Months') as string,
              costPerUnit: parseFloat(String(s.costPerUnit)) || 0,
              estimatedCost: parseFloat(String(s.total)) || 0,
              spent: 0,
            })),
            headTotal: h.headTotal || 0,
            spent: 0,
          })),
        };
      });

    return [...mappedMock, ...extraReal];
  }, [storedProjects]);

  // Search filter
  const searchedProjectsList = useMemo(() => {
    return allProjects.filter(p => {
      if (projectSearch.trim() === '') return true;
      return (
        p.projectName.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.proposalNumber.toLowerCase().includes(projectSearch.toLowerCase())
      );
    });
  }, [allProjects, projectSearch]);

  // Filters calculation
  const filteredProjects = useMemo(() => {
    return searchedProjectsList.filter(p => {
      if (financialYear !== 'All' && p.financialYearId !== financialYear)
        return false;
      if (selectedScheme !== 'All' && p.schemeId !== selectedScheme)
        return false;
      if (selectedCenter !== 'All' && p.categoryId !== selectedCenter)
        return false;
      if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
      return true;
    });
  }, [
    searchedProjectsList,
    financialYear,
    selectedScheme,
    selectedCenter,
    selectedStatus,
  ]);

  // Project details for Single Project View
  const activeProjectDetails = useMemo(() => {
    if (selectedProject === 'All') return null;
    return allProjects.find(p => p.id === selectedProject) || null;
  }, [allProjects, selectedProject]);

  // Vouchers mapped to active project (match by scheme)
  const projectTransactions = useMemo(() => {
    if (!activeProjectDetails) return [];
    return vouchers.filter(v => v.schemeId === activeProjectDetails.schemeId);
  }, [vouchers, activeProjectDetails]);

  // -------------------------------------------------------------
  // EXECUTIVE KPI STATS (PORTFOLIO)
  // -------------------------------------------------------------
  const portfolioStats = useMemo(() => {
    const totalCount = filteredProjects.length;
    const completeCount = filteredProjects.filter(
      p => p.status === 'Closed'
    ).length;
    const activeCount = filteredProjects.filter(
      p => p.status === 'Approved'
    ).length;

    const approvedBudgetSum = filteredProjects.reduce(
      (sum, p) => sum + p.totalCost,
      0
    );
    const spentBudgetSum = filteredProjects.reduce(
      (sum, p) => sum + p.spent,
      0
    );
    const remainingSum = Math.max(0, approvedBudgetSum - spentBudgetSum);

    const overBudgetList = filteredProjects.filter(p => p.spent > p.totalCost);

    const avgRate =
      totalCount > 0
        ? Math.round((spentBudgetSum / approvedBudgetSum) * 100)
        : 0;

    const overheadsSum = filteredProjects.reduce(
      (sum, p) => sum + (p.overheadsAmount || 0),
      0
    );

    return {
      totalCount,
      completeCount,
      activeCount,
      approvedBudgetSum,
      spentBudgetSum,
      remainingSum,
      overBudgetList,
      avgRate,
      overheadsSum,
    };
  }, [filteredProjects]);

  // -------------------------------------------------------------
  // PORTFOLIO CHARTS FORMATTING
  // -------------------------------------------------------------

  // 1. Budget vs. Actual by Project (Horizontal Bar)
  const budgetVsActualData = useMemo(() => {
    return filteredProjects
      .map(p => ({
        id: p.id,
        name: p.projectName,
        approved: p.totalCost,
        utilized: p.spent,
        Budget: p.totalCost,
        Spent: p.spent,
        variance: p.totalCost - p.spent,
      }))
      .sort((a, b) => a.variance - b.variance);
  }, [filteredProjects]);

  // 2. Projects by Approval Status (Funnel)
  const approvalFunnelData = useMemo(() => {
    const draft = filteredProjects.filter(p => p.status === 'Draft').length;
    const submitted = filteredProjects.filter(
      p => p.status === 'Submitted'
    ).length;
    const active = filteredProjects.filter(p => p.status === 'Approved').length;
    const closed = filteredProjects.filter(p => p.status === 'Closed').length;

    return [
      {
        stage: 'Drafts Created',
        count: draft + submitted + active + closed,
        amount:
          approvedBudgetSumForStatus('Draft') +
          approvedBudgetSumForStatus('Submitted') +
          approvedBudgetSumForStatus('Approved') +
          approvedBudgetSumForStatus('Closed'),
        percentage: 100,
      },
      {
        stage: 'Submitted for PRC',
        count: submitted + active + closed,
        amount:
          approvedBudgetSumForStatus('Submitted') +
          approvedBudgetSumForStatus('Approved') +
          approvedBudgetSumForStatus('Closed'),
        percentage: 80,
      },
      {
        stage: 'PRC Approved / Active',
        count: active + closed,
        amount:
          approvedBudgetSumForStatus('Approved') +
          approvedBudgetSumForStatus('Closed'),
        percentage: 60,
      },
      {
        stage: 'Completed & Closed',
        count: closed,
        amount: approvedBudgetSumForStatus('Closed'),
        percentage: 20,
      },
    ];

    function approvedBudgetSumForStatus(statusName: string) {
      return filteredProjects
        .filter(p => p.status === statusName)
        .reduce((sum, p) => sum + p.totalCost, 0);
    }
  }, [filteredProjects]);

  const projectOptions = useMemo(() => {
    return [
      { label: 'All Projects (Portfolio View)', value: 'All' },
      ...allProjects.map(p => ({
        label: `${p.proposalNumber} - ${p.projectName}`,
        value: p.id,
      })),
    ];
  }, [allProjects]);

  const schemeOptions = useMemo(() => {
    const masterSchemes = MasterStore.getSchemes();
    const list = masterSchemes.length > 0 ? masterSchemes : schemes;
    return [
      { label: 'All Schemes (Institutional)', value: 'All' },
      ...list.map(
        (s: {
          name?: string;
          code?: string;
          schemeName?: string;
          id?: string;
        }) => ({
          label: s.name
            ? `${s.code || ''} - ${s.name}`
            : s.schemeName
              ? `${s.code} - ${s.schemeName}`
              : s.code || '',
          value: s.id || s.code || '',
        })
      ),
    ];
  }, [schemes]);

  const centerOptions = useMemo(() => {
    const masterCenters = MasterStore.getCenters();
    const list = masterCenters.length > 0 ? masterCenters : initialCenterData;
    return [
      { label: 'All Centers (Institutional)', value: 'All' },
      ...list.map((c: { name: string; code?: string; id?: string }) => ({
        label: `${c.code || ''} - ${c.name}`,
        value: c.id || c.code || '',
      })),
    ];
  }, []);
  const centerProjectsData = useMemo(() => {
    return initialCenterData.map(c => {
      const projects = filteredProjects.filter(p => p.categoryId === c.id);
      const complete = projects.filter(p => p.status === 'Closed').length;
      const inProgress = projects.filter(p => p.status === 'Approved').length;
      const toBeStarted = projects.filter(
        p => p.status === 'Draft' || p.status === 'Submitted'
      ).length;

      return {
        name: c.code,
        fullName: c.name,
        id: c.id,
        'To Be Started': toBeStarted,
        'In Progress': inProgress,
        Completed: complete,
        total: toBeStarted + inProgress + complete,
      };
    });
  }, [filteredProjects]);

  // 4. Gantt project list
  const ganttProjects = useMemo(() => {
    return filteredProjects.map(p => ({
      id: p.id,
      name: p.projectName,
      center: p.categoryName || 'Research Center',
      durationValue: p.durationValue || 6,
      durationUnit: p.durationUnit || 'Months',
      dateOfPrc: p.dateOfPrc,
      approvedCost: p.totalCost,
      startMonthOffset: p.startMonthOffset,
    }));
  }, [filteredProjects]);

  // 5. Portfolio Utilization Trend (Area Chart)
  const utilizationTrendData = [
    {
      month: 'Apr',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum * 0.15,
    },
    {
      month: 'May',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum * 0.35,
    },
    {
      month: 'Jun',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum * 0.55,
    },
    {
      month: 'Jul',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum * 0.75,
    },
    {
      month: 'Aug',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum * 0.9,
    },
    {
      month: 'Sep',
      Budget: portfolioStats.approvedBudgetSum,
      Spend: portfolioStats.spentBudgetSum,
    },
  ];

  // -------------------------------------------------------------
  // SINGLE-PROJECT VIEW CALCULATIONS
  // -------------------------------------------------------------
  const projectHeadWiseData = useMemo(() => {
    if (!activeProjectDetails || !activeProjectDetails.heads) return [];
    return activeProjectDetails.heads.map(h => ({
      id: h.id,
      particulars: h.particulars,
      Budget: h.headTotal,
      Spent: h.spent || h.headTotal * 0.45,
    }));
  }, [activeProjectDetails]);

  const singleProjectStats = useMemo(() => {
    if (!activeProjectDetails) return null;
    const budget = activeProjectDetails.totalCost;
    const spent = activeProjectDetails.spent || 0;
    const remaining = Math.max(0, budget - spent);
    const rate = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    const overBudgetHeads = (activeProjectDetails.heads || [])
      .filter(h => (h.spent || 0) > h.headTotal)
      .map(h => ({
        particulars: h.particulars,
        overAmount: (h.spent || 0) - h.headTotal,
      }));

    return {
      budget,
      spent,
      remaining,
      rate,
      overBudgetHeads,
    };
  }, [activeProjectDetails]);

  const singleProjectDonutData = useMemo(() => {
    if (!activeProjectDetails) return [];
    const directCost = activeProjectDetails.subTotal || 0;
    const overheads = activeProjectDetails.overheadsAmount || 0;
    return [
      {
        name: 'Direct Project Costs',
        value: directCost,
        color: activeColor.hex,
      },
      { name: 'Institutional Overheads', value: overheads, color: '#f59e0b' },
    ];
  }, [activeProjectDetails, activeColor]);

  const singleProjectBurnUpData = useMemo(() => {
    if (!activeProjectDetails) return [];
    const budget = activeProjectDetails.totalCost;
    const spent = activeProjectDetails.spent || 0;
    return [
      { month: 'Month 1', Budget: budget, Spend: spent * 0.1 },
      { month: 'Month 2', Budget: budget, Spend: spent * 0.25 },
      { month: 'Month 3', Budget: budget, Spend: spent * 0.5 },
      { month: 'Month 4', Budget: budget, Spend: spent * 0.7 },
      { month: 'Month 5', Budget: budget, Spend: spent * 0.9 },
      { month: 'Month 6', Budget: budget, Spend: spent },
    ];
  }, [activeProjectDetails]);

  // Handle head click in Single Project View
  const handleHeadClick = (headData: {
    particulars?: string;
    name?: string;
  }) => {
    if (!activeProjectDetails || !headData) return;
    const particulars = headData.particulars || headData.name;
    const match = activeProjectDetails.heads.find(
      h => h.particulars === particulars
    );
    if (match) {
      setProjectDrilldown({
        headId: match.id,
        headName: match.particulars,
      });
    }
  };

  const handleSubHeadClick = (subHead: ProjectSubHeadItem) => {
    if (!projectDrilldown) return;
    setProjectDrilldown({
      ...projectDrilldown,
      subHeadId: subHead.id,
      subHeadName: subHead.particulars || subHead.name || '',
    });
  };

  // Breadcrumbs path calculation
  const breadcrumbs = useMemo(() => {
    const list: { label: string; onClick?: () => void }[] = [];

    if (activeProjectDetails) {
      list.push({
        label: activeProjectDetails.projectName,
        onClick: () => {
          setProjectDrilldown(null);
          setSelectedChartPeriod(null);
        },
      });
    }

    if (projectDrilldown) {
      list.push({
        label: `Head: ${projectDrilldown.headName}`,
        onClick: () =>
          setProjectDrilldown({
            headId: projectDrilldown.headId,
            headName: projectDrilldown.headName,
          }),
      });

      if (projectDrilldown.subHeadName) {
        list.push({
          label: `Sub-head: ${projectDrilldown.subHeadName}`,
          onClick: () => {},
        });
      }
    }

    if (selectedChartPeriod) {
      list.push({
        label: `Period: ${selectedChartPeriod}`,
        onClick: () => setSelectedChartPeriod(null),
      });
    }

    return list.length > 0 ? list : undefined;
  }, [activeProjectDetails, projectDrilldown, selectedChartPeriod]);

  // Filtered transactions for active project sub-head or period
  const activeDrilldownTransactions = useMemo(() => {
    if (!activeProjectDetails) return [];
    let list = [...projectTransactions];

    if (selectedChartPeriod) {
      return list.slice(0, 2);
    }

    if (projectDrilldown) {
      if (projectDrilldown.subHeadName) {
        list = list.filter(v =>
          v.entries?.some(e =>
            e.ledgerName
              .toLowerCase()
              .includes(projectDrilldown.subHeadName!.toLowerCase())
          )
        );
      } else {
        list = list.filter(v =>
          v.entries?.some(e =>
            e.ledgerName
              .toLowerCase()
              .includes(projectDrilldown.headName.toLowerCase())
          )
        );
      }
    }

    return list;
  }, [
    activeProjectDetails,
    projectTransactions,
    projectDrilldown,
    selectedChartPeriod,
  ]);

  return (
    <Page
      header={
        selectedProject === 'All'
          ? 'Projects Portfolio Control Board'
          : 'Single Project Audit Console'
      }
      subHeader={
        selectedProject === 'All'
          ? 'Cross-scheme portfolio analysis, approval funnels, and Gantt charts'
          : 'Real-time burn rates, detailed head-wise allocations, and voucher tracing'
      }
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={() => navigate('/create-project')}
          >
            Create New Project
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 w-full py-3 select-none">
        {/* Dynamic Filters Bar - Full Width 4-Column Layout */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col gap-3.5 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>Scope Filters</span>
            </div>

            {/* Clear Filters indicator */}
            {(selectedProject !== 'All' ||
              selectedScheme !== 'All' ||
              selectedCenter !== 'All' ||
              projectSearch !== '') && (
              <button
                onClick={() => {
                  setSelectedProject('All');
                  setSelectedScheme('All');
                  if (user?.role !== 'Centre Head') setSelectedCenter('All');
                  setProjectSearch('');
                  setProjectDrilldown(null);
                  setSelectedChartPeriod(null);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Search Project Name using shared TextBox */}
            <div className="w-full">
              <TextBox
                label="Search Project Name"
                placeholder="Search project..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                onClear={() => setProjectSearch('')}
                leftIcon={
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                }
              />
            </div>

            {/* Target Project */}
            <div className="w-full">
              <DropDownList
                label="Target Project"
                options={projectOptions}
                value={selectedProject}
                onChange={val => {
                  setSelectedProject(String(val || 'All'));
                  setProjectDrilldown(null);
                  setSelectedChartPeriod(null);
                }}
                filter={true}
                filterPlaceholder="Search Project..."
              />
            </div>

            {/* Government Scheme */}
            <div className="w-full">
              <DropDownList
                label="Government Scheme"
                options={schemeOptions}
                value={selectedScheme}
                onChange={val => setSelectedScheme(String(val || 'All'))}
                filter={true}
                filterPlaceholder="Search Scheme..."
              />
            </div>

            {/* AIGGPA Research Center */}
            <div className="w-full">
              <DropDownList
                label="AIGGPA Research Center"
                options={centerOptions}
                value={selectedCenter}
                disabled={user?.role === 'Centre Head'}
                onChange={val => setSelectedCenter(String(val || 'All'))}
                filter={user?.role !== 'Centre Head'}
                filterPlaceholder="Search Center..."
              />
            </div>
          </div>
        </div>

        {/* PORTFOLIO VIEW */}
        {selectedProject === 'All' ? (
          <>
            {/* PORTFOLIO KPI CARDS - Nexus SaaS Clean Enterprise Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* 1. Projects Count */}
              <div
                onClick={() => toggleKpi('projects')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'projects'
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02] dark:bg-primary/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Projects
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/15">
                    <FolderKanban className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    {portfolioStats.totalCount}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Scope-filtered
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'projects' ? 'rotate-180 text-primary' : ''}`}
                  />
                </div>
              </div>

              {/* 2. Complete */}
              <div
                onClick={() => toggleKpi('complete')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'complete'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Completed
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    {portfolioStats.completeCount}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Closed & audited
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'complete' ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </div>
              </div>

              {/* 3. In Progress */}
              <div
                onClick={() => toggleKpi('inprogress')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'inprogress'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-500/[0.02] dark:bg-amber-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    In Progress
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    {portfolioStats.activeCount}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    PRC Active
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'inprogress' ? 'rotate-180 text-amber-600' : ''}`}
                  />
                </div>
              </div>

              {/* 4. Total Approved Budget */}
              <div
                onClick={() => toggleKpi('budgetBreakdown')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'budgetBreakdown'
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02] dark:bg-primary/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Approved Budget
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                    <IndianRupee className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    ₹{(portfolioStats.approvedBudgetSum / 100000).toFixed(1)}L
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Rem: ₹{(portfolioStats.remainingSum / 100000).toFixed(1)}L
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'budgetBreakdown' ? 'rotate-180 text-primary' : ''}`}
                  />
                </div>
              </div>

              {/* 5. Projects Over Budget */}
              <div
                onClick={() => toggleKpi('overbudget')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'overbudget'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm bg-rose-500/[0.02] dark:bg-rose-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Over Budget
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    {portfolioStats.overBudgetList.length}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Cost overrun alert
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'overbudget' ? 'rotate-180 text-rose-600' : ''}`}
                  />
                </div>
              </div>

              {/* 6. Avg Utilization Rate */}
              <div
                onClick={() => toggleKpi('utilizationRate')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'utilizationRate'
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm bg-teal-500/[0.02] dark:bg-teal-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Avg Util %
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    {portfolioStats.avgRate}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Burn velocity
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'utilizationRate' ? 'rotate-180 text-teal-600' : ''}`}
                  />
                </div>
              </div>

              {/* 7. Overheads Accrued */}
              <div
                onClick={() => toggleKpi('overheads')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'overheads'
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02] dark:bg-primary/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Overheads
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                    <IndianRupee className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    ₹{(portfolioStats.overheadsSum / 100000).toFixed(1)}L
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Margin (10-15%)
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'overheads' ? 'rotate-180 text-primary' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* PORTFOLIO KPI ACCORDION DETAIL PANELS - rounded-2xl */}
            {activeKpi && (
              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-inner flex flex-col gap-4 animate-slideDown">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Detailed Break-up for Selected Metric
                  </h4>
                  <button
                    onClick={() => setActiveKpi(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back / Close Details</span>
                  </button>
                </div>

                {activeKpi === 'projects' && (
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                          <th className="p-3.5">Proposal No</th>
                          <th className="p-3.5">Project Name</th>
                          <th className="p-3.5">Research Block</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Cost Outlay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredProjects.map(item => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                          >
                            <td className="p-3.5 font-bold font-mono text-slate-950 dark:text-white">
                              {item.proposalNumber}
                            </td>
                            <td
                              className="p-3.5 font-bold text-slate-800 dark:text-slate-200 hover:text-primary cursor-pointer"
                              onClick={() => setSelectedProject(item.id)}
                            >
                              {item.projectName}
                            </td>
                            <td className="p-3.5 text-slate-500 dark:text-slate-400">
                              {item.categoryName}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black ${
                                  item.status === 'Closed'
                                    ? 'bg-slate-105 text-slate-600'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono text-slate-950 dark:text-white">
                              ₹{item.totalCost.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeKpi === 'complete' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects
                      .filter(p => p.status === 'Closed')
                      .map(p => (
                        <div
                          key={p.id}
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="text-[10px] font-black uppercase text-slate-400 font-mono">
                              {p.proposalNumber}
                            </div>
                            <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                              {p.projectName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {p.categoryName}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-[10px]">
                            CLOSED
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {activeKpi === 'inprogress' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects
                      .filter(p => p.status === 'Approved')
                      .map(p => (
                        <div
                          key={p.id}
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="text-[10px] font-black uppercase text-slate-400 font-mono">
                              {p.proposalNumber}
                            </div>
                            <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                              {p.projectName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              PRC Date: {p.dateOfPrc}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                            ACTIVE
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {activeKpi === 'budgetBreakdown' && (
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                          <th className="p-3.5">Project Title</th>
                          <th className="p-3.5 text-right">
                            Sanctioned Outlay
                          </th>
                          <th className="p-3.5 text-right">Utilized Cost</th>
                          <th className="p-3.5 text-right">
                            Remaining Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredProjects.map(item => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                          >
                            <td
                              className="p-3.5 font-bold text-slate-800 dark:text-slate-200 hover:text-primary cursor-pointer"
                              onClick={() => setSelectedProject(item.id)}
                            >
                              {item.projectName}
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono text-slate-950 dark:text-white">
                              ₹{item.totalCost.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono text-emerald-600">
                              ₹{(item.spent || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono text-primary">
                              ₹
                              {Math.max(
                                0,
                                item.totalCost - (item.spent || 0)
                              ).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeKpi === 'overbudget' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded p-3 flex flex-col gap-2.5">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-455 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        The following projects have exceeded their sanctioned
                        budget outlays:
                      </span>
                    </div>
                    {portfolioStats.overBudgetList.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex justify-between items-center text-xs font-bold font-mono"
                      >
                        <span className="text-slate-850 dark:text-slate-205">
                          {p.projectName}
                        </span>
                        <span className="text-rose-600 shrink-0">
                          Exceeded by ₹
                          {(p.spent - p.totalCost).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeKpi === 'utilizationRate' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProjects.map(p => {
                      const rate =
                        p.totalCost > 0
                          ? Math.round((p.spent / p.totalCost) * 100)
                          : 0;
                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                        >
                          <span className="text-[10px] font-black uppercase text-slate-400 block truncate">
                            {p.projectName}
                          </span>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="font-extrabold font-mono text-slate-800 dark:text-slate-200">
                              {rate}% Burn
                            </span>
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${rate > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, rate)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeKpi === 'overheads' && (
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                          <th className="p-3.5">Project</th>
                          <th className="p-3.5 text-right">
                            Sanctioned Outlay
                          </th>
                          <th className="p-3.5 text-right">Overheads Margin</th>
                          <th className="p-3.5 text-right">Overheads Sum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredProjects.map(item => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                          >
                            <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                              {item.projectName}
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              ₹{item.totalCost.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono">
                              {item.overheadsPercentage}%
                            </td>
                            <td className="p-3.5 text-right font-bold font-mono text-primary">
                              ₹
                              {(item.overheadsAmount || 0).toLocaleString(
                                'en-IN'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PORTFOLIO CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budget vs Actual by Project (Dumbbell/Range Chart) */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col min-h-95">
                <DumbbellChart
                  data={budgetVsActualData}
                  onRowClick={id => setSelectedProject(id)}
                />
              </div>

              {/* Lifecycle Funnel */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        PRC Project Lifecycle
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Funnel: Conversion from Draft Proposal to Project
                        Closure. Click stage to view projects.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 mt-4">
                  <FunnelChart
                    stages={approvalFunnelData}
                    onStageClick={stageName => {
                      let status = 'Approved';
                      if (stageName.includes('Draft')) status = 'Draft';
                      else if (stageName.includes('Submitted'))
                        status = 'Submitted';
                      else if (stageName.includes('Completed'))
                        status = 'Closed';
                      setSelectedStatus(status);
                    }}
                  />
                </div>
              </div>

              {/* Center-wise Project Status (Stacked Vertical Bar) */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Center-wise Project Status
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Active, in-progress, and to-be-started projects grouped
                        by centre. Click a bar to filter.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-55 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={centerProjectsData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      onClick={e => {
                        if (
                          e &&
                          e.activePayload &&
                          e.activePayload.length > 0
                        ) {
                          setSelectedCenter(e.activePayload[0].payload.id);
                        }
                      }}
                    >
                      <CartesianGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        className="dark:stroke-slate-800/80"
                        opacity={0.75}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          fill: '#94a3b8',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="p-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs min-w-52.5 animate-in fade-in zoom-in-95 duration-150">
                                <div className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
                                  {d.fullName || label}
                                </div>
                                <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-sans font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                                      To Be Started:
                                    </span>
                                    <span className="font-bold text-slate-950 dark:text-white">
                                      {d['To Be Started']}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-sans font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                      In Progress:
                                    </span>
                                    <span className="font-bold text-slate-950 dark:text-white">
                                      {d['In Progress']}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-sans font-semibold">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      Completed:
                                    </span>
                                    <span className="font-bold text-slate-950 dark:text-white">
                                      {d['Completed']}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={32}
                        wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                      />
                      <Bar
                        dataKey="To Be Started"
                        stackId="centerStatusStack"
                        fill="#cbd5e1"
                        barSize={24}
                        cursor="pointer"
                      />
                      <Bar
                        dataKey="In Progress"
                        stackId="centerStatusStack"
                        fill={activeColor.hex}
                        barSize={24}
                        cursor="pointer"
                      />
                      <Bar
                        dataKey="Completed"
                        stackId="centerStatusStack"
                        fill="#10b981"
                        barSize={24}
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Portfolio Utilization Trend (Area) */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Cumulative Outlay Burn Rate
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Area: Cumulative spend burn-up against total sanctioned
                        budget.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-57.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={utilizationTrendData}
                      margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSpend"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={activeColor.hex}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor={activeColor.hex}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        className="dark:stroke-slate-800/80"
                        opacity={0.75}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                        axisLine={false}
                        domain={[
                          0,
                          (dataMax: number) => Math.ceil(dataMax * 1.15),
                        ]}
                        tickFormatter={(val: number) => {
                          if (val >= 10000000)
                            return `₹${(val / 10000000).toFixed(1)}Cr`;
                          if (val >= 100000)
                            return `₹${(val / 100000).toFixed(0)}L`;
                          if (val === 0) return '₹0';
                          return `₹${val.toLocaleString('en-IN')}`;
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="px-3.5 py-2.5 bg-slate-900/95 dark:bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs flex flex-col gap-1.5 min-w-48">
                                <div className="font-extrabold text-slate-300 border-b border-slate-700/80 pb-1">
                                  {label}
                                </div>
                                {payload.map((entry, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-3 text-[11px] font-mono"
                                  >
                                    <span className="flex items-center gap-1.5 text-slate-300 font-sans font-semibold">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      {entry.name}:
                                    </span>
                                    <span className="font-black text-white">
                                      ₹
                                      {Number(entry.value).toLocaleString(
                                        'en-IN'
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={30}
                        wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Spend"
                        name="Cumulative Spent"
                        stroke={activeColor.hex}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSpend)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Budget"
                        name="Sanctioned Limit"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                        fill="none"
                        dot={{
                          r: 3,
                          fill: '#f59e0b',
                          strokeWidth: 1.5,
                          stroke: '#fff',
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gantt Timeline Lanes */}
              <div className="lg:col-span-3 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                      <Milestone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Project Gantt Schedule Timelines
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Gantt lanes reflecting project schedule and PRC Date
                        markers. Click a bar to view Single-Project.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <GanttChart
                    projects={ganttProjects}
                    onProjectClick={id => setSelectedProject(id)}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* -------------------------------------------------------------
              SINGLE-PROJECT AUDIT VIEW
              ------------------------------------------------------------- */
          <>
            {/* Project Details Banner - Executive Light Theme */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100 dark:border-indigo-900/50">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 font-mono">
                      Project code: {activeProjectDetails?.proposalNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                      Status: {activeProjectDetails?.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 leading-snug">
                    {activeProjectDetails?.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Research Wing:{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {activeProjectDetails?.categoryName}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProject('All');
                  setProjectDrilldown(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold tracking-tight cursor-pointer flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-2xs transition shrink-0 self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Portfolio</span>
              </button>
            </div>

            {/* SINGLE PROJECT KPI GRID - Nexus SaaS Clean Enterprise Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Cost break-up */}
              <div
                onClick={() => toggleKpi('sp-budget')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'sp-budget'
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02] dark:bg-primary/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sanctioned Outlay
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/15">
                    <IndianRupee className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight tabular-nums">
                    ₹{singleProjectStats?.budget.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-normal truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span>
                      Spent: ₹
                      {singleProjectStats?.spent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'sp-budget' ? 'rotate-180 text-primary' : ''}`}
                  />
                </div>
              </div>

              {/* 2. % Utilized */}
              <div
                onClick={() => toggleKpi('sp-utilization')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'sp-utilization'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    % Utilized
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
                      {singleProjectStats?.rate}%
                    </div>
                    <span
                      className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full uppercase border ${
                        (singleProjectStats?.rate || 0) > 100
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                      }`}
                    >
                      {(singleProjectStats?.rate || 0) > 100
                        ? 'Over'
                        : 'Normal'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (singleProjectStats?.rate || 0) > 100
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, singleProjectStats?.rate || 0)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'sp-utilization' ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </div>
              </div>

              {/* 3. Heads Over Limit */}
              <div
                onClick={() => toggleKpi('sp-overbudget')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'sp-overbudget'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm bg-rose-500/[0.02] dark:bg-rose-500/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Heads Over Limit
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
                      {singleProjectStats?.overBudgetHeads.length}
                    </div>
                    <span
                      className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full uppercase border ${
                        (singleProjectStats?.overBudgetHeads.length || 0) > 0
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                      }`}
                    >
                      {(singleProjectStats?.overBudgetHeads.length || 0) > 0
                        ? 'Attention'
                        : 'Clean'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    Cost center variances
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'sp-overbudget' ? 'rotate-180 text-rose-600' : ''}`}
                  />
                </div>
              </div>

              {/* 4. Duration & PRC */}
              <div
                onClick={() => toggleKpi('sp-prc')}
                className={`p-4.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-slate-900 ${
                  activeKpi === 'sp-prc'
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02] dark:bg-primary/[0.05]'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Project Timeline
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white truncate tracking-tight">
                    {activeProjectDetails?.durationValue}{' '}
                    {activeProjectDetails?.durationUnit}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                    PRC Date:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeProjectDetails?.dateOfPrc}
                    </span>
                  </div>
                </div>
                <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeKpi === 'sp-prc' ? 'rotate-180 text-primary' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* SINGLE PROJECT KPI ACCORDIONS */}
            {activeKpi && (
              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 animate-slideDown">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Break-up Details
                  </h4>
                  <button
                    onClick={() => setActiveKpi(null)}
                    className="text-xs text-primary font-extrabold hover:underline cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>

                {activeKpi === 'sp-budget' && (
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                          <th className="p-3.5">Budget head category</th>
                          <th className="p-3.5 text-right">Sanctioned Total</th>
                          <th className="p-3.5 text-right">Spent Actual</th>
                          <th className="p-3.5 text-right">Variance Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {projectHeadWiseData.map(h => (
                          <tr
                            key={h.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                          >
                            <td className="p-3.5 font-bold text-slate-800 dark:text-slate-205">
                              {h.particulars}
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              ₹{h.Budget.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              ₹{h.Spent.toLocaleString('en-IN')}
                            </td>
                            <td
                              className={`p-3.5 text-right font-mono font-bold ${h.Budget - h.Spent >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}
                            >
                              ₹{(h.Budget - h.Spent).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeKpi === 'sp-utilization' && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium">
                    <div className="text-[10px] font-black uppercase text-slate-400">
                      Utilization Trend Summary
                    </div>
                    <div className="mt-2.5 flex items-center justify-between font-mono">
                      <span>
                        Total Sanctioned: ₹
                        {singleProjectStats?.budget.toLocaleString('en-IN')}
                      </span>
                      <span>
                        Total Spent: ₹
                        {singleProjectStats?.spent.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {activeKpi === 'sp-overbudget' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded p-3 flex flex-col gap-2">
                    {singleProjectStats?.overBudgetHeads.length === 0 ? (
                      <div className="text-xs text-emerald-600 dark:text-emerald-405 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          All budget heads are within sanctioned parameters.
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-rose-600 dark:text-rose-455 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>
                            The following heads have exceeded their limit:
                          </span>
                        </div>
                        {singleProjectStats?.overBudgetHeads.map((h, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex justify-between items-center text-xs font-bold font-mono"
                          >
                            <span className="text-slate-850 dark:text-slate-200">
                              {h.particulars}
                            </span>
                            <span className="text-rose-600 shrink-0">
                              Exceeded by ₹
                              {h.overAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {activeKpi === 'sp-prc' && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium flex items-center gap-3">
                    <Milestone className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400">
                        Date of PRC Presentation
                      </div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-205 mt-0.5">
                        {activeProjectDetails?.dateOfPrc}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Presentation & clearance meeting of the Project Review
                        Committee.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SINGLE-PROJECT VIEW LAYOUT (DRILL-DOWNS) */}
            {projectDrilldown ? (
              /* DETAILED COST CENTER DRILL-DOWN SUB-ACCORDION - rounded-2xl */
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Drill-down:{' '}
                      {projectDrilldown.subHeadName
                        ? `${projectDrilldown.headName} > ${projectDrilldown.subHeadName}`
                        : projectDrilldown.headName}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      if (projectDrilldown.subHeadName) {
                        setProjectDrilldown({
                          headId: projectDrilldown.headId,
                          headName: projectDrilldown.headName,
                        });
                      } else {
                        setProjectDrilldown(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-xs cursor-pointer"
                  >
                    ← Back to Project Details
                  </button>
                </div>

                {projectDrilldown.subHeadName ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-450 flex items-center gap-1.5">
                      <Info className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span>
                        Ledger Transactions matching sub-head honorariums:
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                            <th className="pb-2">Voucher Number</th>
                            <th className="pb-2">Voucher Date</th>
                            <th className="pb-2">Voucher Type</th>
                            <th className="pb-2">Narration</th>
                            <th className="pb-2 text-right">Debit amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeDrilldownTransactions.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium text-xs"
                              >
                                No double-entry vouchers found referencing this
                                sub-head.
                              </td>
                            </tr>
                          ) : (
                            activeDrilldownTransactions.map(
                              (v: VoucherItem) => (
                                <tr
                                  key={v.id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                                >
                                  <td className="py-2.5 font-bold font-mono text-slate-955 dark:text-white">
                                    {v.voucherNumber}
                                  </td>
                                  <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    {v.voucherDate}
                                  </td>
                                  <td className="py-2.5">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                                      {v.voucherType}
                                    </span>
                                  </td>
                                  <td
                                    className="py-2.5 text-slate-500 dark:text-slate-400 max-w-60 truncate"
                                    title={v.narration}
                                  >
                                    {v.narration}
                                  </td>
                                  <td className="py-2.5 text-right font-bold font-mono text-slate-950 dark:text-white">
                                    ₹
                                    {(v.totalAmount || 0).toLocaleString(
                                      'en-IN'
                                    )}
                                  </td>
                                </tr>
                              )
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                          <th className="pb-2">Detailed Line Item Name</th>
                          <th className="pb-2">Units / Rate details</th>
                          <th className="pb-2 text-right">Sanctioned Outlay</th>
                          <th className="pb-2 text-right">spent actual</th>
                          <th className="pb-2 text-right">unspent variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeProjectDetails?.heads
                          .find(h => h.id === projectDrilldown.headId)
                          ?.subItems.map((sh: ProjectSubHeadItem) => (
                            <tr
                              key={sh.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                            >
                              <td className="py-2.5">
                                <button
                                  onClick={() => handleSubHeadClick(sh)}
                                  className="font-extrabold text-slate-850 dark:text-slate-200 hover:text-primary cursor-pointer"
                                >
                                  {sh.particulars || sh.name || ''}
                                </button>
                              </td>
                              <td className="py-2.5 text-slate-400 font-mono text-[10px]">
                                {sh.units ?? 1} × {sh.timePeriod ?? 1}{' '}
                                {sh.timePeriodUnit || 'Months'} @ ₹
                                {(sh.costPerUnit || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 text-right font-bold font-mono text-slate-950 dark:text-white">
                                ₹
                                {(
                                  sh.estimatedCost ||
                                  sh.amount ||
                                  0
                                ).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 text-right font-bold font-mono text-emerald-605">
                                ₹{(sh.spent || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 text-right font-bold font-mono text-primary">
                                ₹
                                {(
                                  (sh.estimatedCost || sh.amount || 0) -
                                  (sh.spent || 0)
                                ).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : selectedChartPeriod ? (
              /* PERIOD DRILL-DOWN PANEL */
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Drill-down: Transactions in {selectedChartPeriod}
                  </h3>
                  <button
                    onClick={() => setSelectedChartPeriod(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 text-xs cursor-pointer"
                  >
                    ← Back to Charts
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase">
                        <th className="pb-2">Voucher No</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Narration</th>
                        <th className="pb-2 text-right">Debit amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeDrilldownTransactions
                        .slice(0, 3)
                        .map((v: VoucherItem) => (
                          <tr
                            key={v.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                          >
                            <td className="py-2.5 font-bold font-mono text-slate-950 dark:text-white">
                              {v.voucherNumber}
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {v.voucherDate}
                            </td>
                            <td className="py-2.5">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                                {v.voucherType}
                              </span>
                            </td>
                            <td
                              className="py-2.5 text-slate-500 dark:text-slate-400 max-w-50 truncate"
                              title={v.narration}
                            >
                              {v.narration}
                            </td>
                            <td className="py-2.5 text-right font-bold font-mono text-slate-950 dark:text-white">
                              ₹{(v.totalAmount || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* SINGLE PROJECT CHARTS - rounded-xl to match theme */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Head-wise Budget vs Actual (Horizontal Progress Bars matching Image 2) */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                  <HeadWiseBudgetChart
                    data={projectHeadWiseData}
                    onHeadClick={handleHeadClick}
                  />
                </div>

                {/* Direct vs Overheads (Donut) */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                          <PieChartIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Cost Structure Allocation
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                            Donut breakdown: Direct research costs vs.
                            institutional overheads.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase shrink-0">
                        Breakdown
                      </span>
                    </div>
                  </div>
                  <div className="h-48 relative flex items-center justify-center">
                    {/* Center Overlay Display - z-0 behind tooltip */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Total Outlay
                      </span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white mt-0.5">
                        ₹
                        {activeProjectDetails
                          ? (activeProjectDetails.totalCost / 100000).toFixed(1)
                          : 0}
                        L
                      </span>
                    </div>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      className="relative z-10"
                    >
                      <PieChart>
                        <Pie
                          data={singleProjectDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          cornerRadius={6}
                          dataKey="value"
                        >
                          {singleProjectDonutData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          wrapperStyle={{ zIndex: 100 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              return (
                                <div className="px-3.5 py-2.5 bg-slate-900/95 dark:bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs font-bold flex flex-col gap-1 min-w-44">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                      style={{
                                        backgroundColor: data.payload.color,
                                      }}
                                    />
                                    <span className="text-slate-300 font-semibold">
                                      {data.name}
                                    </span>
                                  </div>
                                  <div className="text-sm font-black font-mono text-white pl-4.5">
                                    ₹
                                    {Number(data.value).toLocaleString('en-IN')}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Redesigned Legend Grid */}
                  <div className="grid grid-cols-1 gap-2 mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {singleProjectDonutData.map((d, i) => {
                      const total = activeProjectDetails?.totalCost || 1;
                      const pct = Math.round((d.value / total) * 100);
                      return (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: d.color }}
                            />
                            <span
                              className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate"
                              title={d.name}
                            >
                              {d.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                              ₹{(d.value / 100000).toFixed(1)}L
                            </span>
                            <span
                              className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md text-white shadow-2xs"
                              style={{ backgroundColor: d.color }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cumulative Spend burn-up (Area) */}
                <div className="lg:col-span-3 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          Cumulative Burn-up Over Time
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                          Area: Monthly actual spent trajectory against overall
                          limit. Click a point to inspect transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="h-52.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={singleProjectBurnUpData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        onClick={e => {
                          if (e && e.activeLabel) {
                            setSelectedChartPeriod(e.activeLabel);
                          }
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="colorSPSpend"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={activeColor.hex}
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor={activeColor.hex}
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                          className="dark:stroke-slate-800/80"
                          opacity={0.75}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{
                            fontSize: 11.5,
                            fontWeight: 'bold',
                            fill: '#64748b',
                          }}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fontWeight: 'bold',
                            fill: '#64748b',
                          }}
                          axisLine={false}
                          domain={[
                            0,
                            (dataMax: number) => Math.ceil(dataMax * 1.15),
                          ]}
                          tickFormatter={(val: number) => {
                            if (val >= 10000000)
                              return `₹${(val / 10000000).toFixed(1)}Cr`;
                            if (val >= 100000)
                              return `₹${(val / 100000).toFixed(0)}L`;
                            if (val === 0) return '₹0';
                            return `₹${val.toLocaleString('en-IN')}`;
                          }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="px-3.5 py-2.5 bg-slate-900/95 dark:bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs flex flex-col gap-1.5 min-w-48">
                                  <div className="font-extrabold text-slate-300 border-b border-slate-700/80 pb-1">
                                    {label}
                                  </div>
                                  {payload.map((entry, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-3 text-[11px] font-mono"
                                    >
                                      <span className="flex items-center gap-1.5 text-slate-300 font-sans font-semibold">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0"
                                          style={{
                                            backgroundColor: entry.color,
                                          }}
                                        />
                                        {entry.name}:
                                      </span>
                                      <span className="font-black text-white">
                                        ₹
                                        {Number(entry.value).toLocaleString(
                                          'en-IN'
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={30}
                          wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Spend"
                          name="Utilized Burn"
                          stroke={activeColor.hex}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorSPSpend)"
                          cursor="pointer"
                        />
                        <Area
                          type="monotone"
                          dataKey="Budget"
                          name="Sanctioned Limit"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          strokeDasharray="6 4"
                          fill="none"
                          dot={{
                            r: 3,
                            fill: '#f59e0b',
                            strokeWidth: 1.5,
                            stroke: '#fff',
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
