/* eslint-disable no-console */
/**
 * Survey Store & Initial Mock Data (TypeScript port)
 * Enhanced with Dynamic Milestone Lifecycle & Progress Tracking
 */
import { emitStoreChange } from '../lib/storeEvents';
import type {
  AdminSurvey,
  SurveyMilestone,
  SurveyMilestoneProgress,
  MilestoneStatus,
} from './types';
import { MasterStore } from './masterStore';

/**
 * Calculates dynamic survey completion progress based on configured eligible milestones.
 * Formula: Completed eligible milestones / Total eligible milestones * 100
 * Skipped milestones do NOT count as completed; they are tracked separately.
 */
export function calculateSurveyMilestoneProgress(
  milestones?: SurveyMilestone[]
): SurveyMilestoneProgress {
  if (!milestones || milestones.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      pending: 0,
      skipped: 0,
      percentage: 0,
    };
  }

  const eligible = milestones.filter(m => m.status !== 'Skipped');
  const totalEligible = eligible.length;
  const completed = eligible.filter(m => m.status === 'Completed').length;
  const inProgress = eligible.filter(m => m.status === 'In Progress').length;
  const blocked = eligible.filter(m => m.status === 'Blocked').length;
  const pending = eligible.filter(m => m.status === 'Not Started').length;
  const skipped = milestones.filter(m => m.status === 'Skipped').length;

  const percentage =
    totalEligible > 0 ? Math.round((completed / totalEligible) * 100) : 0;

  return {
    total: milestones.length,
    completed,
    inProgress,
    blocked,
    pending,
    skipped,
    percentage,
  };
}

/**
 * Generates default survey milestone instances relative to survey start date.
 */
export function generateDefaultSurveyMilestones(
  startDateStr = '2026-08-01'
): SurveyMilestone[] {
  const masterTemplates = MasterStore.getMilestones();
  const baseDate = new Date(startDateStr);

  return masterTemplates.map((tmpl, idx) => {
    const plannedStart = new Date(baseDate.getTime() + idx * 7 * 86400000)
      .toISOString()
      .split('T')[0];
    const plannedDue = new Date(
      baseDate.getTime() + (tmpl.targetDaysOffset || (idx + 1) * 8) * 86400000
    )
      .toISOString()
      .split('T')[0];

    return {
      id: `sm-${tmpl.id}-${idx + 1}`,
      milestoneId: tmpl.id,
      code: tmpl.code,
      name: tmpl.name,
      description: tmpl.description,
      sequence: tmpl.sequence,
      required: tmpl.required,
      status: 'Not Started' as MilestoneStatus,
      targetDaysOffset: tmpl.targetDaysOffset,
      plannedStartDate: plannedStart,
      plannedDueDate: plannedDue,
    };
  });
}

const DEFAULT_SURVEYS: AdminSurvey[] = [
  {
    id: 'survey-01',
    title: 'Block Livelihood Survey — Q3 2026',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    description:
      'Quarterly survey to assess household livelihood and employment conditions across all blocks.',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    participantsRequired: 150,
    responsesCount: 112,
    status: 'active',
    submissionStatus: 'submitted_by_pc',
    createdBy: { name: 'Dr. Rajesh Verma', role: 'Chief Program Manager' },
    isAllocatedAsTask: true,
    createdAt: '2026-08-01T00:00:00Z',
    milestones: [
      {
        id: 'sm-s1-1',
        milestoneId: 'MLS-01',
        code: 'MS-SCOPE',
        name: 'Concept Note & Scope Finalization',
        description:
          'Finalize research scope, geographic boundaries, and steering committee sign-off.',
        sequence: 1,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-01',
        plannedDueDate: '2026-08-06',
        actualStartDate: '2026-08-01',
        completedAt: '2026-08-05',
        assignedRole: 'Advisor',
        assignedToName: 'Dr. Rajesh Verma',
        notes: 'Scope and sampling framework approved by Research Directorate.',
        updatedBy: 'Dr. Rajesh Verma (CPM)',
        updatedAt: '2026-08-05',
      },
      {
        id: 'sm-s1-2',
        milestoneId: 'MLS-02',
        code: 'MS-QNR-DESIGN',
        name: 'Questionnaire Design & Expert Validation',
        description:
          'Author bilingual questions, validate skip logic patterns, and test likert scales.',
        sequence: 2,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-06',
        plannedDueDate: '2026-08-14',
        actualStartDate: '2026-08-06',
        completedAt: '2026-08-13',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        notes:
          '5-section CAPI questionnaire finalized with Hindi translations.',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-08-13',
      },
      {
        id: 'sm-s1-3',
        milestoneId: 'MLS-03',
        code: 'MS-CAPI-TEST',
        name: 'Pilot Dry Run & CAPI Logic Verification',
        description:
          'Conduct field dry run on 10 households, check tablet offline sync and GPS tags.',
        sequence: 3,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-14',
        plannedDueDate: '2026-08-22',
        actualStartDate: '2026-08-14',
        completedAt: '2026-08-21',
        assignedRole: 'Intern',
        assignedToName: 'Amit Solanki',
        notes:
          '10 mock households surveyed; average duration was 19 minutes per interview.',
        updatedBy: 'Amit Solanki (Intern)',
        updatedAt: '2026-08-21',
      },
      {
        id: 'sm-s1-4',
        milestoneId: 'MLS-04',
        code: 'MS-ENUM-TRAIN',
        name: 'Enumerator Allocation & Field Training',
        description:
          'Assign Interns and Fellows, conduct tablet orientation, and verify village allocations.',
        sequence: 4,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-22',
        plannedDueDate: '2026-08-28',
        actualStartDate: '2026-08-22',
        completedAt: '2026-08-27',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        notes: 'All 6 enumerators issued tablet credentials with offline maps.',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-08-27',
      },
      {
        id: 'sm-s1-5',
        milestoneId: 'MLS-05',
        code: 'MS-MID-COLLECT',
        name: 'Field Enumeration Rollout (50% Target)',
        description:
          'Reach 75 completed household interviews with supervisor randomized spot-checks.',
        sequence: 5,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-28',
        plannedDueDate: '2026-09-12',
        actualStartDate: '2026-08-28',
        completedAt: '2026-09-10',
        assignedRole: 'Intern',
        assignedToName: 'Amit Solanki',
        notes: 'Crossed 75 responses on Sept 10 with verified audio notes.',
        updatedBy: 'Amit Solanki (Intern)',
        updatedAt: '2026-09-10',
      },
      {
        id: 'sm-s1-6',
        milestoneId: 'MLS-06',
        code: 'MS-COMP-COLLECT',
        name: 'Fieldwork Closure & 100% Target Completion',
        description:
          'Achieve 150 respondent quota across all sampled gram panchayats.',
        sequence: 6,
        required: true,
        status: 'In Progress',
        plannedStartDate: '2026-09-11',
        plannedDueDate: '2026-09-24',
        actualStartDate: '2026-09-11',
        assignedRole: 'Intern',
        assignedToName: 'Amit Solanki',
        notes:
          '112 of 150 target completed (74.7%). Remaining 38 scheduled for next 5 days.',
        updatedBy: 'Amit Solanki (Intern)',
        updatedAt: '2026-09-18',
      },
      {
        id: 'sm-s1-7',
        milestoneId: 'MLS-07',
        code: 'MS-DATA-CLEAN',
        name: 'Data Cleaning, Anonymization & Validation',
        description:
          'Statistical anomaly detection, missing-value imputation, and PII anonymization.',
        sequence: 7,
        required: true,
        status: 'Blocked',
        plannedStartDate: '2026-09-20',
        plannedDueDate: '2026-09-28',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        blockerReason:
          'Cellular network blackspot in 3 tribal panchayats delayed automatic CAPI sync; physical memory cards being dispatched to Block Development Office.',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-09-19',
      },
      {
        id: 'sm-s1-8',
        milestoneId: 'MLS-08',
        code: 'MS-FINAL-REPORT',
        name: 'Analytical Report & Policy Recommendations',
        description:
          'Synthesize cross-tabulated tables and policy briefs for Directorate.',
        sequence: 8,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-09-28',
        plannedDueDate: '2026-10-05',
        assignedRole: 'Advisor',
        assignedToName: 'Dr. Rajesh Verma',
      },
    ],
    feedbacks: [
      {
        id: 'fb-01',
        submittedBy: { name: 'Amit Solanki', role: 'Intern' },
        role: 'intern',
        submittedToRole: 'fellow',
        feedbackText:
          'High participation from self-help group members. Many households requested dedicated training on poultry farming and tailoring.',
        challengesFaced:
          'Network connectivity was weak in 3 remote gram panchayats.',
        recommendations:
          'Provide offline sync capability and distribute regional flyers.',
        stakeholdersInterviewedCount: 45,
        createdAt: '25 Aug 2026, 02:30 PM',
      },
      {
        id: 'fb-02',
        submittedBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
        role: 'fellow',
        submittedToRole: 'pc',
        feedbackText:
          'Reviewed field responses across Ujjain district. Data quality is verified. Interns showed strong community engagement.',
        challengesFaced: 'Heavy monsoon rains delayed visits to 2 panchayats.',
        recommendations:
          'Recommend coordinating with Block Development Officer for SHG linkage.',
        stakeholdersInterviewedCount: 88,
        createdAt: '28 Aug 2026, 04:00 PM',
      },
      {
        id: 'fb-03',
        submittedBy: {
          name: 'Dr. Rajesh Verma',
          role: 'Chief Program Manager',
        },
        role: 'pc',
        submittedToRole: 'spm_cpm',
        feedbackText:
          'Divisional compilation complete with 112 verified responses. Key livelihood trends highlighted for policy team review.',
        challengesFaced:
          'None at divisional level; cross-verified with district data.',
        recommendations:
          'Fast-track scheme allocation for SHG enterprise loans in Q4.',
        stakeholdersInterviewedCount: 112,
        createdAt: '02 Sep 2026, 11:00 AM',
      },
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        question: 'What is the primary source of household income?',
        options: [
          'Agriculture',
          'Daily Wage Labor',
          'Small Business / Shop',
          'Government / Private Job',
        ],
        required: true,
        allowImage: true,
      },
      {
        id: 'q2',
        type: 'likert_scale',
        question:
          'How satisfied is the community with current road connectivity?',
        likertConfig: {
          points: 5,
          lowLabel: 'Very Dissatisfied',
          midLabel: 'Neutral',
          highLabel: 'Very Satisfied',
          labels: [
            'Very Dissatisfied',
            'Dissatisfied',
            'Neutral',
            'Satisfied',
            'Very Satisfied',
          ],
        },
        required: true,
      },
      {
        id: 'q3',
        type: 'dichotomous',
        question: 'Does the household have access to piped drinking water?',
        dichotomousLabels: ['Yes', 'No'],
        required: true,
        allowImage: true,
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'Which welfare schemes does the household benefit from?',
        options: [
          'PM Kisan',
          'Ladli Behna Yojana',
          'Ayushman Bharat',
          'Ration (PDS)',
          'None',
        ],
        required: true,
      },
      {
        id: 'q5',
        type: 'descriptive',
        question:
          'What are the main development challenges reported by the village head?',
        placeholder:
          'Enter key observations, grievances, or community suggestions…',
        required: false,
        allowVoice: true,
        allowVideo: true,
      },
    ],
  },
  {
    id: 'survey-02',
    title: 'Youth Digital Literacy & Employment Assessment',
    projectId: 'PRJ-02',
    projectName: 'Fiscal Space Expansion & Revenue Mobilization Framework',
    description:
      'Assess digital skills, smartphone accessibility, and career training requirements for rural youth.',
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    participantsRequired: 200,
    responsesCount: 84,
    status: 'active',
    submissionStatus: 'submitted_by_fellow',
    createdBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
    isAllocatedAsTask: true,
    createdAt: '2026-08-15T00:00:00Z',
    milestones: [
      {
        id: 'sm-s2-1',
        milestoneId: 'MLS-01',
        code: 'MS-SCOPE',
        name: 'Concept Note & Scope Finalization',
        description:
          'Define youth target demographic (age 18-29) and vocational focus.',
        sequence: 1,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-15',
        plannedDueDate: '2026-08-20',
        actualStartDate: '2026-08-15',
        completedAt: '2026-08-19',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-08-19',
      },
      {
        id: 'sm-s2-2',
        milestoneId: 'MLS-02',
        code: 'MS-QNR-DESIGN',
        name: 'Questionnaire Design & Expert Validation',
        description:
          'Digital skills assessment battery aligned with MP Rozgar portal.',
        sequence: 2,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-20',
        plannedDueDate: '2026-08-28',
        actualStartDate: '2026-08-20',
        completedAt: '2026-08-27',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-08-27',
      },
      {
        id: 'sm-s2-3',
        milestoneId: 'MLS-03',
        code: 'MS-CAPI-TEST',
        name: 'Pilot Dry Run & CAPI Logic Verification',
        description:
          'Tested across 15 student candidates in Indore college campus.',
        sequence: 3,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-08-28',
        plannedDueDate: '2026-09-04',
        actualStartDate: '2026-08-28',
        completedAt: '2026-09-03',
        assignedRole: 'Intern',
        assignedToName: 'Sunita Meena',
        updatedBy: 'Sunita Meena (Intern)',
        updatedAt: '2026-09-03',
      },
      {
        id: 'sm-s2-4',
        milestoneId: 'MLS-04',
        code: 'MS-ENUM-TRAIN',
        name: 'Enumerator Allocation & Field Training',
        description: 'Colleges and youth clubs mapped for enumeration.',
        sequence: 4,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-09-04',
        plannedDueDate: '2026-09-10',
        actualStartDate: '2026-09-04',
        completedAt: '2026-09-09',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-09-09',
      },
      {
        id: 'sm-s2-5',
        milestoneId: 'MLS-05',
        code: 'MS-MID-COLLECT',
        name: 'Field Enumeration Rollout (50% Target)',
        description: 'Mid-term target of 100 youth interviews across ITIs.',
        sequence: 5,
        required: true,
        status: 'In Progress',
        plannedStartDate: '2026-09-10',
        plannedDueDate: '2026-09-25',
        actualStartDate: '2026-09-10',
        assignedRole: 'Intern',
        assignedToName: 'Sunita Meena',
        notes: '84 responses collected (42% target achieved).',
        updatedBy: 'Sunita Meena (Intern)',
        updatedAt: '2026-09-15',
      },
      {
        id: 'sm-s2-6',
        milestoneId: 'MLS-06',
        code: 'MS-COMP-COLLECT',
        name: 'Fieldwork Closure & 100% Target Completion',
        description: 'Reach 200 surveyed youth.',
        sequence: 6,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-09-25',
        plannedDueDate: '2026-10-05',
        assignedRole: 'Intern',
        assignedToName: 'Sunita Meena',
      },
      {
        id: 'sm-s2-7',
        milestoneId: 'MLS-07',
        code: 'MS-DATA-CLEAN',
        name: 'Data Cleaning, Anonymization & Validation',
        description:
          'Verify phone number uniqueness and certificate program interest.',
        sequence: 7,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-10-05',
        plannedDueDate: '2026-10-10',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
      },
      {
        id: 'sm-s2-8',
        milestoneId: 'MLS-08',
        code: 'MS-FINAL-REPORT',
        name: 'Analytical Report & Policy Recommendations',
        description: 'Deliver policy memo to Technical Education Directorate.',
        sequence: 8,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-10-10',
        plannedDueDate: '2026-10-15',
        assignedRole: 'Advisor',
        assignedToName: 'Priya Sharma',
      },
    ],
    feedbacks: [
      {
        id: 'fb-04',
        submittedBy: { name: 'Sunita Meena', role: 'Intern' },
        role: 'intern',
        submittedToRole: 'fellow',
        feedbackText:
          'Interviewed 84 youth across 6 colleges and youth clubs. High appetite for coding and digital marketing training.',
        challengesFaced: 'Access to computer labs was limited in 2 colleges.',
        recommendations: 'Establish mobile digital literacy vans.',
        stakeholdersInterviewedCount: 84,
        createdAt: '01 Sep 2026, 03:00 PM',
      },
      {
        id: 'fb-05',
        submittedBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
        role: 'fellow',
        submittedToRole: 'pc',
        feedbackText:
          'Validated youth responses. 72% expressed interest in state government digital certificate courses.',
        challengesFaced:
          'Need coordination with Technical Education department.',
        recommendations: 'Align curriculum with MP Rozgar portal requirements.',
        stakeholdersInterviewedCount: 84,
        createdAt: '03 Sep 2026, 05:30 PM',
      },
    ],
    questions: [
      {
        id: 'q1',
        type: 'dichotomous',
        question:
          'Does the candidate have personal access to a smartphone or computer?',
        dichotomousLabels: ['Yes', 'No'],
        required: true,
        allowImage: true,
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Which digital skills are you interested in learning?',
        options: [
          'Basic Computer Operations',
          'Digital Payments & Banking',
          'Graphic Design & Media',
          'Online Government Services (MP e-District)',
          'Coding & Programming',
        ],
        required: true,
      },
      {
        id: 'q3',
        type: 'likert_scale',
        question:
          'How confident are you in using digital payment apps (UPI, DBT)?',
        likertConfig: {
          points: 5,
          lowLabel: 'Not Confident',
          midLabel: 'Moderate',
          highLabel: 'Extremely Confident',
          labels: [
            'Not Confident',
            'Slightly Confident',
            'Moderate',
            'Confident',
            'Extremely Confident',
          ],
        },
        required: true,
      },
      {
        id: 'q4',
        type: 'descriptive',
        question: 'Describe your educational background and career aspiration.',
        placeholder: 'Write a brief description…',
        required: true,
        allowVoice: true,
      },
    ],
  },
  {
    id: 'survey-03',
    title: 'Primary Healthcare Center Accessibility Audit',
    projectId: 'PRJ-01',
    projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
    description:
      'Evaluating medicine availability, doctor attendance, and ambulance response time in rural PHCs.',
    startDate: '2026-09-01',
    endDate: '2026-09-25',
    participantsRequired: 75,
    responsesCount: 29,
    status: 'active',
    submissionStatus: 'draft',
    createdBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
    isAllocatedAsTask: true,
    createdAt: '2026-09-01T00:00:00Z',
    milestones: [
      {
        id: 'sm-s3-1',
        milestoneId: 'MLS-01',
        code: 'MS-SCOPE',
        name: 'Concept Note & Scope Finalization',
        description: 'Health facility sample selection across tribal pockets.',
        sequence: 1,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-09-01',
        plannedDueDate: '2026-09-05',
        actualStartDate: '2026-09-01',
        completedAt: '2026-09-04',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-09-04',
      },
      {
        id: 'sm-s3-2',
        milestoneId: 'MLS-02',
        code: 'MS-QNR-DESIGN',
        name: 'Questionnaire Design & Expert Validation',
        description: 'PHC facility checklist & medicine audit protocol.',
        sequence: 2,
        required: true,
        status: 'Completed',
        plannedStartDate: '2026-09-05',
        plannedDueDate: '2026-09-12',
        actualStartDate: '2026-09-05',
        completedAt: '2026-09-11',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
        updatedBy: 'Pooja Sharma (CM Fellow)',
        updatedAt: '2026-09-11',
      },
      {
        id: 'sm-s3-3',
        milestoneId: 'MLS-03',
        code: 'MS-CAPI-TEST',
        name: 'Pilot Dry Run & CAPI Logic Verification',
        description: 'Facility dry run conducted at 3 PHCs in Dhar.',
        sequence: 3,
        required: true,
        status: 'In Progress',
        plannedStartDate: '2026-09-12',
        plannedDueDate: '2026-09-19',
        actualStartDate: '2026-09-12',
        assignedRole: 'Intern',
        assignedToName: 'Karan Malhotra',
        notes: '29 patients and staff interviewed so far.',
        updatedBy: 'Karan Malhotra (Intern)',
        updatedAt: '2026-09-16',
      },
      {
        id: 'sm-s3-4',
        milestoneId: 'MLS-04',
        code: 'MS-ENUM-TRAIN',
        name: 'Enumerator Allocation & Field Training',
        description: 'Health surveyors assigned for facility visits.',
        sequence: 4,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-09-19',
        plannedDueDate: '2026-09-22',
        assignedRole: 'Fellow',
        assignedToName: 'Pooja Sharma',
      },
      {
        id: 'sm-s3-5',
        milestoneId: 'MLS-05',
        code: 'MS-MID-COLLECT',
        name: 'Field Enumeration Rollout (50% Target)',
        description: 'Reach 38 completed healthcare audits.',
        sequence: 5,
        required: true,
        status: 'Not Started',
        plannedStartDate: '2026-09-22',
        plannedDueDate: '2026-09-25',
        assignedRole: 'Intern',
        assignedToName: 'Karan Malhotra',
      },
    ],
    feedbacks: [],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        question: 'Distance of the village from the nearest PHC / CHC?',
        options: ['Under 2 km', '2–5 km', '5–10 km', 'More than 10 km'],
        required: true,
      },
      {
        id: 'q2',
        type: 'likert_scale',
        question:
          'Quality of service received during the last visit to the health center:',
        likertConfig: {
          points: 5,
          lowLabel: 'Very Poor',
          midLabel: 'Average',
          highLabel: 'Excellent',
          labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
        },
        required: true,
      },
      {
        id: 'q3',
        type: 'dichotomous',
        question:
          'Are essential generic medicines available free of cost at the center?',
        dichotomousLabels: ['Yes', 'No'],
        required: true,
      },
    ],
  },
];

const SurveyStore = {
  STORAGE_KEY: 'aiggpa_admin_surveys',

  getSurveys(): AdminSurvey[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SURVEYS));
        emitStoreChange();
        return DEFAULT_SURVEYS;
      }
      const list: AdminSurvey[] = JSON.parse(data);

      // Safe backward-compatibility auto-migration:
      // If any existing stored survey lacks milestones or projectId, attach defaults
      let modified = false;
      const upgraded = list.map(s => {
        const matchDefault = DEFAULT_SURVEYS.find(ds => ds.id === s.id);
        if (!s.milestones || s.milestones.length === 0) {
          s.milestones =
            matchDefault?.milestones ||
            generateDefaultSurveyMilestones(s.startDate || '2026-08-01');
          modified = true;
        }
        if (!s.projectId && matchDefault?.projectId) {
          s.projectId = matchDefault.projectId;
          s.projectName = matchDefault.projectName;
          modified = true;
        }
        return s;
      });

      if (modified) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(upgraded));
      }

      return upgraded;
    } catch (e) {
      console.error('Failed reading surveys from localStorage', e);
      return DEFAULT_SURVEYS;
    }
  },

  getSurveyById(id: string): AdminSurvey | null {
    const list = this.getSurveys();
    return list.find(s => s.id === id) || null;
  },

  saveSurvey(surveyData: Partial<AdminSurvey>): AdminSurvey {
    const list = this.getSurveys();
    const startDate =
      surveyData.startDate || new Date().toISOString().split('T')[0];
    const newSurvey: AdminSurvey = {
      id: surveyData.id || `survey-${Date.now()}`,
      title: surveyData.title || 'Untitled Survey',
      projectId: surveyData.projectId,
      projectName: surveyData.projectName,
      description: surveyData.description || '',
      startDate,
      endDate:
        surveyData.endDate ||
        new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      participantsRequired: Number(surveyData.participantsRequired) || 100,
      responsesCount: 0,
      status: surveyData.status || 'active',
      submissionStatus: surveyData.submissionStatus || 'draft',
      createdBy: surveyData.createdBy || {
        name: 'Dr. Rajesh Verma',
        role: 'Chief Program Manager',
      },
      isAllocatedAsTask: surveyData.isAllocatedAsTask || false,
      createdAt: new Date().toISOString(),
      feedbacks: [],
      documents: surveyData.documents || [],
      questions: surveyData.questions || [],
      milestones:
        surveyData.milestones || generateDefaultSurveyMilestones(startDate),
    };

    list.unshift(newSurvey);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch (e) {
      console.error('Failed saving survey to localStorage', e);
    }
    return newSurvey;
  },

  updateSurvey(
    surveyId: string,
    updates: Partial<AdminSurvey>
  ): AdminSurvey | null {
    const list = this.getSurveys();
    const idx = list.findIndex(s => s.id === surveyId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch (e) {
      console.error('Failed updating survey in localStorage', e);
    }
    return list[idx];
  },

  getSurveyMilestones(surveyId: string): SurveyMilestone[] {
    const survey = this.getSurveyById(surveyId);
    if (!survey) return [];
    if (!survey.milestones || survey.milestones.length === 0) {
      const generated = generateDefaultSurveyMilestones(survey.startDate);
      survey.milestones = generated;
      this.updateSurvey(surveyId, { milestones: generated });
      return generated;
    }
    return survey.milestones;
  },

  updateSurveyMilestone(
    surveyId: string,
    milestoneId: string,
    update: Partial<SurveyMilestone>,
    actor?: { name: string; role: string }
  ): { success: boolean; message: string; milestone?: SurveyMilestone } {
    const list = this.getSurveys();
    const survey = list.find(s => s.id === surveyId);
    if (!survey) return { success: false, message: 'Survey not found.' };

    if (!survey.milestones || survey.milestones.length === 0) {
      survey.milestones = generateDefaultSurveyMilestones(survey.startDate);
    }

    const milestone = survey.milestones.find(
      m => m.id === milestoneId || m.milestoneId === milestoneId
    );
    if (!milestone) {
      return { success: false, message: 'Milestone not found in survey.' };
    }

    const now = new Date().toISOString().split('T')[0];

    Object.assign(milestone, update, {
      updatedBy: actor ? `${actor.name} (${actor.role})` : milestone.updatedBy,
      updatedAt: now,
    });

    if (update.status === 'Completed' && !milestone.completedAt) {
      milestone.completedAt = now;
    } else if (update.status !== 'Completed') {
      milestone.completedAt = undefined;
    }

    if (update.status === 'In Progress' && !milestone.actualStartDate) {
      milestone.actualStartDate = now;
    }

    // Auto-update survey status if all milestones reach 100%
    const prog = calculateSurveyMilestoneProgress(survey.milestones);
    if (prog.percentage === 100 && survey.status !== 'closed') {
      survey.submissionStatus = 'approved';
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch (e) {
      console.error('Failed updating milestone in localStorage', e);
    }

    return {
      success: true,
      message: `Milestone "${milestone.name}" updated to ${milestone.status}. Progress: ${prog.percentage}%.`,
      milestone,
    };
  },

  getSurveyMilestoneProgress(surveyId: string): SurveyMilestoneProgress {
    const survey = this.getSurveyById(surveyId);
    return calculateSurveyMilestoneProgress(survey?.milestones);
  },

  submitResponse(
    surveyId: string,
    responseData: {
      respondentName?: string;
      respondentPhone?: string;
      location?: string;
      answers: Record<string, string | number | boolean | string[] | null>;
      media: Record<
        string,
        {
          voiceUrl?: string;
          voiceName?: string;
          voiceDuration?: number;
          videoUrl?: string;
          videoName?: string;
          imageUrl?: string;
          imageName?: string;
        }
      >;
      submittedBy?: { name: string; role: string };
    }
  ): AdminSurvey | null {
    const list = this.getSurveys();
    const survey = list.find(s => s.id === surveyId);
    if (!survey) return null;

    survey.responsesCount = (survey.responsesCount || 0) + 1;
    if (!survey.responses) {
      survey.responses = [];
    }
    const newResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toISOString(),
      ...responseData,
    };
    survey.responses.push(newResponse);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch (e) {
      console.error('Failed saving survey response', e);
    }
    return survey;
  },

  resetDefaults(): AdminSurvey[] {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SURVEYS));
    emitStoreChange();
    return DEFAULT_SURVEYS;
  },
};

export default SurveyStore;
