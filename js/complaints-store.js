/**
 * Complaints Store & Initial Mock Data
 * Matching Schame-managemt exact dataset and behavior
 */

const DEFAULT_COMPLAINTS = [
  // ── Intern -> Fellow (Review Intern Complaints tab) ──
  {
    id: 'cmp-01',
    ticketNumber: 'CMP-2026-0101',
    applicantId: 'u-intern-01',
    applicantName: 'Priya Patel',
    applicantRole: 'intern',
    assignedLocation: 'Ujjain Urban (Ujjain)',
    category: 'field_travel',
    categoryLabel: 'Field Travel & Conveyance',
    priority: 'high',
    subject: 'Delay in reimbursement of village travel allowance',
    description: 'Field visits conducted across 4 remote Gram Panchayats between 18-22 August. Travel expense bills submitted with original fuel receipts, awaiting approval.',
    incidentDate: '2026-08-22',
    documentName: 'Travel_Expense_Vouchers.pdf',
    voiceNoteUrl: '#voice-note',
    voiceNoteName: 'Travel_Clarification.m4a',
    voiceNoteDuration: 14,
    status: 'pending',
    appliedAt: '2026-09-02T10:30:00Z',
    targetRole: 'fellow',
  },
  {
    id: 'cmp-02',
    ticketNumber: 'CMP-2026-0102',
    applicantId: 'u-intern-02',
    applicantName: 'Rohit Yadav',
    applicantRole: 'intern',
    assignedLocation: 'Indore Block A (Indore)',
    category: 'infrastructure',
    categoryLabel: 'Hardware & Infrastructure',
    priority: 'urgent',
    subject: 'Mobile survey portal crashing during offline sync',
    description: 'Survey app version 2.1 fails to sync cached household survey responses when reconnected to mobile network. Data loss risk is high.',
    incidentDate: '2026-09-01',
    documentName: 'App_Crash_Screenshot.png',
    status: 'resolved',
    appliedAt: '2026-09-01T09:00:00Z',
    targetRole: 'fellow',
    reviewedBy: 'Vikram Singh',
    reviewerRole: 'fellow',
    reviewerComment: 'Technical patch applied; cache reset instructions shared. Verified that offline sync is functioning normally.',
    reviewedAt: '2026-09-02T16:00:00Z',
  },
  {
    id: 'cmp-03',
    ticketNumber: 'CMP-2026-0103',
    applicantId: 'u-intern-03',
    applicantName: 'Divya Sharma',
    applicantRole: 'intern',
    assignedLocation: 'Sanwer Block (Indore)',
    category: 'workload_tasks',
    categoryLabel: 'Workload & Task Allocation',
    priority: 'medium',
    subject: 'Overlapping survey schedule with university semester exams',
    description: 'Final semester practical exams scheduled between Sept 10 and Sept 14. Requesting temporary re-allocation of PHC physical verification duties.',
    incidentDate: '2026-09-03',
    documentName: 'Exam_Schedule_Affidavit.pdf',
    status: 'pending',
    appliedAt: '2026-09-03T11:45:00Z',
    targetRole: 'fellow',
  },
  {
    id: 'cmp-04',
    ticketNumber: 'CMP-2026-0104',
    applicantId: 'u-intern-04',
    applicantName: 'Karan Malhotra',
    applicantRole: 'intern',
    assignedLocation: 'Depalpur Block (Indore)',
    category: 'stipend',
    categoryLabel: 'Stipend & Disbursal Delay',
    priority: 'medium',
    subject: 'Discrepancy in attendance days vs August stipend credit',
    description: 'Three field survey days in August were recorded as unpaid leaves on the portal, reducing the disbursed stipend.',
    incidentDate: '2026-08-31',
    status: 'rejected',
    appliedAt: '2026-08-31T14:20:00Z',
    targetRole: 'fellow',
    reviewedBy: 'Vikram Singh',
    reviewerRole: 'fellow',
    reviewerComment: 'Geo-fence logs indicate check-ins were outside designated block boundaries without prior BDO permission.',
    reviewedAt: '2026-09-01T11:30:00Z',
  },

  // ── Fellow -> PC (My Complaints tab) ──
  {
    id: 'cmp-05',
    ticketNumber: 'CMP-2026-0201',
    applicantId: 'u-fellow-01',
    applicantName: 'Vikram Singh (AIGGPA Fellow)',
    applicantRole: 'fellow',
    assignedLocation: 'Indore District',
    category: 'infrastructure',
    categoryLabel: 'Hardware & Infrastructure',
    priority: 'urgent',
    subject: 'SIM cards connectivity failure in 3 remote panchayats',
    description: 'The BSNL SIM cards provided for biometric devices have zero signal reception in Depalpur and interior Mhow villages. Requesting porting or replacement with Jio/Airtel.',
    incidentDate: '2026-09-01',
    documentName: 'Signal_Strength_Log.pdf',
    voiceNoteUrl: '#voice-note',
    voiceNoteName: 'Depalpur_Signal_VoiceNote.m4a',
    voiceNoteDuration: 22,
    status: 'pending',
    appliedAt: '2026-09-02T12:00:00Z',
    targetRole: 'pc',
  },
  {
    id: 'cmp-06',
    ticketNumber: 'CMP-2026-0202',
    applicantId: 'u-fellow-01',
    applicantName: 'Vikram Singh (AIGGPA Fellow)',
    applicantRole: 'fellow',
    assignedLocation: 'Indore District',
    category: 'field_travel',
    categoryLabel: 'Field Travel & Conveyance',
    priority: 'high',
    subject: 'Zila Panchayat meeting hall access denial for orientation workshop',
    description: 'District nodal officer declined access to Hall 2 for the scheduled intern training batch citing internal departmental meetings without prior notification.',
    incidentDate: '2026-09-02',
    status: 'resolved',
    appliedAt: '2026-09-02T15:00:00Z',
    targetRole: 'pc',
    reviewedBy: 'Dr. Rajesh Verma',
    reviewerRole: 'pc',
    reviewerComment: 'Liaised with CEO Zila Panchayat; alternate Collectorate Auditorium has been booked and keys handed over for training.',
    reviewedAt: '2026-09-03T14:20:00Z',
  },
  {
    id: 'cmp-07',
    ticketNumber: 'CMP-2026-0203',
    applicantId: 'u-fellow-01',
    applicantName: 'Vikram Singh (AIGGPA Fellow)',
    applicantRole: 'fellow',
    assignedLocation: 'Indore District',
    category: 'workload_tasks',
    categoryLabel: 'Workload & Task Allocation',
    priority: 'medium',
    subject: 'Urgent intern reassignment needed for pending block health surveys',
    description: 'Two interns have exited the program early; current remaining field strength is insufficient to complete the required 150 household interviews by month end.',
    incidentDate: '2026-09-04',
    status: 'pending',
    appliedAt: '2026-09-04T10:15:00Z',
    targetRole: 'pc',
  }
];

const ComplaintStore = {
  STORAGE_KEY: 'aiggpa_complaints_data',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_COMPLAINTS));
        return DEFAULT_COMPLAINTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading complaints', e);
      return DEFAULT_COMPLAINTS;
    }
  },

  getMyComplaints() {
    return this.getAll().filter(c => c.applicantRole === 'fellow');
  },

  getInternComplaints() {
    return this.getAll().filter(c => c.applicantRole === 'intern');
  },

  getById(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  addComplaint(data) {
    const list = this.getAll();
    const count = list.length + 1;
    const ticketNumber = `CMP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newCmp = {
      id: `cmp-new-${Date.now()}`,
      ticketNumber,
      applicantId: 'u-fellow-01',
      applicantName: 'Vikram Singh (AIGGPA Fellow)',
      applicantRole: 'fellow',
      assignedLocation: 'Indore District',
      category: data.category || 'other',
      categoryLabel: data.categoryLabel || 'General Issue',
      priority: data.priority || 'medium',
      subject: data.subject,
      description: data.description,
      incidentDate: data.incidentDate || new Date().toISOString().split('T')[0],
      documentName: data.documentName || null,
      voiceNoteName: data.voiceNoteName || null,
      voiceNoteDuration: data.voiceNoteDuration || null,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      targetRole: 'pc',
    };

    list.unshift(newCmp);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
    return newCmp;
  },

  updateStatus(id, newStatus, comment, reviewer = 'Vikram Singh') {
    const list = this.getAll();
    const item = list.find(c => c.id === id);
    if (item) {
      item.status = newStatus;
      item.reviewedBy = reviewer;
      item.reviewerRole = 'fellow';
      item.reviewerComment = comment || (newStatus === 'resolved' ? 'Issue verified and resolved.' : 'Complaint rejected after assessment.');
      item.reviewedAt = new Date().toISOString();
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
      return item;
    }
    return null;
  },

  forwardComplaint(id, comment, reviewer = 'Vikram Singh') {
    const list = this.getAll();
    const item = list.find(c => c.id === id);
    if (item) {
      item.targetRole = 'pc';
      item.isEscalated = true;
      item.forwardedBy = reviewer;
      item.forwardComment = comment;
      item.forwardedAt = new Date().toISOString();
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
      return item;
    }
    return null;
  }
};

window.ComplaintStore = ComplaintStore;
