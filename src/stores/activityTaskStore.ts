/**
 * Central Data Store for Activities & Tasks with Organizational Reporting Hierarchy.
 * Manages:
 * - Center Head -> Project Manager / Research Analyst -> Fellows -> Interns
 * - Strict permission & assignment validation
 * - 5-Stage Kanban Workflow (To Do, In Progress, In Review, Changes Requested, Completed)
 * - Review gates (preventing unapproved completion)
 * - Timeline audit logs & discussion comments
 * - LocalStorage persistence and cross-page synchronization
 */
import { emitStoreChange } from '../lib/storeEvents';

export type OrgRole =
  'Center Head' | 'Project Manager' | 'Research Analyst' | 'Fellow' | 'Intern';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus =
  'To Do' | 'In Progress' | 'In Review' | 'Changes Requested' | 'Completed';

export interface Employee {
  id: string;
  name: string;
  role: OrgRole;
  email: string;
  designation: string;
  department: string;
  reportsTo: string | null; // ID of supervisor
  avatarColor: string;
  employeeCode?: string;
  centerId?: string;
  isActive?: boolean;
}

export type SubtaskType = 'standard' | 'survey' | 'meeting';

export interface TaskAssigneeReadStatus {
  id?: string;
  name: string;
  role?: string;
  read?: boolean;
  readAt?: string | null;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  type?: SubtaskType;
  surveyId?: string;
  meetingUrl?: string;
  meetingDuration?: string;
  meetingDescription?: string;
  assigneeName?: string;
  dueDate?: string;
  priority?: TaskPriority | string;
  status?: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: OrgRole;
  content: string;
  createdAt: string;
}

export interface TaskTimelineEvent {
  id: string;
  actorName: string;
  actorRole: OrgRole;
  action: string;
  details: string;
  timestamp: string;
}

export type EvidenceType = 'text' | 'voice' | 'photo' | 'video' | 'document';

export interface EvidenceRequirement {
  id: string;
  type: EvidenceType;
  title: string;
  description?: string;
  required: boolean;
  minCount?: number;
  maxCount?: number;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  maxDurationSeconds?: number;
  instructions?: string;
}

export interface EvidenceItem {
  id: string;
  requirementId: string;
  type: EvidenceType;
  title?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  fileData?: string; // Data URI, safe mock identifier, or preview representation
  storageRef?: string;
  durationSeconds?: number;
  textResponse?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName?: string;
  uploaderRole?: OrgRole;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  version: number;
  submittedAt: string;
  submittedBy: string;
  submitterName: string;
  submitterRole: OrgRole;
  notes?: string;
  evidence: EvidenceItem[];
  status: 'Pending' | 'Approved' | 'Changes Requested' | 'Rejected';
  decision?: 'Approved' | 'Changes Requested' | 'Rejected';
  decidedAt?: string;
  decidedBy?: string;
  reviewerName?: string;
  reviewerRole?: OrgRole;
  reviewerFeedback?: string;
}

export interface ActivityTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  creatorId: string;
  creatorName: string;
  creatorRole: OrgRole;
  assigneeId: string;
  assigneeName: string;
  assigneeRole: OrgRole;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: OrgRole;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  requiresReview: boolean;
  reviewStatus?:
    'Pending' | 'Approved' | 'Revision Requested' | 'Rejected' | null;
  reviewFeedback?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  activityId?: string;
  activityName?: string;
  labels: string[];
  attachments: string[];
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  timeline: TaskTimelineEvent[];
  createdAt: string;
  updatedAt: string;

  // Linked Survey Association (optional)
  surveyId?: string;
  surveyTitle?: string;

  // Assignment Mode: Individual vs Group
  assignmentMode?: 'Individual' | 'Group';
  groupName?: string;
  memberIds?: string[];
  assignees?: TaskAssigneeReadStatus[];

  // Structured hierarchy-based evidence collection & submission versioning
  evidenceRequirements: EvidenceRequirement[];
  currentEvidenceDraft?: EvidenceItem[];
  submissions: TaskSubmission[];
}

const STORAGE_KEYS = {
  EMPLOYEES: 'aiggpa_org_employees',
  TASKS: 'aiggpa_activities_tasks',
  ACTIVE_USER: 'aiggpa_active_role_user',
};

// ── Default Employees Hierarchy ──
export const DEFAULT_EMPLOYEES: Employee[] = [
  // Tier 1: Center Head
  {
    id: 'EMP-CH-01',
    name: 'Dr. Rajeshwar Rao',
    role: 'Center Head',
    email: 'rajeshwar.rao@aiggpa.mp.gov.in',
    designation: 'Director & Center Head',
    department: 'Center for Policy Governance & Evaluation',
    reportsTo: null,
    avatarColor: '#1d4ed8', // Navy Blue
  },

  // Tier 2: Project Managers (Parallel to Research Analysts)
  {
    id: 'EMP-PM-01',
    name: 'Priya Sharma',
    role: 'Project Manager',
    email: 'priya.sharma@aiggpa.mp.gov.in',
    designation: 'Senior Project Manager',
    department: 'Digital Infrastructure & Field Operations',
    reportsTo: 'EMP-CH-01',
    avatarColor: '#0284c7', // Sky Blue
  },
  {
    id: 'EMP-PM-02',
    name: 'Amitav Banerjee',
    role: 'Project Manager',
    email: 'amitav.banerjee@aiggpa.mp.gov.in',
    designation: 'Project Manager (Governance Studies)',
    department: 'District Governance Initiatives',
    reportsTo: 'EMP-CH-01',
    avatarColor: '#0369a1',
  },

  // Tier 2: Research Analysts (Parallel to Project Managers)
  {
    id: 'EMP-RA-01',
    name: 'Dr. Vikramaditya',
    role: 'Research Analyst',
    email: 'vikramaditya@aiggpa.mp.gov.in',
    designation: 'Lead Research Analyst',
    department: 'Quantitative Evaluation & Statistics',
    reportsTo: 'EMP-CH-01',
    avatarColor: '#0f766e', // Teal
  },
  {
    id: 'EMP-RA-02',
    name: 'Sunita Roy',
    role: 'Research Analyst',
    email: 'sunita.roy@aiggpa.mp.gov.in',
    designation: 'Senior Policy Analyst',
    department: 'Socio-Economic Policy Evaluation',
    reportsTo: 'EMP-CH-01',
    avatarColor: '#047857', // Emerald
  },

  // Tier 3: Fellows (Assigned to PMs or RAs)
  {
    id: 'EMP-FL-01',
    name: 'Aakash Mehta',
    role: 'Fellow',
    email: 'aakash.mehta@aiggpa.mp.gov.in',
    designation: 'Lead Policy Fellow',
    department: 'Field Operations & Surveys',
    reportsTo: 'EMP-PM-01',
    avatarColor: '#3b82f6',
  },
  {
    id: 'EMP-FL-02',
    name: 'Sneha Patel',
    role: 'Fellow',
    email: 'sneha.patel@aiggpa.mp.gov.in',
    designation: 'Healthcare Policy Fellow',
    department: 'Health Infrastructure Projects',
    reportsTo: 'EMP-PM-01',
    avatarColor: '#2563eb',
  },
  {
    id: 'EMP-FL-03',
    name: 'Dr. Neha Saxena',
    role: 'Fellow',
    email: 'neha.saxena@aiggpa.mp.gov.in',
    designation: 'District Governance Fellow',
    department: 'District Governance Initiatives',
    reportsTo: 'EMP-PM-02',
    avatarColor: '#1d4ed8',
  },
  {
    id: 'EMP-FL-04',
    name: 'Rahul Sharma',
    role: 'Fellow',
    email: 'rahul.sharma@aiggpa.mp.gov.in',
    designation: 'Quantitative Research Fellow',
    department: 'Quantitative Evaluation & Statistics',
    reportsTo: 'EMP-RA-01',
    avatarColor: '#0d9488',
  },
  {
    id: 'EMP-FL-05',
    name: 'Alok Mishra',
    role: 'Fellow',
    email: 'alok.mishra@aiggpa.mp.gov.in',
    designation: 'Public Policy Fellow',
    department: 'Socio-Economic Policy Evaluation',
    reportsTo: 'EMP-RA-02',
    avatarColor: '#059669',
  },

  // Tier 4: Interns (Assigned to Fellows)
  {
    id: 'EMP-IN-01',
    name: 'Rohan Verma',
    role: 'Intern',
    email: 'rohan.verma@aiggpa.mp.gov.in',
    designation: 'Field Survey Intern',
    department: 'Field Operations',
    reportsTo: 'EMP-FL-01',
    avatarColor: '#64748b',
  },
  {
    id: 'EMP-IN-02',
    name: 'Kavita Joshi',
    role: 'Intern',
    email: 'kavita.joshi@aiggpa.mp.gov.in',
    designation: 'Data Verification Intern',
    department: 'Field Operations',
    reportsTo: 'EMP-FL-01',
    avatarColor: '#475569',
  },
  {
    id: 'EMP-IN-03',
    name: 'Manish Tiwari',
    role: 'Intern',
    email: 'manish.tiwari@aiggpa.mp.gov.in',
    designation: 'Health Audit Intern',
    department: 'Health Infrastructure Projects',
    reportsTo: 'EMP-FL-02',
    avatarColor: '#64748b',
  },
  {
    id: 'EMP-IN-04',
    name: 'Pooja Tiwari',
    role: 'Intern',
    email: 'pooja.tiwari@aiggpa.mp.gov.in',
    designation: 'Documentation Intern',
    department: 'Health Infrastructure Projects',
    reportsTo: 'EMP-FL-02',
    avatarColor: '#475569',
  },
  {
    id: 'EMP-IN-05',
    name: 'Tanvi Dubey',
    role: 'Intern',
    email: 'tanvi.dubey@aiggpa.mp.gov.in',
    designation: 'District Research Intern',
    department: 'District Governance Initiatives',
    reportsTo: 'EMP-FL-03',
    avatarColor: '#64748b',
  },
  {
    id: 'EMP-IN-06',
    name: 'Megha Patidar',
    role: 'Intern',
    email: 'megha.patidar@aiggpa.mp.gov.in',
    designation: 'GIS & Field Intern',
    department: 'Quantitative Evaluation',
    reportsTo: 'EMP-FL-04',
    avatarColor: '#475569',
  },
  {
    id: 'EMP-IN-07',
    name: 'Kunal Malviya',
    role: 'Intern',
    email: 'kunal.malviya@aiggpa.mp.gov.in',
    designation: 'Data Coding Intern',
    department: 'Socio-Economic Evaluation',
    reportsTo: 'EMP-FL-05',
    avatarColor: '#64748b',
  },
];

// ── Realistic Seed Tasks ──
export const DEFAULT_TASKS: ActivityTask[] = [
  {
    id: 'TSK-01',
    title: 'Coordinate DPI-Based Open Networks State Deployment',
    description:
      'Manage district-wide deployment of open networks architecture across 12 pilot blocks. Ensure alignment with Viksit MP 2047 roadmap.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-CH-01',
    creatorName: 'Dr. Rajeshwar Rao',
    creatorRole: 'Center Head',
    assigneeId: 'EMP-PM-01',
    assigneeName: 'Priya Sharma',
    assigneeRole: 'Project Manager',
    reviewerId: 'EMP-CH-01',
    reviewerName: 'Dr. Rajeshwar Rao',
    reviewerRole: 'Center Head',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-10-01',
    dueDate: '2026-10-25',
    requiresReview: true,
    reviewStatus: null,
    reviewFeedback: null,
    labels: ['DPI', 'Viksit MP', 'Governance'],
    attachments: ['State_Deployment_Brief_v2.pdf'],
    checklist: [
      {
        id: 'c1',
        text: 'District orientation webinars completed',
        completed: true,
      },
      {
        id: 'c2',
        text: 'API gateway sandbox integration with NIC portal',
        completed: true,
      },
      {
        id: 'c3',
        text: 'Collectorate review workshop presentation draft',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-CH-01',
        authorName: 'Dr. Rajeshwar Rao',
        authorRole: 'Center Head',
        content:
          'Ensure block nodal officers are briefed before the upcoming review on 20th October.',
        createdAt: '2026-10-02 11:30 AM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Dr. Rajeshwar Rao',
        actorRole: 'Center Head',
        action: 'Task Created',
        details: 'Assigned to Priya Sharma (Project Manager). Priority: High.',
        timestamp: '2026-10-01 09:30 AM',
      },
      {
        id: 'tm2',
        actorName: 'Priya Sharma',
        actorRole: 'Project Manager',
        action: 'Status Changed',
        details: 'Moved from To Do to In Progress.',
        timestamp: '2026-10-02 10:15 AM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-1-1',
        type: 'document',
        title: 'Open Networks Architecture Roadmap',
        description:
          'Comprehensive policy brief and technical specifications for the pilot deployment.',
        required: true,
        acceptedFileTypes: ['.pdf', '.docx'],
        instructions:
          'Attach the verified architecture blueprint signed by NIC.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [],
    createdAt: '2026-10-01',
    updatedAt: '2026-10-02',
  },
  {
    id: 'TSK-02',
    title: 'Statistical Econometric Baseline for Viksit MP 2047 Human Capital',
    description:
      'Formulate regression panel datasets for labor market participation and skill acquisition indicators from NFHS and PLFS micro-data.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-CH-01',
    creatorName: 'Dr. Rajeshwar Rao',
    creatorRole: 'Center Head',
    assigneeId: 'EMP-RA-01',
    assigneeName: 'Dr. Vikramaditya',
    assigneeRole: 'Research Analyst',
    reviewerId: 'EMP-CH-01',
    reviewerName: 'Dr. Rajeshwar Rao',
    reviewerRole: 'Center Head',
    priority: 'Critical',
    status: 'In Progress',
    startDate: '2026-10-03',
    dueDate: '2026-10-30',
    requiresReview: true,
    reviewStatus: null,
    reviewFeedback: null,
    labels: ['Econometrics', 'Research', 'PLFS'],
    attachments: ['Econometric_Model_Spec.docx'],
    checklist: [
      {
        id: 'c1',
        text: 'Harmonize district boundary codes across census years',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Run Difference-in-Differences panel regression in R',
        completed: false,
      },
      {
        id: 'c3',
        text: 'Document summary coefficients and p-values',
        completed: false,
      },
    ],
    comments: [],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Dr. Rajeshwar Rao',
        actorRole: 'Center Head',
        action: 'Task Created',
        details:
          'Assigned to Dr. Vikramaditya (Research Analyst). Priority: Critical.',
        timestamp: '2026-10-03 10:00 AM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-2-1',
        type: 'document',
        title: 'Econometric Model Specification Document',
        description: 'Mathematical formulation of DiD regression models.',
        required: true,
        acceptedFileTypes: ['.pdf', '.docx'],
        instructions:
          'Include regression formulas, dependent/independent variable descriptions.',
      },
      {
        id: 'req-2-2',
        type: 'text',
        title: 'Model Summary Observation',
        description: 'Key statistical findings from initial runs.',
        required: true,
        instructions:
          'Summarize R-squared and p-values of labor participation coefficients.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [],
    createdAt: '2026-10-03',
    updatedAt: '2026-10-03',
  },
  {
    id: 'TSK-03',
    title: 'Pilot Survey Instrument Design & CAPI Protocol Testing',
    description:
      'Design digital CAPI questionnaire for block-level household field interviews. Validate skip logic, multilingual prompts (Hindi/English), and offline caching.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-PM-01',
    creatorName: 'Priya Sharma',
    creatorRole: 'Project Manager',
    assigneeId: 'EMP-FL-01',
    assigneeName: 'Aakash Mehta',
    assigneeRole: 'Fellow',
    reviewerId: 'EMP-PM-01',
    reviewerName: 'Priya Sharma',
    reviewerRole: 'Project Manager',
    priority: 'High',
    status: 'In Review',
    startDate: '2026-10-04',
    dueDate: '2026-10-18',
    requiresReview: true,
    reviewStatus: 'Pending',
    reviewFeedback: null,
    submittedAt: '2026-10-08 04:30 PM',
    labels: ['Survey Design', 'CAPI', 'Field Tools'],
    attachments: ['Household_CAPI_Instrument_v3.pdf'],
    checklist: [
      {
        id: 'c1',
        text: 'Draft 48 household survey questionnaire items',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Verify skip logic and conditional rendering',
        completed: true,
      },
      {
        id: 'c3',
        text: 'Field tester rehearsal with 5 enumerators',
        completed: true,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-FL-01',
        authorName: 'Aakash Mehta',
        authorRole: 'Fellow',
        content:
          'Questionnaire finalized and submitted for review. Skip logic and Hindi translation tested on tablets.',
        createdAt: '2026-10-08 04:30 PM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Priya Sharma',
        actorRole: 'Project Manager',
        action: 'Task Created',
        details: 'Assigned to Aakash Mehta (Fellow).',
        timestamp: '2026-10-04 11:00 AM',
      },
      {
        id: 'tm2',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Submitted for Review',
        details: 'Submitted for Project Manager approval.',
        timestamp: '2026-10-08 04:30 PM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-3-1',
        type: 'document',
        title: 'Household CAPI Questionnaire Instrument',
        description:
          'Full bilingual survey instrument with conditional skip patterns.',
        required: true,
        acceptedFileTypes: ['.pdf', '.docx'],
        instructions: 'Upload verified questionnaire PDF version 3.',
      },
      {
        id: 'req-3-2',
        type: 'text',
        title: 'CAPI Field Testing Summary',
        description: 'Report on 5-enumerator pilot dry run.',
        required: true,
        instructions: 'Detail any UI bottlenecks or tablet sync delays.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [
      {
        id: 'sub-3-1',
        taskId: 'TSK-03',
        version: 1,
        submittedAt: '2026-10-08 04:30 PM',
        submittedBy: 'EMP-FL-01',
        submitterName: 'Aakash Mehta',
        submitterRole: 'Fellow',
        notes:
          'Questionnaire finalized and tested on tablets. Skip logic and Hindi translations verified.',
        evidence: [
          {
            id: 'ev-3-1',
            requirementId: 'req-3-1',
            type: 'document',
            title: 'Household CAPI Instrument v3',
            fileName: 'Household_CAPI_Instrument_v3.pdf',
            fileSize: '1.4 MB',
            mimeType: 'application/pdf',
            uploadedAt: '2026-10-08 04:15 PM',
            uploadedBy: 'EMP-FL-01',
            uploaderName: 'Aakash Mehta',
            uploaderRole: 'Fellow',
          },
          {
            id: 'ev-3-2',
            requirementId: 'req-3-2',
            type: 'text',
            title: 'Dry Run Observations',
            textResponse:
              'Completed 5 mock household interviews. Average interview duration was 22 minutes. Skip logic functioning properly.',
            uploadedAt: '2026-10-08 04:20 PM',
            uploadedBy: 'EMP-FL-01',
            uploaderName: 'Aakash Mehta',
            uploaderRole: 'Fellow',
          },
        ],
        status: 'Pending',
      },
    ],
    createdAt: '2026-10-04',
    updatedAt: '2026-10-08',
  },
  {
    id: 'TSK-04',
    title: 'Hospital Facility Survey Sample Frame Revision',
    description:
      'Verify bed census, intensive care equipment availability, and medical staff count data from 18 community health centres (CHCs).',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    creatorId: 'EMP-PM-01',
    creatorName: 'Priya Sharma',
    creatorRole: 'Project Manager',
    assigneeId: 'EMP-FL-02',
    assigneeName: 'Sneha Patel',
    assigneeRole: 'Fellow',
    reviewerId: 'EMP-PM-01',
    reviewerName: 'Priya Sharma',
    reviewerRole: 'Project Manager',
    priority: 'Medium',
    status: 'Changes Requested',
    startDate: '2026-10-05',
    dueDate: '2026-10-22',
    requiresReview: true,
    reviewStatus: 'Revision Requested',
    reviewFeedback:
      'Please reconcile CHC bed capacities with National Health Mission (NHM) official dashboard numbers before final sign-off.',
    reviewedAt: '2026-10-08 02:15 PM',
    labels: ['Healthcare', 'Facility Audit', 'Revision'],
    attachments: ['CHC_Facility_Bed_Audit.xlsx'],
    checklist: [
      {
        id: 'c1',
        text: 'Cross-reference hospital registrations with state NHM registry',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Reconcile oxygen generator capacity numbers',
        completed: false,
      },
      {
        id: 'c3',
        text: 'Update revision notes in Excel annexure',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-PM-01',
        authorName: 'Priya Sharma',
        authorRole: 'Project Manager',
        content:
          '⚠️ Review Feedback: Please reconcile CHC bed capacities with National Health Mission (NHM) official dashboard numbers before final sign-off.',
        createdAt: '2026-10-08 02:15 PM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Priya Sharma',
        actorRole: 'Project Manager',
        action: 'Task Created',
        details: 'Assigned to Sneha Patel (Fellow).',
        timestamp: '2026-10-05 09:00 AM',
      },
      {
        id: 'tm2',
        actorName: 'Priya Sharma',
        actorRole: 'Project Manager',
        action: 'Changes Requested',
        details:
          'Returned for revisions: Reconcile with NHM dashboard numbers.',
        timestamp: '2026-10-08 02:15 PM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-4-1',
        type: 'document',
        title: 'CHC Facility Bed & Infrastructure Audit Sheet',
        description: 'Tabular audit sheet covering 18 CHCs.',
        required: true,
        acceptedFileTypes: ['.xlsx', '.csv', '.pdf'],
        instructions: 'Reconcile numbers with official NHM registry.',
      },
      {
        id: 'req-4-2',
        type: 'text',
        title: 'Bed Capacity Reconciliation Notes',
        description:
          'Explanatory notes on discrepancies between ground audit and NHM records.',
        required: true,
        instructions: 'List each CHC where variance exceeds 10%.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [
      {
        id: 'sub-4-1',
        taskId: 'TSK-04',
        version: 1,
        submittedAt: '2026-10-07 05:00 PM',
        submittedBy: 'EMP-FL-02',
        submitterName: 'Sneha Patel',
        submitterRole: 'Fellow',
        notes: 'Initial audit numbers compiled for 18 CHCs.',
        evidence: [
          {
            id: 'ev-4-1',
            requirementId: 'req-4-1',
            type: 'document',
            title: 'CHC Facility Bed Audit Sheet',
            fileName: 'CHC_Facility_Bed_Audit.xlsx',
            fileSize: '850 KB',
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadedAt: '2026-10-07 04:45 PM',
            uploadedBy: 'EMP-FL-02',
            uploaderName: 'Sneha Patel',
            uploaderRole: 'Fellow',
          },
        ],
        status: 'Changes Requested',
        decision: 'Changes Requested',
        decidedAt: '2026-10-08 02:15 PM',
        decidedBy: 'EMP-PM-01',
        reviewerName: 'Priya Sharma',
        reviewerRole: 'Project Manager',
        reviewerFeedback:
          'Please reconcile CHC bed capacities with National Health Mission (NHM) official dashboard numbers before final sign-off.',
      },
    ],
    createdAt: '2026-10-05',
    updatedAt: '2026-10-08',
  },
  {
    id: 'TSK-05',
    title: 'Clean Longitudinal Household Survey Sample Weights',
    description:
      'Generate post-stratification sampling weights for rural and urban stratum respondents across 52 district census clusters.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-RA-01',
    creatorName: 'Dr. Vikramaditya',
    creatorRole: 'Research Analyst',
    assigneeId: 'EMP-FL-04',
    assigneeName: 'Rahul Sharma',
    assigneeRole: 'Fellow',
    reviewerId: 'EMP-RA-01',
    reviewerName: 'Dr. Vikramaditya',
    reviewerRole: 'Research Analyst',
    priority: 'Medium',
    status: 'To Do',
    startDate: '2026-10-10',
    dueDate: '2026-10-28',
    requiresReview: true,
    reviewStatus: null,
    reviewFeedback: null,
    labels: ['Sampling', 'Statistics', 'Weights'],
    attachments: [],
    checklist: [
      {
        id: 'c1',
        text: 'Download Census 2011 baseline village population weights',
        completed: false,
      },
      {
        id: 'c2',
        text: 'Run iterative proportional fitting (raking) algorithm in Python',
        completed: false,
      },
    ],
    comments: [],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Dr. Vikramaditya',
        actorRole: 'Research Analyst',
        action: 'Task Created',
        details: 'Assigned to Rahul Sharma (Fellow). Priority: Medium.',
        timestamp: '2026-10-06 02:00 PM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-5-1',
        type: 'document',
        title: 'Village Post-Stratification Sample Weights CSV',
        description: 'Census 2011 normalized weight tables.',
        required: true,
        acceptedFileTypes: ['.csv', '.xlsx'],
        instructions: 'Export generated raked weights with district codes.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [],
    createdAt: '2026-10-06',
    updatedAt: '2026-10-06',
  },
  {
    id: 'TSK-06',
    title: 'Pilot Data Collection in Sehore District Blocks',
    description:
      'Conduct on-ground pilot survey across 30 respondent households in Ashta and Ichhawar blocks. Audit GPS location stamps and verify response completeness.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    surveyId: 'survey-01',
    surveyTitle: 'Block Livelihood Survey — Q3 2026',
    assignmentMode: 'Individual',
    creatorId: 'EMP-FL-01',
    creatorName: 'Aakash Mehta',
    creatorRole: 'Fellow',
    assigneeId: 'EMP-IN-01',
    assigneeName: 'Rohan Verma',
    assigneeRole: 'Intern',
    reviewerId: 'EMP-FL-01',
    reviewerName: 'Aakash Mehta',
    reviewerRole: 'Fellow',
    priority: 'High',
    status: 'In Review',
    startDate: '2026-10-05',
    dueDate: '2026-10-16',
    requiresReview: true,
    reviewStatus: 'Pending',
    reviewFeedback: null,
    submittedAt: '2026-10-08 05:00 PM',
    labels: ['Fieldwork', 'Sehore Pilot', 'Data Collection'],
    attachments: ['Sehore_Pilot_Batch_A.csv'],
    checklist: [
      {
        id: 'c1',
        text: 'Collect 15 interviews in Ashta block',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Collect 15 interviews in Ichhawar block',
        completed: true,
      },
      {
        id: 'c3',
        text: 'Upload audio consent recordings to central drive',
        completed: true,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-IN-01',
        authorName: 'Rohan Verma',
        authorRole: 'Intern',
        content:
          'Completed all 30 field questionnaires in Sehore. Audio audit clips and CSV records submitted for supervisor review.',
        createdAt: '2026-10-08 05:00 PM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Task Created',
        details: 'Assigned to Rohan Verma (Intern).',
        timestamp: '2026-10-05 10:00 AM',
      },
      {
        id: 'tm2',
        actorName: 'Rohan Verma',
        actorRole: 'Intern',
        action: 'Submitted for Review',
        details: 'Submitted for Fellow approval.',
        timestamp: '2026-10-08 05:00 PM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-6-1',
        type: 'photo',
        title: 'Field Interview Photographs (Min 2)',
        description:
          'Geotagged photographs of enumerators conducting CAPI interviews.',
        required: true,
        minCount: 2,
        acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
        instructions:
          'Photograph interviewer and respondent in Ashta and Ichhawar blocks with visible tablet screen.',
      },
      {
        id: 'req-6-2',
        type: 'voice',
        title: 'Respondent Voice Note / Community Feedback',
        description:
          'Audio recording of respondent perspective on public services.',
        required: true,
        maxDurationSeconds: 120,
        instructions:
          'Record 30-90 seconds verbal feedback regarding open network service accessibility.',
      },
      {
        id: 'req-6-3',
        type: 'document',
        title: 'Sehore Pilot Dataset Export (CSV)',
        description: 'Raw questionnaire export file.',
        required: true,
        acceptedFileTypes: ['.csv', '.xlsx'],
        instructions:
          'Export completed response matrix with timestamps and surveyor IDs.',
      },
      {
        id: 'req-6-4',
        type: 'text',
        title: 'Field Observation & Enumerator Log',
        description: 'Written qualitative field summary.',
        required: true,
        instructions:
          'Document connectivity challenges, language comprehension, and survey refusal rates.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [
      {
        id: 'sub-6-1',
        taskId: 'TSK-06',
        version: 1,
        submittedAt: '2026-10-08 05:00 PM',
        submittedBy: 'EMP-IN-01',
        submitterName: 'Rohan Verma',
        submitterRole: 'Intern',
        notes:
          'Completed all 30 field questionnaires in Sehore. Audio audit clips and CSV records submitted for supervisor review.',
        evidence: [
          {
            id: 'ev-6-1',
            requirementId: 'req-6-1',
            type: 'photo',
            title: 'Ashta Block Household Interview #12',
            fileName: 'sehore_interview_ashta_12.jpg',
            fileSize: '2.1 MB',
            mimeType: 'image/jpeg',
            uploadedAt: '2026-10-08 04:30 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
            caption: 'Interview conducted with farmer family in Ashta block.',
          },
          {
            id: 'ev-6-2',
            requirementId: 'req-6-1',
            type: 'photo',
            title: 'Ichhawar Block Household Interview #24',
            fileName: 'sehore_interview_ichhawar_24.jpg',
            fileSize: '1.9 MB',
            mimeType: 'image/jpeg',
            uploadedAt: '2026-10-08 04:35 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
            caption: 'Youth respondent answering skill training questions.',
          },
          {
            id: 'ev-6-3',
            requirementId: 'req-6-2',
            type: 'voice',
            title: 'Village Elder Voice Recording',
            fileName: 'sehore_audio_memo_01.m4a',
            fileSize: '840 KB',
            mimeType: 'audio/mp4',
            durationSeconds: 54,
            uploadedAt: '2026-10-08 04:42 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
            caption:
              'Community leader shares insights on local connectivity and vocational needs.',
          },
          {
            id: 'ev-6-4',
            requirementId: 'req-6-3',
            type: 'document',
            title: 'Sehore Pilot Raw Dataset Batch A',
            fileName: 'Sehore_Pilot_Batch_A.csv',
            fileSize: '340 KB',
            mimeType: 'text/csv',
            uploadedAt: '2026-10-08 04:48 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
          },
          {
            id: 'ev-6-5',
            requirementId: 'req-6-4',
            type: 'text',
            title: 'Field Enumeration Summary',
            textResponse:
              'Completed 30 household surveys across Ashta and Ichhawar. Connectivity in interior hamlets was intermittent, but offline CAPI caching functioned as intended. Community reception was cooperative.',
            uploadedAt: '2026-10-08 04:55 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
          },
        ],
        status: 'Pending',
      },
    ],
    createdAt: '2026-10-05',
    updatedAt: '2026-10-08',
  },
  {
    id: 'TSK-07',
    title: 'Audit Health Center Solar Inverter Installations',
    description:
      'Inspect 8 Primary Health Centres (PHCs) in Raisen district. Record solar inverter backup capacity and cold chain vaccine refrigerator connectivity.',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    creatorId: 'EMP-FL-02',
    creatorName: 'Sneha Patel',
    creatorRole: 'Fellow',
    assigneeId: 'EMP-IN-03',
    assigneeName: 'Manish Tiwari',
    assigneeRole: 'Intern',
    reviewerId: 'EMP-FL-02',
    reviewerName: 'Sneha Patel',
    reviewerRole: 'Fellow',
    priority: 'Medium',
    status: 'In Progress',
    startDate: '2026-10-09',
    dueDate: '2026-10-24',
    requiresReview: true,
    reviewStatus: null,
    reviewFeedback: null,
    labels: ['Health Facility', 'Audit', 'Field Verification'],
    attachments: [],
    checklist: [
      {
        id: 'c1',
        text: 'Geotag 8 PHC solar battery backup rooms',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Record functional status of solar generator units',
        completed: false,
      },
    ],
    comments: [],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Sneha Patel',
        actorRole: 'Fellow',
        action: 'Task Created',
        details:
          'Assigned to Manish Tiwari (Intern). Configured with 3 mandatory evidence requirements.',
        timestamp: '2026-10-09 09:30 AM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-7-1',
        type: 'photo',
        title: 'PHC Solar Inverter & Battery Bank Photos (Min 2)',
        description:
          'Clear photographs of the power backup system at rural health facilities.',
        required: true,
        minCount: 2,
        acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
        instructions:
          'Capture overall view of battery rack and close-up of inverter control panel.',
      },
      {
        id: 'req-7-2',
        type: 'voice',
        title: 'Cold Chain Nurse Audio Note',
        description: 'Interview on frequency of grid power cuts.',
        required: true,
        maxDurationSeconds: 90,
        instructions:
          'Record nurse interview regarding vaccine temperature maintenance during outages.',
      },
      {
        id: 'req-7-3',
        type: 'text',
        title: 'Inverter Functional Audit Log',
        description: 'Specification and functional status record.',
        required: true,
        instructions:
          'List generator make, capacity (kVA), battery age, and backup runtime in hours.',
      },
    ],
    currentEvidenceDraft: [
      {
        id: 'ev-7-1',
        requirementId: 'req-7-1',
        type: 'photo',
        title: 'Raisen PHC 1 Battery Rack',
        fileName: 'raisen_phc_solar_rack_01.jpg',
        fileSize: '1.8 MB',
        mimeType: 'image/jpeg',
        uploadedAt: '2026-10-09 11:20 AM',
        uploadedBy: 'EMP-IN-03',
        uploaderName: 'Manish Tiwari',
        uploaderRole: 'Intern',
        caption: 'Lead-acid battery bank inspected at Raisen PHC 1.',
      },
    ],
    submissions: [],
    createdAt: '2026-10-09',
    updatedAt: '2026-10-09',
  },
  {
    id: 'TSK-08',
    title: 'Compile August Monthly Attendance and Field Bio-metrics',
    description:
      'Consolidate biometric attendance summaries and field travel vouchers for the August monthly review.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-FL-01',
    creatorName: 'Aakash Mehta',
    creatorRole: 'Fellow',
    assigneeId: 'EMP-IN-01',
    assigneeName: 'Rohan Verma',
    assigneeRole: 'Intern',
    reviewerId: 'EMP-FL-01',
    reviewerName: 'Aakash Mehta',
    reviewerRole: 'Fellow',
    priority: 'Low',
    status: 'Completed',
    startDate: '2026-08-25',
    dueDate: '2026-09-05',
    requiresReview: true,
    reviewStatus: 'Approved',
    reviewFeedback: 'All vouchers reconciled with account records.',
    reviewedAt: '2026-09-05 04:00 PM',
    labels: ['Administration', 'Monthly Review'],
    attachments: ['August_Attendance_Reconciled.pdf'],
    checklist: [
      { id: 'c1', text: 'Export bio-metric logs from portal', completed: true },
      {
        id: 'c2',
        text: 'Reconcile leave approvals with section officer',
        completed: true,
      },
    ],
    comments: [],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Task Created',
        details: 'Assigned to Rohan Verma (Intern).',
        timestamp: '2026-08-25 10:00 AM',
      },
      {
        id: 'tm2',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Review Approved',
        details: 'Approved completion. Task closed.',
        timestamp: '2026-09-05 04:00 PM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-8-1',
        type: 'document',
        title: 'Reconciled Attendance & Voucher Summary',
        description: 'Signed attendance and travel log.',
        required: true,
        acceptedFileTypes: ['.pdf'],
        instructions: 'Upload signed reconciliation sheet.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [
      {
        id: 'sub-8-1',
        taskId: 'TSK-08',
        version: 1,
        submittedAt: '2026-09-04 03:00 PM',
        submittedBy: 'EMP-IN-01',
        submitterName: 'Rohan Verma',
        submitterRole: 'Intern',
        notes: 'Compiled and cross-checked with bio-metric portal records.',
        evidence: [
          {
            id: 'ev-8-1',
            requirementId: 'req-8-1',
            type: 'document',
            title: 'August Attendance Reconciled Sheet',
            fileName: 'August_Attendance_Reconciled.pdf',
            fileSize: '620 KB',
            mimeType: 'application/pdf',
            uploadedAt: '2026-09-04 02:45 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
          },
        ],
        status: 'Approved',
        decision: 'Approved',
        decidedAt: '2026-09-05 04:00 PM',
        decidedBy: 'EMP-FL-01',
        reviewerName: 'Aakash Mehta',
        reviewerRole: 'Fellow',
        reviewerFeedback: 'All vouchers reconciled with account records.',
      },
    ],
    createdAt: '2026-08-25',
    updatedAt: '2026-09-05',
  },
  {
    id: 'TSK-09',
    title: 'Water Quality Testing in Arsenic Affected Habitations',
    description:
      'Field sample testing of 35 community handpumps and testing using field test kits (FTKs) in Dhar district clusters.',
    projectId: 'PRJ-02',
    projectName: 'Evaluation of Rural Healthcare Infrastructure',
    creatorId: 'EMP-FL-01',
    creatorName: 'Aakash Mehta',
    creatorRole: 'Fellow',
    assigneeId: 'EMP-IN-01',
    assigneeName: 'Rohan Verma',
    assigneeRole: 'Intern',
    reviewerId: 'EMP-FL-01',
    reviewerName: 'Aakash Mehta',
    reviewerRole: 'Fellow',
    priority: 'Critical',
    status: 'To Do',
    startDate: '2026-09-01',
    dueDate: '2026-09-18', // Past date -> demonstrates Overdue status filter
    requiresReview: true,
    reviewStatus: null,
    reviewFeedback: null,
    labels: ['Water', 'Public Health', 'High Priority'],
    attachments: ['Dhar_Water_Clusters.pdf'],
    checklist: [
      {
        id: 'c1',
        text: 'Collect water sample vials with geo-tags',
        completed: false,
      },
      {
        id: 'c2',
        text: 'Upload arsenic chemical reaction test strips',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-FL-01',
        authorName: 'Aakash Mehta',
        authorRole: 'Fellow',
        content:
          'This task is past its targeted due date. Please prioritize immediately.',
        createdAt: '2026-09-20 10:00 AM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Task Created',
        details: 'Assigned to Rohan Verma (Intern).',
        timestamp: '2026-09-01 09:00 AM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-9-1',
        type: 'photo',
        title: 'FTK Chemical Reaction Test Strips (Min 1)',
        description:
          'High-contrast photo of arsenic reaction test strip against reference color chart.',
        required: true,
        minCount: 1,
        acceptedFileTypes: ['.jpg', '.png'],
        instructions:
          'Place test strip beside color chart in daylight and photograph within 5 minutes of reaction.',
      },
      {
        id: 'req-9-2',
        type: 'document',
        title: 'Water Sample GPS Log Sheet',
        description: 'Geotagged testing log sheet with handpump IDs.',
        required: true,
        acceptedFileTypes: ['.pdf', '.xlsx'],
        instructions:
          'Include latitude, longitude, habitation name, and FTK kit serial number.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [],
    createdAt: '2026-09-01',
    updatedAt: '2026-09-01',
  },
  {
    id: 'TSK-10',
    title: 'Village Anganwadi Nutrition Center Infrastructure Verification',
    description:
      'Inspect supplementary nutrition food storage, infant weighing scale condition, and child attendance records across 5 Anganwadi centers in Sehore block.',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    creatorId: 'EMP-FL-01',
    creatorName: 'Aakash Mehta',
    creatorRole: 'Fellow',
    assigneeId: 'EMP-IN-01',
    assigneeName: 'Rohan Verma',
    assigneeRole: 'Intern',
    reviewerId: 'EMP-FL-01',
    reviewerName: 'Aakash Mehta',
    reviewerRole: 'Fellow',
    priority: 'High',
    status: 'Changes Requested',
    startDate: '2026-10-03',
    dueDate: '2026-10-14',
    requiresReview: true,
    reviewStatus: 'Revision Requested',
    reviewFeedback:
      'The voice note was incomplete and only 1 photo was provided. Please capture 2 clear photos of the weighing scale and food storage room, and re-record the voice summary with the Anganwadi worker.',
    reviewedAt: '2026-10-07 11:00 AM',
    labels: ['Nutrition', 'Anganwadi', 'Field Verification'],
    attachments: ['Anganwadi_Audit_Checklist.pdf'],
    checklist: [
      {
        id: 'c1',
        text: 'Verify Salter infant weighing scale calibration',
        completed: true,
      },
      {
        id: 'c2',
        text: 'Inspect supplementary nutrition dry ration stocks',
        completed: true,
      },
      {
        id: 'c3',
        text: 'Document preschool education corner presence',
        completed: false,
      },
    ],
    comments: [
      {
        id: 'cm1',
        authorId: 'EMP-FL-01',
        authorName: 'Aakash Mehta',
        authorRole: 'Fellow',
        content:
          '⚠️ Review Feedback: The voice note was incomplete and only 1 photo was provided. Please capture 2 clear photos of the weighing scale and food storage room, and re-record the voice summary with the Anganwadi worker.',
        createdAt: '2026-10-07 11:00 AM',
      },
    ],
    timeline: [
      {
        id: 'tm1',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Task Created',
        details: 'Assigned to Rohan Verma (Intern). Priority: High.',
        timestamp: '2026-10-03 09:30 AM',
      },
      {
        id: 'tm2',
        actorName: 'Rohan Verma',
        actorRole: 'Intern',
        action: 'Submitted for Review',
        details: 'Submitted initial deliverables.',
        timestamp: '2026-10-06 04:30 PM',
      },
      {
        id: 'tm3',
        actorName: 'Aakash Mehta',
        actorRole: 'Fellow',
        action: 'Changes Requested',
        details:
          'Returned with feedback: "The voice note was incomplete and only 1 photo was provided..."',
        timestamp: '2026-10-07 11:00 AM',
      },
    ],
    evidenceRequirements: [
      {
        id: 'req-10-1',
        type: 'photo',
        title: 'Anganwadi Storage & Weighing Scale Photos (Min 2)',
        description: 'Photographs of nutrition storage room and infant scale.',
        required: true,
        minCount: 2,
        acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
        instructions:
          'Photograph food stock sacks and weighing balance with needle indicator.',
      },
      {
        id: 'req-10-2',
        type: 'voice',
        title: 'Anganwadi Worker Audio Summary',
        description:
          'Voice note summarizing monthly ration delivery regularity.',
        required: true,
        maxDurationSeconds: 120,
        instructions:
          'Record Anganwadi worker explaining stock supply timing and beneficiary coverage.',
      },
      {
        id: 'req-10-3',
        type: 'text',
        title: 'Infrastructure Observation Notes',
        description: 'Written summary of center condition.',
        required: true,
        instructions:
          'Note drinking water, electricity, and toilet availability.',
      },
    ],
    currentEvidenceDraft: [],
    submissions: [
      {
        id: 'sub-10-1',
        taskId: 'TSK-10',
        version: 1,
        submittedAt: '2026-10-06 04:30 PM',
        submittedBy: 'EMP-IN-01',
        submitterName: 'Rohan Verma',
        submitterRole: 'Intern',
        notes: 'Initial site visit completed at Sehore Anganwadi Centre #4.',
        evidence: [
          {
            id: 'ev-10-1',
            requirementId: 'req-10-1',
            type: 'photo',
            title: 'Anganwadi Center Entrance',
            fileName: 'anganwadi_front.jpg',
            fileSize: '1.5 MB',
            mimeType: 'image/jpeg',
            uploadedAt: '2026-10-06 03:00 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
          },
          {
            id: 'ev-10-2',
            requirementId: 'req-10-3',
            type: 'text',
            title: 'Infrastructure Notes',
            textResponse:
              'Center open on Tuesday. Supplementary nutrition packets available. Clean drinking water available from school campus.',
            uploadedAt: '2026-10-06 03:15 PM',
            uploadedBy: 'EMP-IN-01',
            uploaderName: 'Rohan Verma',
            uploaderRole: 'Intern',
          },
        ],
        status: 'Changes Requested',
        decision: 'Changes Requested',
        decidedAt: '2026-10-07 11:00 AM',
        decidedBy: 'EMP-FL-01',
        reviewerName: 'Aakash Mehta',
        reviewerRole: 'Fellow',
        reviewerFeedback:
          'The voice note was incomplete and only 1 photo was provided. Please capture 2 clear photos of the weighing scale and food storage room, and re-record the voice summary with the Anganwadi worker.',
      },
    ],
    createdAt: '2026-10-03',
    updatedAt: '2026-10-07',
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // LocalStorage read error fallback
  }
  return defaultVal;
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    emitStoreChange();
  } catch {
    // LocalStorage write error fallback
  }
}

// ── Activity Task Store Singleton ──
export const ActivityTaskStore = {
  // ── Employees & Hierarchy ──
  getEmployees(): Employee[] {
    const list = getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (!list || list.length === 0) {
      setStored(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }
    return list;
  },

  saveEmployees(employees: Employee[]): void {
    setStored(STORAGE_KEYS.EMPLOYEES, employees);
  },

  saveEmployee(
    data: Partial<Employee> & {
      name: string;
      role: OrgRole;
      email: string;
      designation: string;
    }
  ): Employee {
    if (data.id) {
      this.updateEmployee(data.id, data);
      return this.getEmployeeById(data.id)!;
    }
    return this.createEmployee({
      name: data.name,
      role: data.role,
      email: data.email,
      designation: data.designation,
      department: data.department || 'Governance & Public Administration',
      reportsTo: data.reportsTo ?? null,
      avatarColor: data.avatarColor || '#2563eb',
      employeeCode: data.employeeCode,
      centerId: data.centerId,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  },

  getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find(e => e.id === id);
  },

  getActiveUser(): Employee {
    const storedId = getStored<string>(STORAGE_KEYS.ACTIVE_USER, 'EMP-CH-01');
    const employees = this.getEmployees();
    return employees.find(e => e.id === storedId) || employees[0];
  },

  setActiveUser(id: string): void {
    setStored(STORAGE_KEYS.ACTIVE_USER, id);
  },

  /**
   * Returns employees who directly report to `employeeId`
   */
  getDirectReports(employeeId: string): Employee[] {
    const employees = this.getEmployees();
    return employees.filter(e => e.reportsTo === employeeId);
  },

  /**
   * Recursively finds all subordinate employee IDs under `employeeId`
   */
  getAllSubordinateIds(employeeId: string): string[] {
    const direct = this.getDirectReports(employeeId);
    let ids: string[] = direct.map(d => d.id);
    for (const d of direct) {
      ids = ids.concat(this.getAllSubordinateIds(d.id));
    }
    return ids;
  },

  /**
   * Hierarchy reporting chain upwards:
   * e.g. Intern -> Fellow -> Project Manager -> Center Head
   */
  getReportingChain(employeeId: string): Employee[] {
    const chain: Employee[] = [];
    let current = this.getEmployeeById(employeeId);
    while (current) {
      chain.push(current);
      if (current.reportsTo) {
        current = this.getEmployeeById(current.reportsTo);
      } else {
        break;
      }
    }
    return chain;
  },

  /**
   * Check if user is authorized to create tasks
   */
  /**
   * Check if user is authorized to create tasks.
   * Core policy: Interns NEVER create tasks.
   * Fellows can create tasks only if they have subordinate interns to delegate to.
   */
  canCreateTasks(role: OrgRole | string, employeeId?: string): boolean {
    if (role === 'Intern') return false;
    if (role === 'Fellow') {
      if (!employeeId) return true;
      return this.getDirectReports(employeeId).some(r => r.role === 'Intern');
    }
    return true;
  },

  /**
   * Check if user is authorized to configure task evidence requirements.
   */
  canConfigureEvidenceRequirements(role: OrgRole | string): boolean {
    return role !== 'Intern';
  },

  /**
   * Get eligible assignees for the current user based on strict hierarchy rules
   */
  getEligibleAssignees(currentUser: { id: string; role: string }): Employee[] {
    const all = this.getEmployees();

    switch (currentUser.role) {
      case 'Center Head':
      case 'Super Admin':
        return all.filter(
          e =>
            e.id !== currentUser.id &&
            (e.role === 'Project Manager' || e.role === 'Research Analyst')
        );

      case 'Project Manager':
      case 'Research Analyst':
        return all.filter(
          e => e.role === 'Fellow' && e.reportsTo === currentUser.id
        );

      case 'Fellow':
        return all.filter(
          e => e.role === 'Intern' && e.reportsTo === currentUser.id
        );

      case 'Intern':
      default:
        return [];
    }
  },

  canAssignTo(
    creator: { id: string; role: string },
    assignee: { id: string }
  ): boolean {
    const eligible = this.getEligibleAssignees(creator);
    return eligible.some(e => e.id === assignee.id);
  },

  updateReportingRelationship(
    employeeId: string,
    newManagerId: string | null
  ): boolean {
    const employees = this.getEmployees();
    const idx = employees.findIndex(e => e.id === employeeId);
    if (idx !== -1) {
      employees[idx] = { ...employees[idx], reportsTo: newManagerId };
      this.saveEmployees(employees);
      return true;
    }
    return false;
  },

  /**
   * Prevents circular reporting hierarchies (e.g., A reports to B, B reports to A)
   */
  validateReportingLoop(
    employeeId: string,
    candidateSupervisorId: string
  ): boolean {
    if (employeeId === candidateSupervisorId) return false;
    let currentId: string | null = candidateSupervisorId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === employeeId) return false; // Cycle detected
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      const emp = this.getEmployeeById(currentId);
      currentId = emp ? emp.reportsTo : null;
    }
    return true;
  },

  createEmployee(data: Omit<Employee, 'id'> & { id?: string }): Employee {
    const employees = this.getEmployees();
    const rolePrefixes: Record<OrgRole, string> = {
      'Center Head': 'EMP-CH',
      'Project Manager': 'EMP-PM',
      'Research Analyst': 'EMP-RA',
      Fellow: 'EMP-FL',
      Intern: 'EMP-IN',
    };
    const prefix = rolePrefixes[data.role] || 'EMP-ST';
    const roleCount = employees.filter(e => e.role === data.role).length + 1;
    const newId = data.id || `${prefix}-${String(roleCount).padStart(2, '0')}`;
    const newEmp: Employee = {
      ...data,
      id: newId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      avatarColor: data.avatarColor || '#2563eb',
    };
    employees.push(newEmp);
    this.saveEmployees(employees);
    return newEmp;
  },

  updateEmployee(id: string, updates: Partial<Employee>): boolean {
    const employees = this.getEmployees();
    const idx = employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      employees[idx] = { ...employees[idx], ...updates };
      this.saveEmployees(employees);
      return true;
    }
    return false;
  },

  toggleEmployeeActive(id: string): boolean {
    const employees = this.getEmployees();
    const idx = employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      const current = employees[idx].isActive !== false;
      employees[idx].isActive = !current;
      this.saveEmployees(employees);
      return true;
    }
    return false;
  },

  // ── Tasks Operations ──
  getTasks(): ActivityTask[] {
    const list = getStored<ActivityTask[]>(STORAGE_KEYS.TASKS, []);
    if (!list || list.length === 0) {
      setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    // Backward-compatibility migration: ensure evidenceRequirements, currentEvidenceDraft, submissions, and survey fields exist
    return list.map(t => {
      const defaultTask = DEFAULT_TASKS.find(dt => dt.id === t.id);
      return {
        ...t,
        surveyId: t.surveyId || defaultTask?.surveyId,
        surveyTitle: t.surveyTitle || defaultTask?.surveyTitle,
        assignmentMode:
          t.assignmentMode || defaultTask?.assignmentMode || 'Individual',
        groupName: t.groupName || defaultTask?.groupName,
        memberIds: t.memberIds || defaultTask?.memberIds,
        evidenceRequirements:
          t.evidenceRequirements || defaultTask?.evidenceRequirements || [],
        currentEvidenceDraft:
          t.currentEvidenceDraft || defaultTask?.currentEvidenceDraft || [],
        submissions: t.submissions || defaultTask?.submissions || [],
      };
    });
  },

  getTasksForSurvey(surveyId: string): ActivityTask[] {
    return this.getTasks().filter(t => t.surveyId === surveyId);
  },

  saveTasks(tasks: ActivityTask[]): void {
    setStored(STORAGE_KEYS.TASKS, tasks);
  },

  getTaskById(id: string): ActivityTask | undefined {
    return this.getTasks().find(t => t.id === id);
  },

  /**
   * Filters visible tasks based on the current user's role and hierarchy:
   */
  getVisibleTasksForUser(user: { id: string; role: string }): ActivityTask[] {
    const all = this.getTasks();

    if (user.role === 'Center Head' || user.role === 'Super Admin') {
      return all;
    }

    if (user.role === 'Project Manager' || user.role === 'Research Analyst') {
      const subordinateIds = this.getAllSubordinateIds(user.id);
      return all.filter(t => {
        return (
          t.assigneeId === user.id ||
          t.creatorId === user.id ||
          t.reviewerId === user.id ||
          subordinateIds.includes(t.assigneeId) ||
          subordinateIds.includes(t.creatorId)
        );
      });
    }

    if (user.role === 'Fellow') {
      const internIds = this.getDirectReports(user.id).map(i => i.id);
      return all.filter(t => {
        return (
          t.assigneeId === user.id ||
          t.creatorId === user.id ||
          t.reviewerId === user.id ||
          internIds.includes(t.assigneeId)
        );
      });
    }

    // Intern: strictly their assigned tasks
    return all.filter(t => t.assigneeId === user.id);
  },

  /**
   * Determine if a user has authorized visibility over a specific task and its evidence.
   */
  canUserViewTask(
    user: { id: string; role: string },
    task: ActivityTask
  ): boolean {
    if (user.role === 'Center Head' || user.role === 'Super Admin') return true;
    if (user.role === 'Project Manager' || user.role === 'Research Analyst') {
      const subordinateIds = this.getAllSubordinateIds(user.id);
      return (
        task.assigneeId === user.id ||
        task.creatorId === user.id ||
        task.reviewerId === user.id ||
        subordinateIds.includes(task.assigneeId) ||
        subordinateIds.includes(task.creatorId)
      );
    }
    if (user.role === 'Fellow') {
      const internIds = this.getDirectReports(user.id).map(i => i.id);
      return (
        task.assigneeId === user.id ||
        task.creatorId === user.id ||
        task.reviewerId === user.id ||
        internIds.includes(task.assigneeId)
      );
    }
    // Intern: strictly their assigned tasks
    return task.assigneeId === user.id;
  },

  // ── Scoped Query Methods ──
  getMyTasks(user: { id: string; role: string }): ActivityTask[] {
    return this.getVisibleTasksForUser(user).filter(
      t => t.assigneeId === user.id
    );
  },

  getTasksAssignedByMe(user: { id: string; role: string }): ActivityTask[] {
    return this.getVisibleTasksForUser(user).filter(
      t => t.creatorId === user.id && t.assigneeId !== user.id
    );
  },

  getTeamTasks(user: { id: string; role: string }): ActivityTask[] {
    if (user.role === 'Intern') return [];
    if (user.role === 'Center Head' || user.role === 'Super Admin') {
      return this.getTasks();
    }
    const subordinateIds = this.getAllSubordinateIds(user.id);
    return this.getVisibleTasksForUser(user).filter(
      t =>
        subordinateIds.includes(t.assigneeId) ||
        subordinateIds.includes(t.creatorId)
    );
  },

  getAwaitingMyReview(user: { id: string; role: string }): ActivityTask[] {
    if (user.role === 'Intern') return [];
    const visible = this.getVisibleTasksForUser(user);
    return visible.filter(t => {
      if (t.status !== 'In Review') return false;
      if (t.reviewerId === user.id) return true;
      if (t.creatorId === user.id) return true;
      if (user.role === 'Center Head' || user.role === 'Super Admin')
        return true;
      const subordinates = this.getAllSubordinateIds(user.id);
      return subordinates.includes(t.assigneeId);
    });
  },

  getScopedTasks(
    user: { id: string; role: string },
    scope: 'my' | 'assigned_by_me' | 'team' | 'review'
  ): ActivityTask[] {
    switch (scope) {
      case 'my':
        return this.getMyTasks(user);
      case 'assigned_by_me':
        return this.getTasksAssignedByMe(user);
      case 'team':
        return this.getTeamTasks(user);
      case 'review':
        return this.getAwaitingMyReview(user);
      default:
        return this.getVisibleTasksForUser(user);
    }
  },

  isReviewerForTask(
    user: { id: string; role: string },
    task: ActivityTask
  ): boolean {
    if (user.role === 'Intern') return false;
    if (task.reviewerId === user.id) return true;
    if (task.creatorId === user.id) return true;
    if (user.role === 'Center Head' || user.role === 'Super Admin') return true;
    const subordinates = this.getAllSubordinateIds(user.id);
    return subordinates.includes(task.assigneeId);
  },

  createTask(
    newTask: Omit<ActivityTask, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>
  ): ActivityTask {
    if (newTask.creatorRole === 'Intern') {
      throw new Error('Access Denied: Interns cannot create tasks.');
    }

    const list = this.getTasks();
    const nextNum = list.length + 1;
    const newId = `TSK-${nextNum < 10 ? '0' + nextNum : nextNum}`;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const task: ActivityTask = {
      ...newTask,
      id: newId,
      evidenceRequirements: newTask.evidenceRequirements || [],
      currentEvidenceDraft: newTask.currentEvidenceDraft || [],
      submissions: newTask.submissions || [],
      createdAt: dateStr,
      updatedAt: dateStr,
      timeline: [
        {
          id: `tm-${Date.now()}`,
          actorName: newTask.creatorName,
          actorRole: newTask.creatorRole,
          action: 'Task Created',
          details: `Assigned to ${newTask.assigneeName} (${newTask.assigneeRole}). Priority: ${newTask.priority}. Reviewer: ${newTask.reviewerName}.${newTask.evidenceRequirements?.length ? ` Configured with ${newTask.evidenceRequirements.length} evidence requirements.` : ''}`,
          timestamp: `${dateStr} ${timeStr}`,
        },
      ],
    };

    list.unshift(task);
    this.saveTasks(list);
    return task;
  },

  /**
   * Validate that all mandatory evidence requirements for a task have been satisfied.
   */
  validateEvidenceRequirements(
    requirements: EvidenceRequirement[],
    evidence: EvidenceItem[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!requirements || requirements.length === 0) {
      return { valid: true, errors: [] };
    }

    for (const req of requirements) {
      if (!req.required) continue;

      const itemsForReq = evidence.filter(e => e.requirementId === req.id);

      switch (req.type) {
        case 'photo': {
          const minCount = req.minCount || 1;
          if (itemsForReq.length < minCount) {
            errors.push(
              `"${req.title}": Requires at least ${minCount} photograph(s) (currently ${itemsForReq.length} attached).`
            );
          }
          break;
        }
        case 'voice': {
          if (itemsForReq.length === 0) {
            errors.push(
              `"${req.title}": Voice note / audio recording is mandatory.`
            );
          }
          break;
        }
        case 'video': {
          if (itemsForReq.length === 0) {
            errors.push(
              `"${req.title}": Video recording or video upload is mandatory.`
            );
          }
          break;
        }
        case 'document': {
          if (itemsForReq.length === 0) {
            errors.push(
              `"${req.title}": Document or report attachment is mandatory.`
            );
          }
          break;
        }
        case 'text': {
          const textItem = itemsForReq.find(
            i => i.textResponse && i.textResponse.trim().length > 0
          );
          if (!textItem || !textItem.textResponse?.trim()) {
            errors.push(
              `"${req.title}": Written response / field observation cannot be empty.`
            );
          }
          break;
        }
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Saves in-progress evidence drafts without freezing into formal submission.
   */
  saveEvidenceDraft(
    taskId: string,
    actor: { id: string; role: string },
    items: EvidenceItem[]
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    task.currentEvidenceDraft = items;
    this.saveTasks(list);
    return {
      success: true,
      message: 'Evidence draft saved successfully.',
      task,
    };
  },

  /**
   * Formally submits task with attached evidence for authorized supervisor verification.
   * Freezes evidence into an immutable, versioned TaskSubmission log.
   */
  submitTaskWithEvidence(
    taskId: string,
    actor: { id: string; name: string; role: string },
    evidenceItems: EvidenceItem[],
    notes?: string
  ): {
    success: boolean;
    message: string;
    errors?: string[];
    task?: ActivityTask;
  } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    // Strict validation of mandatory evidence
    const validation = this.validateEvidenceRequirements(
      task.evidenceRequirements || [],
      evidenceItems
    );
    if (!validation.valid) {
      return {
        success: false,
        message:
          'Submission rejected: Mandatory evidence requirements are incomplete.',
        errors: validation.errors,
      };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const currentSubmissions = task.submissions || [];
    const newVersion = currentSubmissions.length + 1;

    // Create immutable submission snapshot
    const submission: TaskSubmission = {
      id: `sub-${Date.now()}`,
      taskId,
      version: newVersion,
      submittedAt: `${dateStr} ${timeStr}`,
      submittedBy: actor.id,
      submitterName: actor.name,
      submitterRole: actor.role as OrgRole,
      notes: notes?.trim() || undefined,
      evidence: [...evidenceItems],
      status: 'Pending',
    };

    task.submissions = [...currentSubmissions, submission];
    task.currentEvidenceDraft = []; // Clear draft once submitted
    task.status = 'In Review';
    task.reviewStatus = 'Pending';
    task.submittedAt = `${dateStr} ${timeStr}`;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action:
        newVersion === 1
          ? 'Submitted for Review'
          : `Resubmitted for Review (v${newVersion})`,
      details: notes
        ? `${notes} [Attached ${evidenceItems.length} evidence items]`
        : `Submitted v${newVersion} with ${evidenceItems.length} verified evidence items to ${task.reviewerName}.`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    if (notes?.trim()) {
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: actor.id,
        authorName: actor.name,
        authorRole: actor.role as OrgRole,
        content: `📤 Submission v${newVersion} Note: ${notes.trim()} [${evidenceItems.length} evidence items attached]`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    }

    this.saveTasks(list);
    return {
      success: true,
      message: `Task submission (v${newVersion}) sent to ${task.reviewerName} with ${evidenceItems.length} evidence items.`,
      task,
    };
  },

  /**
   * Unified reviewer decision: Approve, Request Changes, or Reject
   */
  reviewTaskSubmission(
    taskId: string,
    reviewer: { id: string; name: string; role: string },
    decision: 'Approved' | 'Changes Requested' | 'Rejected',
    feedback?: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    if (!this.isReviewerForTask(reviewer, task)) {
      return {
        success: false,
        message: 'You are not authorized to review this task.',
      };
    }

    if (reviewer.id === task.assigneeId) {
      return {
        success: false,
        message: 'Assignees cannot review or approve their own submissions.',
      };
    }

    if (decision !== 'Approved' && (!feedback || !feedback.trim())) {
      return {
        success: false,
        message:
          'Feedback comments are mandatory when requesting revisions or rejecting a submission.',
      };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update latest submission if exists
    if (task.submissions && task.submissions.length > 0) {
      const latestSub = task.submissions[task.submissions.length - 1];
      latestSub.decision = decision;
      latestSub.status = decision;
      latestSub.decidedAt = `${dateStr} ${timeStr}`;
      latestSub.decidedBy = reviewer.id;
      latestSub.reviewerName = reviewer.name;
      latestSub.reviewerRole = reviewer.role as OrgRole;
      latestSub.reviewerFeedback = feedback?.trim();
    }

    task.reviewedAt = `${dateStr} ${timeStr}`;
    task.reviewFeedback = feedback?.trim() || null;

    if (decision === 'Approved') {
      task.status = 'Completed';
      task.reviewStatus = 'Approved';
      task.timeline.push({
        id: `tm-${Date.now()}`,
        actorName: reviewer.name,
        actorRole: reviewer.role as OrgRole,
        action: 'Review Approved',
        details:
          feedback?.trim() ||
          'Work and mandatory evidence verified. Task marked Completed.',
        timestamp: `${dateStr} ${timeStr}`,
      });
      if (feedback?.trim()) {
        task.comments.push({
          id: `cm-${Date.now()}`,
          authorId: reviewer.id,
          authorName: reviewer.name,
          authorRole: reviewer.role as OrgRole,
          content: `✅ Approval Feedback: ${feedback.trim()}`,
          createdAt: `${dateStr} ${timeStr}`,
        });
      }
    } else if (decision === 'Changes Requested') {
      task.status = 'Changes Requested';
      task.reviewStatus = 'Revision Requested';
      task.timeline.push({
        id: `tm-${Date.now()}`,
        actorName: reviewer.name,
        actorRole: reviewer.role as OrgRole,
        action: 'Changes Requested',
        details: `Returned with feedback: "${feedback?.trim()}"`,
        timestamp: `${dateStr} ${timeStr}`,
      });
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: reviewer.id,
        authorName: reviewer.name,
        authorRole: reviewer.role as OrgRole,
        content: `⚠️ Changes Requested: ${feedback?.trim()}`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    } else if (decision === 'Rejected') {
      task.status = 'Changes Requested';
      task.reviewStatus = 'Rejected';
      task.timeline.push({
        id: `tm-${Date.now()}`,
        actorName: reviewer.name,
        actorRole: reviewer.role as OrgRole,
        action: 'Submission Rejected',
        details: `Rejected with reason: "${feedback?.trim()}"`,
        timestamp: `${dateStr} ${timeStr}`,
      });
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: reviewer.id,
        authorName: reviewer.name,
        authorRole: reviewer.role as OrgRole,
        content: `🛑 Submission Rejected: ${feedback?.trim()}`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    }

    this.saveTasks(list);
    return {
      success: true,
      message:
        decision === 'Approved'
          ? 'Work approved. Task marked as Completed.'
          : decision === 'Changes Requested'
            ? 'Revisions requested. Task returned to assignee.'
            : 'Submission rejected with audit feedback.',
      task,
    };
  },

  rejectSubmission(
    taskId: string,
    reviewer: { id: string; name: string; role: string },
    reason: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    return this.reviewTaskSubmission(taskId, reviewer, 'Rejected', reason);
  },

  updateTask(updatedTask: ActivityTask): ActivityTask {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === updatedTask.id);
    if (idx !== -1) {
      list[idx] = {
        ...updatedTask,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      this.saveTasks(list);
    }
    return updatedTask;
  },

  deleteTask(id: string): void {
    const list = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(list);
  },

  /**
   * Submit work for review
   */
  submitForReview(
    taskId: string,
    actor: { id: string; name: string; role: string },
    note?: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.status = 'In Review';
    task.reviewStatus = 'Pending';
    task.submittedAt = `${dateStr} ${timeStr}`;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action: 'Submitted for Review',
      details: note || `Submitted to ${task.reviewerName} for formal review.`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    if (note?.trim()) {
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: actor.id,
        authorName: actor.name,
        authorRole: actor.role as OrgRole,
        content: `📤 Submission Note: ${note.trim()}`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    }

    this.saveTasks(list);
    return {
      success: true,
      message: `Task submitted to ${task.reviewerName} for review.`,
      task,
    };
  },

  /**
   * Approve submitted work
   */
  approveTask(
    taskId: string,
    reviewer: { id: string; name: string; role: string },
    feedback?: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    if (!this.isReviewerForTask(reviewer, task)) {
      return {
        success: false,
        message: 'You are not authorized to approve this task.',
      };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.status = 'Completed';
    task.reviewStatus = 'Approved';
    task.reviewedAt = `${dateStr} ${timeStr}`;
    if (feedback) task.reviewFeedback = feedback;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: reviewer.name,
      actorRole: reviewer.role as OrgRole,
      action: 'Review Approved',
      details: feedback || 'Work approved. Task marked as Completed.',
      timestamp: `${dateStr} ${timeStr}`,
    });

    if (feedback?.trim()) {
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: reviewer.id,
        authorName: reviewer.name,
        authorRole: reviewer.role as OrgRole,
        content: `✅ Approval Feedback: ${feedback.trim()}`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    }

    this.saveTasks(list);
    return {
      success: true,
      message: 'Work approved. Task is now Completed.',
      task,
    };
  },

  /**
   * Request changes on submitted work
   */
  requestChanges(
    taskId: string,
    reviewer: { id: string; name: string; role: string },
    mandatoryFeedback: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    if (!mandatoryFeedback || !mandatoryFeedback.trim()) {
      return {
        success: false,
        message: 'Feedback is required when requesting revisions.',
      };
    }

    if (!this.isReviewerForTask(reviewer, task)) {
      return {
        success: false,
        message: 'You are not authorized to review this task.',
      };
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.status = 'Changes Requested';
    task.reviewStatus = 'Revision Requested';
    task.reviewFeedback = mandatoryFeedback.trim();
    task.reviewedAt = `${dateStr} ${timeStr}`;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: reviewer.name,
      actorRole: reviewer.role as OrgRole,
      action: 'Changes Requested',
      details: `Returned with feedback: "${mandatoryFeedback.trim()}"`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    task.comments.push({
      id: `cm-${Date.now()}`,
      authorId: reviewer.id,
      authorName: reviewer.name,
      authorRole: reviewer.role as OrgRole,
      content: `⚠️ Changes Requested: ${mandatoryFeedback.trim()}`,
      createdAt: `${dateStr} ${timeStr}`,
    });

    this.saveTasks(list);
    return {
      success: true,
      message: 'Revisions requested. Task moved to Changes Requested.',
      task,
    };
  },

  /**
   * Resubmit after making revisions
   */
  resubmitTask(
    taskId: string,
    actor: { id: string; name: string; role: string },
    correctionNote?: string
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.status = 'In Review';
    task.reviewStatus = 'Pending';
    task.submittedAt = `${dateStr} ${timeStr}`;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action: 'Resubmitted for Review',
      details:
        correctionNote ||
        'Revisions addressed. Resubmitted for reviewer sign-off.',
      timestamp: `${dateStr} ${timeStr}`,
    });

    if (correctionNote?.trim()) {
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorId: actor.id,
        authorName: actor.name,
        authorRole: actor.role as OrgRole,
        content: `🔄 Resubmission Note: ${correctionNote.trim()}`,
        createdAt: `${dateStr} ${timeStr}`,
      });
    }

    this.saveTasks(list);
    return {
      success: true,
      message: 'Revisions resubmitted for reviewer verification.',
      task,
    };
  },

  /**
   * Validate and transition status centrally
   */
  transitionStatus(
    taskId: string,
    targetStatus: TaskStatus,
    actor: { id: string; name: string; role: string }
  ): { success: boolean; message: string; task?: ActivityTask } {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Completion rule with review gate
    if (targetStatus === 'Completed') {
      if (actor.role === 'Intern') {
        return {
          success: false,
          message:
            'Access Denied: Interns cannot mark tasks as Completed. Tasks must be submitted with mandatory evidence for formal reviewer verification.',
        };
      }
      if (task.requiresReview) {
        const isAuthorizedReviewer = this.isReviewerForTask(actor, task);
        if (!isAuthorizedReviewer) {
          return {
            success: false,
            message:
              'Only the authorized reviewer or supervisor can approve and mark this task as Completed.',
          };
        }
        return this.approveTask(
          taskId,
          actor,
          'Approved via status transition.'
        );
      }
    }

    // 2. Changes Requested rule
    if (targetStatus === 'Changes Requested') {
      if (actor.role === 'Intern') {
        return {
          success: false,
          message:
            'Access Denied: Only authorized reviewers can request changes.',
        };
      }
      if (!this.isReviewerForTask(actor, task)) {
        return {
          success: false,
          message:
            'Only the authorized reviewer or supervisor can request changes.',
        };
      }
      return this.requestChanges(
        taskId,
        actor,
        'Revisions requested via board status shift.'
      );
    }

    // 3. Submitting for Review with Evidence Validation
    if (targetStatus === 'In Review') {
      const draft = task.currentEvidenceDraft || [];
      const val = this.validateEvidenceRequirements(
        task.evidenceRequirements || [],
        draft
      );
      if (!val.valid) {
        return {
          success: false,
          message: `Cannot submit for review: ${val.errors[0]} Open task details to attach mandatory evidence.`,
        };
      }
      return this.submitTaskWithEvidence(taskId, actor, draft);
    }

    // 4. Standard transitions (To Do, In Progress)
    const prevStatus = task.status;
    task.status = targetStatus;

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action: 'Status Changed',
      details: `Transitioned from "${prevStatus}" to "${targetStatus}".`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    this.saveTasks(list);
    return {
      success: true,
      message: `Task status updated to ${targetStatus}.`,
      task,
    };
  },

  toggleChecklistItem(
    taskId: string,
    checklistId: string,
    actor: { id: string; name: string; role: string }
  ): ActivityTask | null {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return null;

    const item = task.checklist.find(c => c.id === checklistId);
    if (item) {
      item.completed = !item.completed;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      task.timeline.push({
        id: `tm-${Date.now()}`,
        actorName: actor.name,
        actorRole: actor.role as OrgRole,
        action: item.completed
          ? 'Checklist Item Completed'
          : 'Checklist Item Unchecked',
        details: `"${item.text}"`,
        timestamp: `${dateStr} ${timeStr}`,
      });
      this.saveTasks(list);
      return task;
    }
    return null;
  },

  addChecklistItem(
    taskId: string,
    itemData: {
      text: string;
      type?: SubtaskType;
      surveyId?: string;
      meetingUrl?: string;
      meetingDuration?: string;
      meetingDescription?: string;
      assigneeName?: string;
      dueDate?: string;
      priority?: TaskPriority | string;
      status?: string;
    },
    actor: { id: string; name: string; role: string }
  ): ActivityTask | null {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task || !itemData.text?.trim()) return null;

    if (!Array.isArray(task.checklist)) {
      task.checklist = [];
    }

    const newItem: TaskChecklistItem = {
      id: `cl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: itemData.text.trim(),
      completed: false,
      type: itemData.type || 'standard',
      surveyId: itemData.surveyId || '',
      meetingUrl: itemData.meetingUrl || '',
      meetingDuration: itemData.meetingDuration || '',
      meetingDescription: itemData.meetingDescription || '',
      assigneeName: itemData.assigneeName || '',
      dueDate: itemData.dueDate || '',
      priority: itemData.priority || 'Medium',
      status: itemData.status || 'In Progress',
    };

    task.checklist.push(newItem);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action: 'Subtask / Checklist Added',
      details: `Added ${newItem.type || 'standard'} subtask: "${newItem.text}"`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    this.saveTasks(list);
    return task;
  },

  deleteChecklistItem(
    taskId: string,
    checklistId: string,
    actor: { id: string; name: string; role: string }
  ): ActivityTask | null {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task || !Array.isArray(task.checklist)) return null;

    const idx = task.checklist.findIndex(c => c.id === checklistId);
    if (idx === -1) return null;

    const removed = task.checklist.splice(idx, 1)[0];

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role as OrgRole,
      action: 'Subtask / Checklist Removed',
      details: `Removed: "${removed.text}"`,
      timestamp: `${dateStr} ${timeStr}`,
    });

    this.saveTasks(list);
    return task;
  },

  toggleAssigneeReadStatus(
    taskId: string,
    memberIdx: number
  ): ActivityTask | null {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task) return null;

    if (!Array.isArray(task.assignees) || task.assignees.length === 0) {
      task.assignees = [
        {
          id: task.assigneeId,
          name: task.assigneeName,
          role: task.assigneeRole,
          read: task.status === 'Completed' || task.status === 'In Review',
          readAt: task.status === 'Completed' ? 'Today, 10:45 AM' : null,
        },
      ];
    }

    if (task.assignees[memberIdx]) {
      const a = task.assignees[memberIdx];
      a.read = !a.read;
      a.readAt = a.read
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;
      this.saveTasks(list);
      return task;
    }
    return null;
  },

  addComment(
    taskId: string,
    content: string,
    author: { id: string; name: string; role: string }
  ): ActivityTask | null {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task || !content.trim()) return null;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newComment: TaskComment = {
      id: `cm-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role as OrgRole,
      content: content.trim(),
      createdAt: `${dateStr} ${timeStr}`,
    };

    task.comments.push(newComment);
    task.timeline.push({
      id: `tm-${Date.now()}`,
      actorName: author.name,
      actorRole: author.role as OrgRole,
      action: 'Comment Added',
      details: content.trim().substring(0, 60),
      timestamp: `${dateStr} ${timeStr}`,
    });

    this.saveTasks(list);
    return task;
  },

  resetToDefaults(): void {
    setStored(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
    setStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    setStored(STORAGE_KEYS.ACTIVE_USER, 'EMP-CH-01');
  },
};

export default ActivityTaskStore;
