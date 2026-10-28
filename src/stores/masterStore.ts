/**
 * Central Master Data Store for AIGGPA ERP
 * Manages all configurable masters with localStorage persistence,
 * event emission on changes, and validation rules.
 */
import { emitStoreChange } from '../lib/storeEvents';
import type { OrgRole } from './activityTaskStore';

// ============================================================================
// 1. CENTER / DEPARTMENT MASTER
// ============================================================================
export interface CenterMasterItem {
  id: string;
  code: string;
  name: string;
  headEmployeeId: string | null;
  headEmployeeName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_CENTERS: CenterMasterItem[] = [
  {
    id: 'CTR-01',
    code: 'CETI',
    name: 'Centre for Economy, Trade & Innovation (CETI)',
    headEmployeeId: 'EMP-CH-01',
    headEmployeeName: 'Dr. Rajeshwar Rao',
    description:
      'Macro-economic research, fiscal analysis, state growth models, and industrial strategy',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'CTR-02',
    code: 'CHN',
    name: 'Centre for Health & Nutrition (CHN)',
    headEmployeeId: 'EMP-PM-01',
    headEmployeeName: 'Priya Sharma',
    description:
      'Public health systems evaluation, maternal-child nutrition, and hospital delivery benchmarks',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'CTR-03',
    code: 'CHRT',
    name: 'Centre for Human Resource & Technology (CHR-T)',
    headEmployeeId: 'EMP-PM-01',
    headEmployeeName: 'Priya Sharma',
    description:
      'Digital public infrastructure, civil service capacity development, and workforce readiness',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'CTR-04',
    code: 'CNRM',
    name: 'Centre for Natural Resource Management & Decentralization (CNRM-DG)',
    headEmployeeId: 'EMP-RA-01',
    headEmployeeName: 'Dr. Vikramaditya',
    description:
      'Panchayat governance, water conservation, community forestry, and rural ecology',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'CTR-05',
    code: 'CUGA',
    name: 'Centre for Urban Governance & Asset Management (CUGA)',
    headEmployeeId: 'EMP-RA-02',
    headEmployeeName: 'Sunita Roy',
    description:
      'Municipal finance, urban asset monetization, master plans, and smart city performance',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'CTR-06',
    code: 'CGGAR',
    name: 'Centre for Good Governance & Administrative Reforms (CGGAR)',
    headEmployeeId: 'EMP-CH-01',
    headEmployeeName: 'Dr. Rajeshwar Rao',
    description:
      'Citizen charters, public service guarantee delivery, anti-corruption systems, and institutional design',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ============================================================================
// 2. FINANCIAL YEAR MASTER
// ============================================================================
export interface FinancialYearItem {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrentActive: boolean;
  isCurrent?: boolean;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_FINANCIAL_YEARS: FinancialYearItem[] = [
  {
    id: 'FY-26-27',
    code: '2026-2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    isCurrentActive: true,
    isActive: true,
    createdAt: '2026-04-01',
  },
  {
    id: 'FY-25-26',
    code: '2025-2026',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    isCurrentActive: false,
    isActive: true,
    createdAt: '2025-04-01',
  },
  {
    id: 'FY-24-25',
    code: '2024-2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isCurrentActive: false,
    isActive: true,
    createdAt: '2024-04-01',
  },
  {
    id: 'FY-23-24',
    code: '2023-2024',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    isCurrentActive: false,
    isActive: true,
    createdAt: '2023-04-01',
  },
];

// ============================================================================
// 3. SCHEME MASTER
// ============================================================================
export interface SchemeMasterItem {
  id: string;
  code: string;
  name: string;
  financialYearId: string;
  financialYearCode: string;
  sponsoringAgency: string;
  budgetSanctioned: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_SCHEMES: SchemeMasterItem[] = [
  {
    id: 'SCH-01',
    code: '6483',
    name: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis (Core Grant)',
    financialYearId: 'FY-26-27',
    financialYearCode: '2026-2027',
    sponsoringAgency: 'Public Service Management Department, GoMP',
    budgetSanctioned: 150000000,
    description:
      'State budgetary allocation for core governance research, baseline evaluation studies and fellow honorariums',
    isActive: true,
    createdAt: '2026-04-01',
  },
  {
    id: 'SCH-02',
    code: '1165',
    name: 'M.P. State Planning Commission Special Research Studies Scheme',
    financialYearId: 'FY-26-27',
    financialYearCode: '2026-2027',
    sponsoringAgency: 'Madhya Pradesh State Planning Commission',
    budgetSanctioned: 45000000,
    description:
      'Commissioned policy papers and district econometric baseline studies',
    isActive: true,
    createdAt: '2026-04-01',
  },
  {
    id: 'SCH-03',
    code: '7821',
    name: 'State NITI Aayog Capacity Building & Monitoring Scheme',
    financialYearId: 'FY-25-26',
    financialYearCode: '2025-2026',
    sponsoringAgency: 'NITI Aayog & Planning Dept',
    budgetSanctioned: 80000000,
    description:
      'Aspirational districts field surveys and SDG tracking initiatives across MP',
    isActive: true,
    createdAt: '2025-04-01',
  },
  {
    id: 'SCH-04',
    code: '4190',
    name: 'Chief Minister Research Fellowship & Field Evaluation Scheme',
    financialYearId: 'FY-26-27',
    financialYearCode: '2026-2027',
    sponsoringAgency: 'Chief Minister Secretariat, MP',
    budgetSanctioned: 35000000,
    description:
      'Field immersion research and block welfare delivery impact assessment',
    isActive: true,
    createdAt: '2026-04-01',
  },
];

// ============================================================================
// 4. BUDGET HEAD & SUB-HEAD MASTER
// ============================================================================
export interface BudgetSubHeadItem {
  id: string;
  particular: string;
  standardRate: number;
  defaultUnit: string;
  description?: string;
  isActive: boolean;
}

export interface BudgetHeadMasterItem {
  id: string;
  headCode: string;
  code?: string;
  headName: string;
  name?: string;
  mode: 'detailed' | 'lumpSum' | 'overhead';
  badge?: string;
  subNote?: string;
  defaultUnit: string;
  overheadPercentage?: number;
  subItems: BudgetSubHeadItem[];
  subParticulars?: string[];
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_BUDGET_HEADS: BudgetHeadMasterItem[] = [
  {
    id: 'BH-HR',
    headCode: 'HR',
    headName: 'Human Resources & Research Personnel',
    mode: 'detailed',
    defaultUnit: 'Months',
    isActive: true,
    createdAt: '2026-01-01',
    subItems: [
      {
        id: 'bsh-1',
        particular: 'Lead Policy Fellow',
        standardRate: 125000,
        defaultUnit: 'Months',
        isActive: true,
      },
      {
        id: 'bsh-2',
        particular: 'Senior Advisor / Subject Expert',
        standardRate: 150000,
        defaultUnit: 'Months',
        isActive: true,
      },
      {
        id: 'bsh-3',
        particular: 'Research Associate',
        standardRate: 75000,
        defaultUnit: 'Months',
        isActive: true,
      },
      {
        id: 'bsh-4',
        particular: 'Data Analyst & Statistician',
        standardRate: 65000,
        defaultUnit: 'Months',
        isActive: true,
      },
      {
        id: 'bsh-5',
        particular: 'Field Investigator / Enumerator',
        standardRate: 35000,
        defaultUnit: 'Months',
        isActive: true,
      },
    ],
  },
  {
    id: 'BH-TRV',
    headCode: 'TRV',
    headName: 'Travel Allowances & Field Mobility',
    mode: 'lumpSum',
    badge: 'Lump Sum',
    defaultUnit: 'Lump Sum',
    isActive: true,
    createdAt: '2026-01-01',
    subItems: [
      {
        id: 'bsh-6',
        particular: 'Block & District Field Travel Conveyance',
        standardRate: 50000,
        defaultUnit: 'Lump Sum',
        isActive: true,
      },
      {
        id: 'bsh-7',
        particular: 'Enumerator Daily Mobility Per Diem',
        standardRate: 1500,
        defaultUnit: 'Days',
        isActive: true,
      },
    ],
  },
  {
    id: 'BH-PP',
    headCode: 'P&P',
    headName: 'Printing, Reports & Dissemination Publications',
    mode: 'lumpSum',
    badge: 'Lump Sum',
    defaultUnit: 'Lump Sum',
    isActive: true,
    createdAt: '2026-01-01',
    subItems: [
      {
        id: 'bsh-8',
        particular: 'Evaluation Report Multi-Color Printing & Binding',
        standardRate: 85000,
        defaultUnit: 'Lump Sum',
        isActive: true,
      },
      {
        id: 'bsh-9',
        particular: 'Stakeholder Workshop Dissemination Kits',
        standardRate: 35000,
        defaultUnit: 'Set',
        isActive: true,
      },
    ],
  },
  {
    id: 'BH-CTG',
    headCode: 'CTG',
    headName: 'Contingency & Incidentals',
    mode: 'lumpSum',
    badge: 'Lump Sum',
    defaultUnit: 'Lump Sum',
    isActive: true,
    createdAt: '2026-01-01',
    subItems: [
      {
        id: 'bsh-10',
        particular: 'Field Contingency & Unexpected Logistics',
        standardRate: 50000,
        defaultUnit: 'Lump Sum',
        isActive: true,
      },
    ],
  },
  {
    id: 'BH-IOC',
    headCode: 'IOC',
    headName: 'Institutional Overheads Cost',
    mode: 'overhead',
    badge: 'Fixed % Overhead',
    subNote: '(Computed as % of Sub-Total)',
    defaultUnit: '% Overhead',
    overheadPercentage: 15,
    isActive: true,
    createdAt: '2026-01-01',
    subItems: [
      {
        id: 'bsh-11',
        particular: 'AIGGPA Institutional Overhead & Facilities',
        standardRate: 15,
        defaultUnit: '% Overhead',
        isActive: true,
      },
    ],
  },
];

// ============================================================================
// 5. QUESTION CATEGORY MASTER
// ============================================================================
export interface QuestionCategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_QUESTION_CATEGORIES: QuestionCategoryItem[] = [
  {
    id: 'QC-01',
    code: 'LIV',
    name: 'Income & Livelihood',
    description:
      'Household monthly income, farming earnings, daily wage labor, and occupations',
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-02',
    code: 'WAT',
    name: 'Water & Sanitation',
    description:
      'Piped drinking water, Jal Jeevan Mission taps, sanitation and toilet facilities',
    displayOrder: 2,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-03',
    code: 'HLT',
    name: 'Public Health & Nutrition',
    description:
      'Primary health center accessibility, Ayushman Bharat card status, immunization',
    displayOrder: 3,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-04',
    code: 'DEM',
    name: 'Demographics & Household',
    description:
      'Household size, gender composition, caste classification, and head of house',
    displayOrder: 4,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-05',
    code: 'EDU',
    name: 'Education & Literacy',
    description:
      'School enrollment, midday meal quality, educational attainment, vocational skills',
    displayOrder: 5,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-06',
    code: 'AGR',
    name: 'Agriculture & Land Holdings',
    description:
      'Cultivable acreage, irrigation methods, crop cycles, and PM-Kisan enrollment',
    displayOrder: 6,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-07',
    code: 'INF',
    name: 'Infrastructure & Energy',
    description:
      'Road connectivity, domestic electricity connection meters, solar lighting',
    displayOrder: 7,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-08',
    code: 'GOV',
    name: 'General Governance & DBT',
    description:
      'Public service guarantee satisfaction, DBT subsidy receipt, grievance resolution',
    displayOrder: 8,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'QC-09',
    code: 'MIG',
    name: 'Migration & Labor Mobility',
    description:
      'Seasonal labor migration outside block/state, remittance flows and durations',
    displayOrder: 9,
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ============================================================================
// 6. GRIEVANCE CATEGORY & SLA MASTER
// ============================================================================
export interface GrievanceCategoryItem {
  id: string;
  code: string;
  label: string;
  name: string;
  description?: string;
  slaHours: number;
  defaultPriority:
    'Low' | 'Medium' | 'High' | 'Urgent' | 'low' | 'medium' | 'high' | 'urgent';
  targetRole?: string;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_GRIEVANCE_CATEGORIES: GrievanceCategoryItem[] = [
  {
    id: 'GC-01',
    code: 'field_travel',
    label: 'Field Travel & Conveyance Allowance',
    name: 'Field Travel & Conveyance Allowance',
    description:
      'Delays or discrepancies in reimbursement of field mobility vouchers',
    slaHours: 48,
    defaultPriority: 'High',
    targetRole: 'Fellow',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'GC-02',
    code: 'stipend',
    label: 'Stipend & Disbursal Delay',
    name: 'Stipend & Disbursal Delay',
    description:
      'Monthly honorarium processing delays or attendance reconciliation disputes',
    slaHours: 24,
    defaultPriority: 'Urgent',
    targetRole: 'Advisor',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'GC-03',
    code: 'infrastructure',
    label: 'Hardware & Survey Portal Sync Issues',
    name: 'Hardware & Survey Portal Sync Issues',
    description:
      'Mobile CAPI application crashes, offline cache synchronization failures, device damage',
    slaHours: 24,
    defaultPriority: 'Urgent',
    targetRole: 'Fellow',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'GC-04',
    code: 'workload_tasks',
    label: 'Workload & Task Allocation Conflict',
    name: 'Workload & Task Allocation Conflict',
    description:
      'Overlapping fieldwork assignments with academic examinations or emergency leaves',
    slaHours: 72,
    defaultPriority: 'Medium',
    targetRole: 'Fellow',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'GC-05',
    code: 'interpersonal',
    label: 'Interpersonal & Workplace Conduct',
    name: 'Interpersonal & Workplace Conduct',
    description:
      'Behavioral grievances, field safety concerns, or reporting team conflicts',
    slaHours: 24,
    defaultPriority: 'High',
    targetRole: 'Center Head',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'GC-06',
    code: 'other',
    label: 'General Administrative Grievance',
    name: 'General Administrative Grievance',
    description:
      'General logistics, stationery, certificate generation, or credential resets',
    slaHours: 96,
    defaultPriority: 'Low',
    targetRole: 'Fellow',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ============================================================================
// 7. PROJECT TEAM ALLOCATION ROSTER
// ============================================================================
export interface ProjectTeamAllocation {
  id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  employeeRole: OrgRole;
  projectRole: string; // 'Principal Investigator' | 'Lead Advisor' | 'Research Associate' | 'Field Coordinator' | 'Enumerator'
  allocatedDate: string;
  isActive: boolean;
}

export const DEFAULT_PROJECT_ALLOCATIONS: ProjectTeamAllocation[] = [
  // PRJ-01 (Viksit MP 2047)
  {
    id: 'ALC-01',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-CH-01',
    employeeName: 'Dr. Rajeshwar Rao',
    employeeRole: 'Center Head',
    projectRole: 'Principal Investigator & Project Director',
    allocatedDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'ALC-02',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-PM-01',
    employeeName: 'Priya Sharma',
    employeeRole: 'Advisor',
    projectRole: 'Advisor (Operations)',
    allocatedDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'ALC-03',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-RA-01',
    employeeName: 'Dr. Vikramaditya',
    employeeRole: 'Research Analyst',
    projectRole: 'Lead Quantitative Analyst',
    allocatedDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'ALC-04',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-FL-01',
    employeeName: 'Aakash Mehta',
    employeeRole: 'Fellow',
    projectRole: 'Lead Policy Fellow',
    allocatedDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'ALC-05',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-IN-01',
    employeeName: 'Rohan Verma',
    employeeRole: 'Intern',
    projectRole: 'Field Enumerator',
    allocatedDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'ALC-06',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    employeeId: 'EMP-IN-02',
    employeeName: 'Pooja Tiwari',
    employeeRole: 'Intern',
    projectRole: 'Field Enumerator',
    allocatedDate: '2026-10-01',
    isActive: true,
  },

  // PRJ-02 (Rural Healthcare)
  {
    id: 'ALC-07',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    employeeId: 'EMP-PM-01',
    employeeName: 'Priya Sharma',
    employeeRole: 'Advisor',
    projectRole: 'Project Lead Advisor',
    allocatedDate: '2026-08-15',
    isActive: true,
  },
  {
    id: 'ALC-08',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    employeeId: 'EMP-FL-02',
    employeeName: 'Sneha Patel',
    employeeRole: 'Fellow',
    projectRole: 'Healthcare Policy Fellow',
    allocatedDate: '2026-08-15',
    isActive: true,
  },
  {
    id: 'ALC-09',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    employeeId: 'EMP-IN-03',
    employeeName: 'Amit Solanki',
    employeeRole: 'Intern',
    projectRole: 'Hospital Survey Enumerator',
    allocatedDate: '2026-08-15',
    isActive: true,
  },
  {
    id: 'ALC-10',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    employeeId: 'EMP-IN-04',
    employeeName: 'Divya Sharma',
    employeeRole: 'Intern',
    projectRole: 'Field Enumerator',
    allocatedDate: '2026-08-15',
    isActive: true,
  },

  // PRJ-03 (State Agriculture Impact)
  {
    id: 'ALC-11',
    projectId: 'PRJ-03',
    projectName: 'Impact Assessment of Tribal Agriculture Extension Services',
    employeeId: 'EMP-PM-02',
    employeeName: 'Amitav Banerjee',
    employeeRole: 'Advisor',
    projectRole: 'Project Lead Advisor',
    allocatedDate: '2026-09-01',
    isActive: true,
  },
  {
    id: 'ALC-12',
    projectId: 'PRJ-03',
    projectName: 'Impact Assessment of Tribal Agriculture Extension Services',
    employeeId: 'EMP-FL-03',
    employeeName: 'Dr. Neha Saxena',
    employeeRole: 'Fellow',
    projectRole: 'District Governance Fellow',
    allocatedDate: '2026-09-01',
    isActive: true,
  },
  {
    id: 'ALC-13',
    projectId: 'PRJ-03',
    projectName: 'Impact Assessment of Tribal Agriculture Extension Services',
    employeeId: 'EMP-IN-05',
    employeeName: 'Karan Malhotra',
    employeeRole: 'Intern',
    projectRole: 'Block Field Enumerator',
    allocatedDate: '2026-09-01',
    isActive: true,
  },
];

// ============================================================================
// 8. ACTIVITY / WBS ENTITY (PROJECT-LINKED)
// ============================================================================
export interface ProjectActivityItem {
  id: string;
  code?: string;
  projectId: string;
  projectName: string;
  name: string;
  description?: string;
  targetStartDate: string;
  targetEndDate: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Delayed';
  deliverable?: string;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_PROJECT_ACTIVITIES: ProjectActivityItem[] = [
  // PRJ-01 Activities
  {
    id: 'ACT-01',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    name: 'District Econometric Baseline & NFHS Harmonization',
    description:
      'Panel data harmonization across 52 districts for labor market and skill acquisition indicators',
    targetStartDate: '2026-10-01',
    targetEndDate: '2026-11-15',
    status: 'In Progress',
    deliverable: 'Econometric Baseline Model Technical Brief',
    isActive: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'ACT-02',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    name: 'Field CAPI Instrument Design & Pilot Household Testing',
    description:
      'Design mobile questionnaire protocol, test offline caching and conduct enumerator training',
    targetStartDate: '2026-10-15',
    targetEndDate: '2026-12-15',
    status: 'In Progress',
    deliverable: 'Approved CAPI Fieldwork Protocol & Pilot Dataset',
    isActive: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'ACT-03',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    name: 'State Nodal Stakeholder Consultations & Policy Briefing',
    description:
      'Biannual review meetings with District Collectors and state line department secretaries',
    targetStartDate: '2026-12-01',
    targetEndDate: '2027-02-28',
    status: 'Planned',
    deliverable: 'Stakeholder Workshop Synthesis Report',
    isActive: true,
    createdAt: '2026-10-01',
  },

  // PRJ-02 Activities
  {
    id: 'ACT-04',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    name: 'Primary Health Centre Physical Infrastructure Verification',
    description:
      'Field physical audits of 120 PHC facilities across Ujjain and Dhar districts',
    targetStartDate: '2026-08-15',
    targetEndDate: '2026-10-31',
    status: 'In Progress',
    deliverable: 'PHC Geo-Tagged Facility Audit Ledger',
    isActive: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'ACT-05',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    name: 'Patient Satisfaction & Doctor Availability Household Surveys',
    description:
      'Interviewing 600 rural households regarding drug availability and doctor attendance',
    targetStartDate: '2026-10-01',
    targetEndDate: '2026-12-31',
    status: 'Planned',
    deliverable: 'Patient Satisfaction Statistical Report',
    isActive: true,
    createdAt: '2026-08-15',
  },
];

// ============================================================================
// 9. SURVEY MILESTONE MASTER TEMPLATES
// ============================================================================
export interface MilestoneMasterItem {
  id: string; // e.g. MLS-01
  code: string; // e.g. MS-SCOPE
  name: string;
  description: string;
  sequence: number; // 1..N
  surveyType: 'all' | 'household' | 'facility' | 'evaluation' | string;
  targetDaysOffset: number; // Duration offset from survey start date
  required: boolean;
  isRequired?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const DEFAULT_MILESTONES: MilestoneMasterItem[] = [
  {
    id: 'MLS-01',
    code: 'MS-SCOPE',
    name: 'Concept Note & Scope Finalization',
    description:
      'Finalize research scope, geographic boundaries, methodology, and stakeholder committee sign-off.',
    sequence: 1,
    surveyType: 'all',
    targetDaysOffset: 5,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-02',
    code: 'MS-QNR-DESIGN',
    name: 'Questionnaire Design & Expert Validation',
    description:
      'Author bilingual survey questions, validate skip logic, and obtain review by Lead Research Analyst.',
    sequence: 2,
    surveyType: 'all',
    targetDaysOffset: 12,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-03',
    code: 'MS-CAPI-TEST',
    name: 'Pilot Dry Run & CAPI Logic Verification',
    description:
      'Conduct pilot test on 10 field households, test tablet offline sync, and rectify question ambiguities.',
    sequence: 3,
    surveyType: 'all',
    targetDaysOffset: 20,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-04',
    code: 'MS-ENUM-TRAIN',
    name: 'Enumerator Allocation & Field Training',
    description:
      'Assign field interns and fellows, conduct orientation workshop, and verify GPS geofencing credentials.',
    sequence: 4,
    surveyType: 'all',
    targetDaysOffset: 26,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-05',
    code: 'MS-MID-COLLECT',
    name: 'Field Enumeration Rollout (50% Target)',
    description:
      'Mid-term collection checkpoint reaching 50% target sample with randomized supervisor spot-check audits.',
    sequence: 5,
    surveyType: 'all',
    targetDaysOffset: 42,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-06',
    code: 'MS-COMP-COLLECT',
    name: 'Fieldwork Closure & 100% Target Completion',
    description:
      'Achieve full respondent sample size, freeze field submissions, and collect supervisor debrief notes.',
    sequence: 6,
    surveyType: 'all',
    targetDaysOffset: 55,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-07',
    code: 'MS-DATA-CLEAN',
    name: 'Data Cleaning, Anonymization & Validation',
    description:
      'Statistical anomaly detection, missing-value imputation, outlier audits, and PII anonymization.',
    sequence: 7,
    surveyType: 'all',
    targetDaysOffset: 65,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'MLS-08',
    code: 'MS-FINAL-REPORT',
    name: 'Analytical Report & Policy Recommendations',
    description:
      'Generate econometric charts, policy takeaways, executive presentation, and archival in Knowledge Base.',
    sequence: 8,
    surveyType: 'all',
    targetDaysOffset: 75,
    required: true,
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ============================================================================
// STORAGE KEYS & STORE HELPER
// ============================================================================
const MASTER_KEYS = {
  CENTERS: 'aiggpa_master_centers',
  FINANCIAL_YEARS: 'aiggpa_master_financial_years',
  SCHEMES: 'aiggpa_master_schemes',
  BUDGET_HEADS: 'aiggpa_master_budget_heads',
  QUESTION_CATEGORIES: 'aiggpa_master_question_categories',
  GRIEVANCE_CATEGORIES: 'aiggpa_master_grievance_categories',
  PROJECT_ALLOCATIONS: 'aiggpa_project_team_allocations',
  PROJECT_ACTIVITIES: 'aiggpa_project_activities',
  MILESTONES: 'aiggpa_master_survey_milestones',
};

function readStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback on read failure
  }
  return defaultVal;
}

function writeStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    emitStoreChange();
  } catch {
    // Fallback on write failure
  }
}

// ============================================================================
// CENTRAL MASTER STORE API
// ============================================================================
export const MasterStore = {
  // ── 1. Centers / Departments ──
  getCenters(activeOnly = false): CenterMasterItem[] {
    const list = readStorage<CenterMasterItem[]>(MASTER_KEYS.CENTERS, []);
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.CENTERS, DEFAULT_CENTERS);
      return activeOnly
        ? DEFAULT_CENTERS.filter(c => c.isActive)
        : DEFAULT_CENTERS;
    }
    return activeOnly ? list.filter(c => c.isActive) : list;
  },
  getCenterById(id: string): CenterMasterItem | undefined {
    return this.getCenters().find(c => c.id === id || c.code === id);
  },
  saveCenter(
    item: Omit<CenterMasterItem, 'id' | 'createdAt'> & { id?: string }
  ): CenterMasterItem {
    const list = this.getCenters();
    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex(c => c.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        writeStorage(MASTER_KEYS.CENTERS, list);
        return list[idx];
      }
    }
    const newId = `CTR-${String(list.length + 1).padStart(2, '0')}`;
    const newItem: CenterMasterItem = {
      ...item,
      id: newId,
      createdAt: now,
    };
    list.push(newItem);
    writeStorage(MASTER_KEYS.CENTERS, list);
    return newItem;
  },
  toggleCenterActive(id: string): boolean {
    const list = this.getCenters();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].isActive = !list[idx].isActive;
      writeStorage(MASTER_KEYS.CENTERS, list);
      return true;
    }
    return false;
  },

  // ── 2. Financial Years ──
  getFinancialYears(activeOnly = false): FinancialYearItem[] {
    const list = readStorage<FinancialYearItem[]>(
      MASTER_KEYS.FINANCIAL_YEARS,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.FINANCIAL_YEARS, DEFAULT_FINANCIAL_YEARS);
      return activeOnly
        ? DEFAULT_FINANCIAL_YEARS.filter(f => f.isActive)
        : DEFAULT_FINANCIAL_YEARS;
    }
    return activeOnly ? list.filter(f => f.isActive) : list;
  },
  getCurrentFinancialYear(): FinancialYearItem {
    const list = this.getFinancialYears();
    return (
      list.find(f => f.isCurrentActive) || list[0] || DEFAULT_FINANCIAL_YEARS[0]
    );
  },
  saveFinancialYear(
    item: Omit<FinancialYearItem, 'id' | 'createdAt'> & { id?: string }
  ): FinancialYearItem {
    const list = this.getFinancialYears();
    const now = new Date().toISOString().split('T')[0];
    if (item.isCurrentActive) {
      list.forEach(f => (f.isCurrentActive = false));
    }
    if (item.id) {
      const idx = list.findIndex(f => f.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        writeStorage(MASTER_KEYS.FINANCIAL_YEARS, list);
        return list[idx];
      }
    }
    const newId = `FY-${item.code.replace(/\s+/g, '')}`;
    const newItem: FinancialYearItem = {
      ...item,
      id: newId,
      createdAt: now,
    };
    list.unshift(newItem);
    writeStorage(MASTER_KEYS.FINANCIAL_YEARS, list);
    return newItem;
  },

  // ── 3. Schemes ──
  getSchemes(activeOnly = false): SchemeMasterItem[] {
    const list = readStorage<SchemeMasterItem[]>(MASTER_KEYS.SCHEMES, []);
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.SCHEMES, DEFAULT_SCHEMES);
      return activeOnly
        ? DEFAULT_SCHEMES.filter(s => s.isActive)
        : DEFAULT_SCHEMES;
    }
    return activeOnly ? list.filter(s => s.isActive) : list;
  },
  getSchemeById(id: string): SchemeMasterItem | undefined {
    return this.getSchemes().find(s => s.id === id || s.code === id);
  },
  saveScheme(
    item: Omit<SchemeMasterItem, 'id' | 'createdAt'> & { id?: string }
  ): SchemeMasterItem {
    const list = this.getSchemes();
    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex(s => s.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        writeStorage(MASTER_KEYS.SCHEMES, list);
        return list[idx];
      }
    }
    const newId = `SCH-${String(list.length + 1).padStart(2, '0')}`;
    const newItem: SchemeMasterItem = {
      ...item,
      id: newId,
      createdAt: now,
    };
    list.push(newItem);
    writeStorage(MASTER_KEYS.SCHEMES, list);
    return newItem;
  },
  toggleSchemeActive(id: string): boolean {
    const list = this.getSchemes();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx].isActive = !list[idx].isActive;
      writeStorage(MASTER_KEYS.SCHEMES, list);
      return true;
    }
    return false;
  },

  // ── 4. Budget Heads & Sub-Heads ──
  getBudgetHeads(activeOnly = false): BudgetHeadMasterItem[] {
    const list = readStorage<BudgetHeadMasterItem[]>(
      MASTER_KEYS.BUDGET_HEADS,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.BUDGET_HEADS, DEFAULT_BUDGET_HEADS);
      return activeOnly
        ? DEFAULT_BUDGET_HEADS.filter(b => b.isActive)
        : DEFAULT_BUDGET_HEADS;
    }
    return activeOnly ? list.filter(b => b.isActive) : list;
  },
  getBudgetHeadById(id: string): BudgetHeadMasterItem | undefined {
    return this.getBudgetHeads().find(
      b =>
        b.id === id ||
        b.headCode === id ||
        b.headName.toLowerCase() === id.toLowerCase()
    );
  },
  saveBudgetHead(
    item: Omit<BudgetHeadMasterItem, 'id' | 'createdAt'> & { id?: string }
  ): BudgetHeadMasterItem {
    const list = this.getBudgetHeads();
    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex(b => b.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        writeStorage(MASTER_KEYS.BUDGET_HEADS, list);
        return list[idx];
      }
    }
    const newId = `BH-${item.headCode.toUpperCase()}`;
    const newItem: BudgetHeadMasterItem = {
      ...item,
      id: newId,
      createdAt: now,
    };
    list.push(newItem);
    writeStorage(MASTER_KEYS.BUDGET_HEADS, list);
    return newItem;
  },
  addSubHeadItem(
    headId: string,
    sub: Omit<BudgetSubHeadItem, 'id'>
  ): BudgetSubHeadItem | null {
    const list = this.getBudgetHeads();
    const head = list.find(b => b.id === headId);
    if (!head) return null;
    const newSub: BudgetSubHeadItem = {
      ...sub,
      id: `bsh-${Date.now().toString().slice(-4)}`,
    };
    head.subItems.push(newSub);
    writeStorage(MASTER_KEYS.BUDGET_HEADS, list);
    return newSub;
  },
  removeSubHeadItem(headId: string, subId: string): boolean {
    const list = this.getBudgetHeads();
    const head = list.find(b => b.id === headId);
    if (!head) return false;
    head.subItems = head.subItems.filter(s => s.id !== subId);
    writeStorage(MASTER_KEYS.BUDGET_HEADS, list);
    return true;
  },

  // ── 5. Question Categories ──
  getQuestionCategories(activeOnly = false): QuestionCategoryItem[] {
    const list = readStorage<QuestionCategoryItem[]>(
      MASTER_KEYS.QUESTION_CATEGORIES,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(
        MASTER_KEYS.QUESTION_CATEGORIES,
        DEFAULT_QUESTION_CATEGORIES
      );
      return activeOnly
        ? DEFAULT_QUESTION_CATEGORIES.filter(q => q.isActive)
        : DEFAULT_QUESTION_CATEGORIES;
    }
    const sorted = [...list].sort((a, b) => a.displayOrder - b.displayOrder);
    return activeOnly ? sorted.filter(q => q.isActive) : sorted;
  },
  saveQuestionCategory(
    item: Omit<QuestionCategoryItem, 'id' | 'createdAt'> & { id?: string }
  ): QuestionCategoryItem {
    const list = this.getQuestionCategories();
    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex(q => q.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        writeStorage(MASTER_KEYS.QUESTION_CATEGORIES, list);
        return list[idx];
      }
    }
    const newId = `QC-${String(list.length + 1).padStart(2, '0')}`;
    const newItem: QuestionCategoryItem = {
      ...item,
      id: newId,
      createdAt: now,
    };
    list.push(newItem);
    writeStorage(MASTER_KEYS.QUESTION_CATEGORIES, list);
    return newItem;
  },
  toggleQuestionCategoryActive(id: string): boolean {
    const list = this.getQuestionCategories();
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      list[idx].isActive = !list[idx].isActive;
      writeStorage(MASTER_KEYS.QUESTION_CATEGORIES, list);
      return true;
    }
    return false;
  },

  // ── 6. Grievance Categories ──
  getGrievanceCategories(activeOnly = false): GrievanceCategoryItem[] {
    const list = readStorage<GrievanceCategoryItem[]>(
      MASTER_KEYS.GRIEVANCE_CATEGORIES,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(
        MASTER_KEYS.GRIEVANCE_CATEGORIES,
        DEFAULT_GRIEVANCE_CATEGORIES
      );
      return activeOnly
        ? DEFAULT_GRIEVANCE_CATEGORIES.filter(g => g.isActive)
        : DEFAULT_GRIEVANCE_CATEGORIES;
    }
    return activeOnly ? list.filter(g => g.isActive) : list;
  },
  saveGrievanceCategory(item: {
    id?: string;
    code: string;
    name?: string;
    label?: string;
    description?: string;
    slaHours?: number;
    defaultPriority?:
      | 'Low'
      | 'Medium'
      | 'High'
      | 'Urgent'
      | 'low'
      | 'medium'
      | 'high'
      | 'urgent';
    targetRole?: string;
    isActive?: boolean;
  }): GrievanceCategoryItem {
    const list = this.getGrievanceCategories();
    const now = new Date().toISOString().split('T')[0];
    const catName = item.name || item.label || 'Unnamed Category';
    const catLabel = item.label || item.name || 'Unnamed Category';
    if (item.id) {
      const idx = list.findIndex(g => g.id === item.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...item,
          name: catName,
          label: catLabel,
          slaHours: item.slaHours ?? list[idx].slaHours,
          defaultPriority: item.defaultPriority ?? list[idx].defaultPriority,
          isActive:
            item.isActive !== undefined ? item.isActive : list[idx].isActive,
        };
        writeStorage(MASTER_KEYS.GRIEVANCE_CATEGORIES, list);
        return list[idx];
      }
    }
    const newId = `GC-${String(list.length + 1).padStart(2, '0')}`;
    const newItem: GrievanceCategoryItem = {
      id: item.id || newId,
      code: item.code,
      name: catName,
      label: catLabel,
      description: item.description,
      slaHours: item.slaHours ?? 48,
      defaultPriority: item.defaultPriority || 'Medium',
      targetRole: item.targetRole || 'Center Head',
      isActive: item.isActive !== undefined ? item.isActive : true,
      createdAt: now,
    };
    list.push(newItem);
    writeStorage(MASTER_KEYS.GRIEVANCE_CATEGORIES, list);
    return newItem;
  },
  toggleGrievanceCategoryActive(id: string): GrievanceCategoryItem | undefined {
    const list = this.getGrievanceCategories();
    const item = list.find(g => g.id === id);
    if (item) {
      item.isActive = !item.isActive;
      writeStorage(MASTER_KEYS.GRIEVANCE_CATEGORIES, list);
    }
    return item;
  },

  // ── 7. Project Team Allocation Roster ──
  getProjectAllocations(projectId?: string): ProjectTeamAllocation[] {
    const list = readStorage<ProjectTeamAllocation[]>(
      MASTER_KEYS.PROJECT_ALLOCATIONS,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(
        MASTER_KEYS.PROJECT_ALLOCATIONS,
        DEFAULT_PROJECT_ALLOCATIONS
      );
      return projectId
        ? DEFAULT_PROJECT_ALLOCATIONS.filter(
            a => a.projectId === projectId && a.isActive
          )
        : DEFAULT_PROJECT_ALLOCATIONS;
    }
    if (projectId) {
      return list.filter(a => a.projectId === projectId && a.isActive);
    }
    return list;
  },
  isEmployeeAllocatedToProject(projectId: string, employeeId: string): boolean {
    const allocations = this.getProjectAllocations(projectId);
    return allocations.some(a => a.employeeId === employeeId && a.isActive);
  },
  addProjectAllocation(
    allocOrProjectId: Omit<ProjectTeamAllocation, 'id' | 'isActive'> | string,
    employeeId?: string,
    projectRole?: string
  ): ProjectTeamAllocation {
    const list = this.getProjectAllocations();
    let alloc: Omit<ProjectTeamAllocation, 'id' | 'isActive'>;
    if (typeof allocOrProjectId === 'string') {
      const pid = allocOrProjectId;
      alloc = {
        projectId: pid,
        projectName: pid,
        employeeId: employeeId || '',
        employeeName: employeeId || '',
        employeeRole: 'Fellow',
        projectRole: projectRole || 'Team Member',
        allocatedDate: new Date().toISOString().split('T')[0],
      };
    } else {
      alloc = allocOrProjectId;
    }
    // Check if already allocated
    const existing = list.find(
      a => a.projectId === alloc.projectId && a.employeeId === alloc.employeeId
    );
    if (existing) {
      existing.isActive = true;
      existing.projectRole = alloc.projectRole;
      writeStorage(MASTER_KEYS.PROJECT_ALLOCATIONS, list);
      return existing;
    }
    const newAlloc: ProjectTeamAllocation = {
      ...alloc,
      id: `ALC-${Date.now().toString().slice(-4)}`,
      isActive: true,
    };
    list.push(newAlloc);
    writeStorage(MASTER_KEYS.PROJECT_ALLOCATIONS, list);
    return newAlloc;
  },
  removeProjectAllocation(allocationId: string): boolean {
    const list = this.getProjectAllocations();
    const idx = list.findIndex(a => a.id === allocationId);
    if (idx !== -1) {
      list[idx].isActive = false;
      writeStorage(MASTER_KEYS.PROJECT_ALLOCATIONS, list);
      return true;
    }
    return false;
  },

  // ── 8. Project Activities / WBS (Optional Milestones) ──
  getActivities(projectId?: string): ProjectActivityItem[] {
    const list = readStorage<ProjectActivityItem[]>(
      MASTER_KEYS.PROJECT_ACTIVITIES,
      []
    );
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.PROJECT_ACTIVITIES, DEFAULT_PROJECT_ACTIVITIES);
      return projectId
        ? DEFAULT_PROJECT_ACTIVITIES.filter(
            a => a.projectId === projectId && a.isActive
          )
        : DEFAULT_PROJECT_ACTIVITIES;
    }
    if (projectId) {
      return list.filter(a => a.projectId === projectId && a.isActive);
    }
    return list;
  },
  getActivityById(id: string): ProjectActivityItem | undefined {
    return this.getActivities().find(a => a.id === id);
  },
  saveActivity(
    activity: Omit<ProjectActivityItem, 'id' | 'createdAt'> & { id?: string }
  ): ProjectActivityItem {
    const list = this.getActivities();
    const now = new Date().toISOString().split('T')[0];
    if (activity.id) {
      const idx = list.findIndex(a => a.id === activity.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...activity };
        writeStorage(MASTER_KEYS.PROJECT_ACTIVITIES, list);
        return list[idx];
      }
    }
    const newId = `ACT-${Date.now().toString().slice(-4)}`;
    const newAct: ProjectActivityItem = {
      ...activity,
      id: newId,
      createdAt: now,
    };
    list.push(newAct);
    writeStorage(MASTER_KEYS.PROJECT_ACTIVITIES, list);
    return newAct;
  },

  // ── 9. Survey Milestone Master ──
  getMilestones(includeInactive = false): MilestoneMasterItem[] {
    const list = readStorage<MilestoneMasterItem[]>(MASTER_KEYS.MILESTONES, []);
    if (!list || list.length === 0) {
      writeStorage(MASTER_KEYS.MILESTONES, DEFAULT_MILESTONES);
      return includeInactive
        ? DEFAULT_MILESTONES
        : DEFAULT_MILESTONES.filter(m => m.isActive);
    }
    return includeInactive ? list : list.filter(m => m.isActive);
  },

  getMilestoneById(id: string): MilestoneMasterItem | undefined {
    return this.getMilestones(true).find(m => m.id === id);
  },

  saveMilestone(item: Partial<MilestoneMasterItem>): MilestoneMasterItem {
    const list = this.getMilestones(true);
    const now = new Date().toISOString().split('T')[0];

    if (item.id) {
      const idx = list.findIndex(m => m.id === item.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...item,
          sequence: Number(item.sequence) || list[idx].sequence,
          targetDaysOffset:
            Number(item.targetDaysOffset) || list[idx].targetDaysOffset,
          updatedAt: now,
        } as MilestoneMasterItem;
        list.sort((a, b) => a.sequence - b.sequence);
        writeStorage(MASTER_KEYS.MILESTONES, list);
        return list[idx];
      }
    }

    const nextSeq = list.length + 1;
    const newId = `MLS-${String(nextSeq).padStart(2, '0')}`;
    const newItem: MilestoneMasterItem = {
      id: newId,
      code:
        item.code?.trim().toUpperCase() ||
        `MS-${String(nextSeq).padStart(2, '0')}`,
      name: item.name?.trim() || 'New Milestone',
      description: item.description?.trim() || '',
      sequence: Number(item.sequence) || nextSeq,
      surveyType: item.surveyType || 'all',
      targetDaysOffset: Number(item.targetDaysOffset) || 7,
      required: item.required !== undefined ? Boolean(item.required) : true,
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      createdAt: now,
    };
    list.push(newItem);
    list.sort((a, b) => a.sequence - b.sequence);
    writeStorage(MASTER_KEYS.MILESTONES, list);
    return newItem;
  },

  toggleMilestoneActive(id: string): boolean {
    const list = this.getMilestones(true);
    const target = list.find(m => m.id === id);
    if (!target) return false;
    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString().split('T')[0];
    writeStorage(MASTER_KEYS.MILESTONES, list);
    return true;
  },
};
