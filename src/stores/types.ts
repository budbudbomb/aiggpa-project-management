/**
 * Shared entity types for the AIGGPA data stores.
 * All entities keep an index signature so legacy dynamic fields
 * written by older data remain accessible.
 */

export interface BudgetSubItem {
  id: string;
  particular: string;
  units: number;
  period: number;
  unitType: string;
  costPerUnit: number;
  total: number;
  [key: string]: any;
}

export interface BudgetHead {
  id: string;
  name: string;
  mode: 'lumpSum' | 'detailed' | string;
  lumpSumAmount: number;
  subItems: BudgetSubItem[];
  [key: string]: any;
}

export interface BudgetSummary {
  subTotal: number;
  overheadsPct: number;
  overheadsAmount: number;
  totalEstimatedCost: number;
  [key: string]: any;
}

export interface ProjectTeam {
  advisor: number;
  ra: number;
  fellow: number;
  investigators: number;
  totalMembers: number;
  [key: string]: any;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  nature?: string;
  scheme?: string;
  financialYear?: string;
  fundingPattern?: string;
  prcDate?: string;
  startDate?: string;
  endDate?: string;
  durationMonths?: number;
  budgetSanctioned?: number;
  budgetUtilized?: number;
  status?: string;
  team?: ProjectTeam;
  lead?: string;
  progressPercent?: number;
  budgetHeads?: BudgetHead[];
  budgetSummary?: BudgetSummary;
  [key: string]: any;
}

export interface Assignee {
  name: string;
  role?: string;
  read?: boolean;
  readAt?: string | null;
  [key: string]: any;
}

export interface ChecklistItem {
  id?: string;
  text?: string;
  title?: string;
  done?: boolean;
  completed?: boolean;
  [key: string]: any;
}

export type SubtaskType = 'standard' | 'survey' | 'meeting';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  assignees?: string[];
  dueDate?: string;
  priority?: string;
  status?: string;
  description?: string;
  estimatedHours?: string;
  checklists?: ChecklistItem[];
  type?: SubtaskType;
  surveyId?: string;
  meetingUrl?: string;
  meetingDuration?: string;
  meetingDescription?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  tag?: string;
  description?: string;
  project?: string;
  projectId?: string;
  assignee?: string;
  assignees?: Assignee[];
  dueDate?: string;
  priority?: string;
  status?: string;
  progress?: number;
  subtasks?: Subtask[];
  isMilestone?: boolean;
  category?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Milestone extends Task {
  isMilestone: true;
  projectId?: string;
  projectName?: string;
}

export interface MeetingParticipant {
  name: string;
  status: string;
  [key: string]: any;
}

export interface Meeting {
  id: string;
  title: string;
  agenda?: string;
  project?: string;
  dateTime?: string;
  mode?: string;
  attendees?: string;
  participants?: MeetingParticipant[];
  status?: string;
  [key: string]: any;
}

export interface QuestionBankItem {
  id: string;
  code?: string;
  category?: string;
  text: string;
  type: string;
  options?: string;
  voice?: boolean;
  image?: boolean;
  video?: boolean;
  required?: boolean;
  [key: string]: any;
}

export interface FieldSurvey {
  id: string;
  name?: string;
  description?: string;
  project?: string;
  minRespondents?: number;
  targetSample?: number;
  collectedSamples?: number;
  progress?: number;
  assignedSurveyors?: string[];
  questions?: QuestionBankItem[];
  status?: string;
  [key: string]: any;
}

export interface MeetingLike extends Meeting {}

// ── Admin Survey Studio (aiggpa_admin_surveys) ──

export interface SurveyPerson {
  name: string;
  role: string;
}

export interface SurveyQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  required?: boolean;
  allowImage?: boolean;
  allowVoice?: boolean;
  allowVideo?: boolean;
  placeholder?: string;
  likertConfig?: {
    points: number;
    lowLabel: string;
    midLabel: string;
    highLabel: string;
    labels: string[];
  };
  dichotomousLabels?: string[];
  media?: boolean;
  [key: string]: any;
}

export interface SurveyFeedback {
  id: string;
  submittedBy: SurveyPerson;
  role: string;
  submittedToRole: string;
  feedbackText: string;
  challengesFaced?: string;
  recommendations?: string;
  stakeholdersInterviewedCount?: number;
  createdAt: string;
  [key: string]: any;
}

export type MilestoneStatus =
  'Not Started' | 'In Progress' | 'Blocked' | 'Completed' | 'Skipped';

export interface SurveyMilestone {
  id: string;
  milestoneId: string;
  code: string;
  name: string;
  description?: string;
  sequence: number;
  required: boolean;
  status: MilestoneStatus;
  targetDaysOffset?: number;
  plannedStartDate?: string;
  plannedDueDate?: string;
  actualStartDate?: string;
  completedAt?: string;
  assignedRole?: string;
  assignedToName?: string;
  notes?: string;
  blockerReason?: string;
  evidenceRef?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SurveyMilestoneProgress {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  pending: number;
  skipped: number;
  percentage: number;
}

export interface AdminSurvey {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  participantsRequired?: number;
  responsesCount?: number;
  status?: string;
  submissionStatus?: string;
  createdBy?: SurveyPerson;
  isAllocatedAsTask?: boolean;
  createdAt?: string;
  feedbacks?: SurveyFeedback[];
  questions?: SurveyQuestion[];
  documents?: { name: string; size?: number | string; [key: string]: any }[];
  milestones?: SurveyMilestone[];
  [key: string]: any;
}

// ── Complaints (aiggpa_complaints_data) ──

export interface Complaint {
  id: string;
  ticketNumber: string;
  applicantId: string;
  applicantName: string;
  applicantRole: string;
  assignedLocation?: string;
  category?: string;
  categoryLabel?: string;
  priority?: string;
  subject: string;
  description?: string;
  incidentDate?: string;
  documentName?: string | null;
  voiceNoteUrl?: string;
  voiceNoteName?: string | null;
  voiceNoteDuration?: number | null;
  status: string;
  appliedAt: string;
  targetRole?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  reviewerComment?: string;
  reviewedAt?: string;
  isEscalated?: boolean;
  forwardedBy?: string;
  forwardComment?: string;
  forwardedAt?: string;
  [key: string]: any;
}
