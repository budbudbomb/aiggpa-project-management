/**
 * Complaints Store & Initial Mock Data
 * Supporting 3-Tier Hierarchy:
 * - Tier 1: Center Head (Full review, final resolution, views escalated & all)
 * - Tier 2: Advisor (Reviews grievances, resolves, or moves to Center Head if unable to resolve)
 * - Tier 3: Fellow, Intern, Field Instructor, Research Analyst (Create grievances with 4 common fields, track responses)
 */
import { emitStoreChange } from '../lib/storeEvents';
import { complaintCategoryLabel } from '../lib/utils/formatters';
import type { Complaint } from './types';

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-01',
    ticketNumber: 'CMP-2026-0101',
    applicantId: 'EMP-FL-01',
    applicantName: 'Aakash Mehta',
    applicantRole: 'Fellow',
    assignedLocation: 'Field Operations & Surveys',
    category: 'field_travel',
    categoryLabel: 'Field & Travel Logistics',
    priority: 'high',
    subject: 'Delay in reimbursement of village travel allowance',
    description:
      'Field visits conducted across 4 remote Gram Panchayats between 18-22 October. Travel expense bills submitted with original fuel vouchers, awaiting administrative approval.',
    incidentDate: '2026-10-22',
    status: 'pending',
    appliedAt: '2026-10-23T10:30:00Z',
    targetRole: 'Advisor',
  },
  {
    id: 'cmp-02',
    ticketNumber: 'CMP-2026-0102',
    applicantId: 'EMP-IN-01',
    applicantName: 'Rohan Verma',
    applicantRole: 'Intern',
    assignedLocation: 'Indore Block A',
    category: 'infrastructure',
    categoryLabel: 'Device, SIM & Portal',
    priority: 'urgent',
    subject:
      'Tablet battery failure and offline survey sync issues in remote sector',
    description:
      'Field survey tablets are losing power after 2 hours and offline data fails to sync upon reconnection. Requesting replacement hardware.',
    incidentDate: '2026-10-24',
    status: 'escalated',
    appliedAt: '2026-10-24T09:00:00Z',
    targetRole: 'Center Head',
    isEscalated: true,
    forwardedBy: 'Priya Sharma',
    forwarderRole: 'Advisor',
    forwardComment:
      'Hardware replacement budget approval required from Center Head. Local buffer inventory is currently exhausted.',
    forwardedAt: '2026-10-25T11:00:00Z',
    escalations: [
      {
        forwardedBy: 'Priya Sharma',
        forwarderRole: 'Advisor',
        forwardedToRole: 'Center Head',
        forwardedToLabel: 'Center Head & Director',
        reason:
          'Hardware replacement budget approval required from Center Head. Local buffer inventory is currently exhausted.',
        forwardedAt: '2026-10-25T11:00:00Z',
      },
    ],
  },
  {
    id: 'cmp-03',
    ticketNumber: 'CMP-2026-0103',
    applicantId: 'EMP-FI-01',
    applicantName: 'Surendra Patel',
    applicantRole: 'Field Instructor',
    assignedLocation: 'Field Operations & Surveys',
    category: 'workload_tasks',
    categoryLabel: 'Workload & Assignments',
    priority: 'medium',
    subject: 'Need extra enumerator support for Phase 2 Health Survey quota',
    description:
      'Target of 500 household surveys in Sanwer block requires 2 additional field assistants to complete within milestone deadline.',
    incidentDate: '2026-10-25',
    status: 'pending',
    appliedAt: '2026-10-25T14:15:00Z',
    targetRole: 'Advisor',
  },
  {
    id: 'cmp-04',
    ticketNumber: 'CMP-2026-0104',
    applicantId: 'EMP-RA-01',
    applicantName: 'Dr. Vikramaditya',
    applicantRole: 'Research Analyst',
    assignedLocation: 'Quantitative Evaluation & Statistics',
    category: 'infrastructure',
    categoryLabel: 'Device, SIM & Portal',
    priority: 'medium',
    subject:
      'Access credentials for High-Throughput Statistical Computing Node',
    description:
      'Required computational node access for econometric regression analysis on Madhya Pradesh rural education dataset.',
    incidentDate: '2026-10-18',
    status: 'resolved',
    appliedAt: '2026-10-18T10:00:00Z',
    targetRole: 'Center Head',
    reviewedBy: 'Dr. Rajeshwar Rao',
    reviewerRole: 'Center Head',
    reviewerComment:
      'Computing credentials and server VPN configuration provisioned by IT division.',
    reviewedAt: '2026-10-19T16:30:00Z',
  },
  {
    id: 'cmp-05',
    ticketNumber: 'CMP-2026-0105',
    applicantId: 'EMP-IN-01',
    applicantName: 'Rohan Verma',
    applicantRole: 'Intern',
    assignedLocation: 'Indore District',
    category: 'stipend',
    categoryLabel: 'Stipend & Allowances',
    priority: 'medium',
    subject: 'Attendance record adjustment for field travel dates',
    description:
      '3 days of field survey duty in September were mistakenly marked as absent on attendance portal.',
    incidentDate: '2026-10-05',
    status: 'resolved',
    appliedAt: '2026-10-06T11:20:00Z',
    targetRole: 'Advisor',
    reviewedBy: 'Priya Sharma',
    reviewerRole: 'Advisor',
    reviewerComment:
      'Field attendance verified against GPS check-ins and corrected with payroll section.',
    reviewedAt: '2026-10-07T14:00:00Z',
  },
  {
    id: 'cmp-06',
    ticketNumber: 'CMP-2026-0106',
    applicantId: 'EMP-FL-01',
    applicantName: 'Aakash Mehta',
    applicantRole: 'Fellow',
    assignedLocation: 'Policy Cell',
    category: 'other',
    categoryLabel: 'Other Issue',
    priority: 'low',
    subject: 'Exemption from non-project inter-departmental protocol meetings',
    description:
      'Requesting temporary relief from non-core meetings to focus on survey report writing deadline.',
    incidentDate: '2026-10-10',
    status: 'rejected',
    appliedAt: '2026-10-10T16:00:00Z',
    targetRole: 'Advisor',
    reviewedBy: 'Priya Sharma',
    reviewerRole: 'Advisor',
    reviewerComment:
      'Inter-departmental alignment meetings are mandatory per institute governance policy.',
    reviewedAt: '2026-10-11T12:00:00Z',
  },
];

const ComplaintStore = {
  STORAGE_KEY: 'aiggpa_complaints_data',

  getAll(): Complaint[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(DEFAULT_COMPLAINTS)
        );
        return DEFAULT_COMPLAINTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COMPLAINTS;
    }
  },

  /**
   * Returns grievances filed by a specific user.
   */
  getMyComplaints(
    userId?: string,
    userRole?: string,
    userName?: string
  ): Complaint[] {
    const all = this.getAll();
    if (!userId && !userName && !userRole) return all;

    return all.filter(c => {
      if (userId && c.applicantId === userId) return true;
      if (userName && c.applicantName?.toLowerCase() === userName.toLowerCase())
        return true;
      if (userRole && c.applicantRole?.toLowerCase() === userRole.toLowerCase())
        return true;
      return false;
    });
  },

  getById(id: string): Complaint | null {
    return this.getAll().find(c => c.id === id) || null;
  },

  /**
   * Adds a new grievance taking the 4 common fields:
   * 1. category
   * 2. incidentDate
   * 3. subject
   * 4. description
   */
  addComplaint(
    data: {
      category: string;
      incidentDate?: string;
      subject: string;
      description: string;
      priority?: string;
    },
    currentUser?: {
      id?: string;
      name?: string;
      role?: string;
      department?: string;
      location?: string;
    }
  ): Complaint {
    const list = this.getAll();
    const count = list.length + 1;
    const ticketNumber = `CMP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newCmp: Complaint = {
      id: `cmp-new-${Date.now()}`,
      ticketNumber,
      applicantId: currentUser?.id || 'EMP-FL-01',
      applicantName: currentUser?.name || 'Aakash Mehta',
      applicantRole: currentUser?.role || 'Fellow',
      assignedLocation:
        currentUser?.location || currentUser?.department || 'Field Operations',
      category: data.category || 'other',
      categoryLabel: complaintCategoryLabel(data.category),
      priority: data.priority || 'medium',
      subject: data.subject.trim(),
      description: data.description.trim(),
      incidentDate: data.incidentDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      appliedAt: new Date().toISOString(),
      targetRole: 'Advisor',
      escalations: [],
    };

    list.unshift(newCmp);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch {
      /* ignore */
    }
    return newCmp;
  },

  // Alias
  create(
    data: Parameters<typeof this.addComplaint>[0],
    currentUser?: Parameters<typeof this.addComplaint>[1]
  ): Complaint {
    return this.addComplaint(data, currentUser);
  },

  /**
   * Resolve complaint (by Advisor or Center Head)
   */
  resolve(
    id: string,
    comment?: string,
    reviewer?: { name?: string; role?: string }
  ): Complaint | null {
    const list = this.getAll();
    const item = list.find(c => c.id === id);
    if (!item) return null;

    item.status = 'resolved';
    item.reviewedBy = reviewer?.name || 'Senior Reviewer';
    item.reviewerRole = reviewer?.role || 'Advisor';
    item.reviewerComment =
      comment || 'Complaint verified and resolved with necessary action.';
    item.reviewedAt = new Date().toISOString();

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch {
      /* ignore */
    }
    return item;
  },

  /**
   * Reject complaint (by Advisor or Center Head)
   */
  reject(
    id: string,
    comment?: string,
    reviewer?: { name?: string; role?: string }
  ): Complaint | null {
    const list = this.getAll();
    const item = list.find(c => c.id === id);
    if (!item) return null;

    item.status = 'rejected';
    item.reviewedBy = reviewer?.name || 'Senior Reviewer';
    item.reviewerRole = reviewer?.role || 'Advisor';
    item.reviewerComment =
      comment || 'Complaint reviewed and rejected after formal verification.';
    item.reviewedAt = new Date().toISOString();

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch {
      /* ignore */
    }
    return item;
  },

  /**
   * Advisor moves complaint to Center Head when unable to resolve
   */
  forwardToCenterHead(
    id: string,
    reason: string = 'Unable to resolve at advisor level. Moved to Center Head for executive review.',
    reviewer?: { name?: string; role?: string }
  ): Complaint | null {
    const list = this.getAll();
    const item = list.find(c => c.id === id);
    if (!item) return null;

    const reviewerName = reviewer?.name || 'Priya Sharma';
    const reviewerRole = reviewer?.role || 'Advisor';

    const escalationItem = {
      forwardedBy: reviewerName,
      forwarderRole: reviewerRole,
      forwardedToRole: 'Center Head',
      forwardedToLabel: 'Center Head & Director',
      reason: reason.trim(),
      forwardedAt: new Date().toISOString(),
    };

    item.status = 'escalated';
    item.targetRole = 'Center Head';
    item.isEscalated = true;
    item.forwardedBy = reviewerName;
    item.forwarderRole = reviewerRole;
    item.forwardComment = reason.trim();
    item.forwardedAt = escalationItem.forwardedAt;
    item.escalations = [...(item.escalations || []), escalationItem];
    item.reviewerComment = `Moved to Center Head by ${reviewerName} (${reviewerRole}): "${reason.trim()}"`;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      emitStoreChange();
    } catch {
      /* ignore */
    }
    return item;
  },

  /**
   * Backwards compatible forward method
   */
  forward(
    id: string,
    reason: string,
    reviewer?: { name?: string; role?: string }
  ): Complaint | null {
    return this.forwardToCenterHead(id, reason, reviewer);
  },

  resetDefaults(): Complaint[] {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(DEFAULT_COMPLAINTS)
      );
      emitStoreChange();
      return DEFAULT_COMPLAINTS;
    } catch {
      return DEFAULT_COMPLAINTS;
    }
  },
};

export default ComplaintStore;
