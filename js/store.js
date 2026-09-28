/**
 * AIGGPA Project Management - Central Data Store
 * Persists and syncs state across all pages via localStorage
 */

const Store = (function () {
  const KEYS = {
    PROJECTS: 'aiggpa_projects',
    TASKS: 'aiggpa_tasks',
    SURVEYS: 'aiggpa_surveys',
    MEETINGS: 'aiggpa_meetings',
    QUESTION_BANK: 'aiggpa_question_bank',
    MILESTONES: 'aiggpa_milestones'
  };

  const DEFAULT_PROJECTS = [
    {
      id: 'PRJ-01',
      code: 'PRJ-01',
      name: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
      nature: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
      scheme: 'SCH-01: Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis (64...)',
      financialYear: '2026–2027',
      fundingPattern: 'Internal',
      prcDate: '2026-09-22',
      startDate: '2026-10-01',
      endDate: '2027-09-30',
      durationMonths: 12,
      budgetSanctioned: 1753750,
      budgetUtilized: 450000,
      status: 'Active',
      team: {
        advisor: 1,
        ra: 1,
        fellow: 1,
        investigators: 4,
        totalMembers: 7
      },
      lead: 'Center Head (AIGGPA)',
      progressPercent: 35,
      budgetHeads: [
        {
          id: 'BH-01',
          name: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
          mode: 'detailed',
          lumpSumAmount: 0,
          subItems: [
            { id: 'sub-1', particular: 'Lead Policy Fellow', units: 1, period: 12, unitType: 'Months', costPerUnit: 125000, total: 1500000 },
            { id: 'sub-2', particular: 'Lead Policy Fellow', units: 1, period: 1, unitType: 'Months', costPerUnit: 125000, total: 125000 }
          ]
        },
        {
          id: 'BH-02',
          name: 'Travel Allowances & Field Mobility (BH-TRV-02)',
          mode: 'lumpSum',
          lumpSumAmount: 25000,
          subItems: []
        }
      ],
      budgetSummary: {
        subTotal: 1525000,
        overheadsPct: 15,
        overheadsAmount: 228750,
        totalEstimatedCost: 1753750
      }
    },
    {
      id: 'PRJ-02',
      code: 'PRJ-02',
      name: 'Evaluation of Rural Healthcare Infrastructure',
      nature: 'M.P. State Planning Commission Special Research Studies',
      scheme: 'SCH-02: M.P. State Planning Commission Special Research Studies',
      financialYear: '2025–2026',
      fundingPattern: 'Composite',
      prcDate: '2026-08-15',
      startDate: '2026-08-15',
      endDate: '2027-02-15',
      durationMonths: 6,
      budgetSanctioned: 2200000,
      budgetUtilized: 1100000,
      status: 'Active',
      team: {
        advisor: 1,
        ra: 2,
        fellow: 1,
        investigators: 6,
        totalMembers: 10
      },
      lead: 'Dr. Ananya Joshi',
      progressPercent: 50,
      budgetHeads: [
        {
          id: 'BH-01',
          name: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
          mode: 'detailed',
          lumpSumAmount: 0,
          subItems: [
            { id: 'sub-1', particular: 'Research Associate (RA)', units: 2, period: 6, unitType: 'Months', costPerUnit: 75000, total: 900000 },
            { id: 'sub-2', particular: 'Field Investigator (FI)', units: 6, period: 4, unitType: 'Months', costPerUnit: 35000, total: 840000 }
          ]
        },
        {
          id: 'BH-02',
          name: 'Travel Allowances & Field Mobility (BH-TRV-02)',
          mode: 'lumpSum',
          lumpSumAmount: 173913,
          subItems: []
        }
      ],
      budgetSummary: {
        subTotal: 1913913,
        overheadsPct: 15,
        overheadsAmount: 286087,
        totalEstimatedCost: 2200000
      }
    },
    {
      id: 'PRJ-03',
      code: 'PRJ-03',
      name: 'Urban Water Governance & Service Delivery Audit',
      nature: 'State NITI Aayog Capacity Building Scheme',
      scheme: 'SCH-03: State NITI Aayog Capacity Building Scheme',
      financialYear: '2025–2026',
      fundingPattern: 'External',
      prcDate: '2026-05-01',
      startDate: '2026-05-01',
      endDate: '2026-11-30',
      durationMonths: 7,
      budgetSanctioned: 1800000,
      budgetUtilized: 1650000,
      status: 'Active',
      team: {
        advisor: 1,
        ra: 1,
        fellow: 0,
        investigators: 3,
        totalMembers: 5
      },
      lead: 'Prof. Manish Gupta',
      progressPercent: 85,
      budgetHeads: [
        {
          id: 'BH-01',
          name: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
          mode: 'detailed',
          lumpSumAmount: 0,
          subItems: [
            { id: 'sub-1', particular: 'Data Analyst / Statistician', units: 1, period: 7, unitType: 'Months', costPerUnit: 80000, total: 560000 },
            { id: 'sub-2', particular: 'Field Investigator (FI)', units: 3, period: 6, unitType: 'Months', costPerUnit: 40000, total: 720000 }
          ]
        },
        {
          id: 'BH-02',
          name: 'Field Survey & Data Collection Contingency (BH-SRV-03)',
          mode: 'lumpSum',
          lumpSumAmount: 285217,
          subItems: []
        }
      ],
      budgetSummary: {
        subTotal: 1565217,
        overheadsPct: 15,
        overheadsAmount: 234783,
        totalEstimatedCost: 1800000
      }
    }
  ];

  const DEFAULT_QUESTION_BANK = [
    {
      id: 'Q-01',
      code: 'Q-01',
      category: 'Livelihood',
      text: 'What is the primary source of household monthly income?',
      type: 'Single choice',
      options: 'Agriculture / Farming, Daily Wage Labor, Salaried Job (Govt / Private), Business / Shop / Self-Employed, Forest Produce Collection',
      voice: true,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-02',
      code: 'Q-02',
      category: 'Water & Sanitation',
      text: 'Does the household have a functional piped drinking water tap connection under Jal Jeevan Mission?',
      type: 'Dichotomous',
      options: 'Yes, No',
      voice: false,
      image: true,
      video: false,
      required: true
    },
    {
      id: 'Q-03',
      code: 'Q-03',
      category: 'Healthcare',
      text: 'Rate the overall quality and availability of doctors and essential medicines at your local Primary Health Centre (PHC)',
      type: 'Likert Scale',
      options: '1 to 5 Rating',
      voice: false,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-04',
      code: 'Q-04',
      category: 'Demographics',
      text: 'Total number of family members permanently residing in this household?',
      type: 'Numeric',
      options: '',
      voice: false,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-05',
      code: 'Q-05',
      category: 'Social Welfare',
      text: 'Which of the following government welfare schemes are household members actively enrolled in?',
      type: 'Multiple choice',
      options: 'PM-Kisan Samman Nidhi, Ladli Behna Yojana, PDS Ration Card (NFSA), Ayushman Bharat Health Card, PM Awas Yojana, None of the above',
      voice: false,
      image: false,
      video: false,
      required: false
    },
    {
      id: 'Q-06',
      code: 'Q-06',
      category: 'Agriculture',
      text: 'Total cultivable agricultural land owned by the household (in acres)?',
      type: 'Numeric',
      options: '',
      voice: false,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-07',
      code: 'Q-07',
      category: 'Education',
      text: 'Highest formal educational qualification completed by the head of the household',
      type: 'Single choice',
      options: 'Illiterate (No schooling), Primary School (Class 1-5), Middle School (Class 6-8), Secondary / Higher Secondary (Class 9-12), Graduate / Diploma or Higher',
      voice: false,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-08',
      code: 'Q-08',
      category: 'Infrastructure',
      text: 'Please capture a clear photo of the household domestic electricity meter and consumer number',
      type: 'Text',
      options: '',
      voice: false,
      image: true,
      video: false,
      required: true
    },
    {
      id: 'Q-09',
      code: 'Q-09',
      category: 'Migration',
      text: 'Has any adult member of the household migrated outside the home district or state for seasonal labor in the last 12 months?',
      type: 'Dichotomous',
      options: 'Yes, No',
      voice: false,
      image: false,
      video: false,
      required: true
    },
    {
      id: 'Q-10',
      code: 'Q-10',
      category: 'Grievance',
      text: 'Please record an audio statement from the respondent regarding any delay or difficulty in receiving government DBT welfare transfers',
      type: 'Text',
      options: '',
      voice: true,
      image: false,
      video: false,
      required: false
    },
    {
      id: 'Q-11',
      code: 'Q-11',
      category: 'Education',
      text: 'Rate the quality, hygiene, and regularity of the Mid-Day Meal served in the village Anganwadi / Primary School',
      type: 'Likert Scale',
      options: '1 to 5 Rating',
      voice: false,
      image: false,
      video: false,
      required: false
    },
    {
      id: 'Q-12',
      code: 'Q-12',
      category: 'Livelihood',
      text: 'Select all domestic animals and livestock currently owned and reared by the household',
      type: 'Multiple choice',
      options: 'Cows / Indigenous Cattle, Buffaloes, Goats / Sheep, Backyard Poultry / Chickens, None',
      voice: false,
      image: false,
      video: false,
      required: false
    }
  ];

  const DEFAULT_TASKS = [
    {
      id: 'TSK-01',
      title: 'Conduct Block Health Survey — Ujjain Urban',
      tag: 'Survey',
      description: 'Visit all PHCs in Ujjain Urban block and complete health facility assessment forms.',
      project: 'Evaluation of Rural Healthcare Infrastructure',
      assignee: 'All Interns',
      assignees: [
        { name: 'Kavita Joshi', role: 'Health Intern', read: true, readAt: '15 Sep 2026, 10:15 AM' },
        { name: 'Rohan Sharma', role: 'Field Intern', read: true, readAt: '15 Sep 2026, 11:30 AM' },
        { name: 'Manish Verma', role: 'Survey Intern', read: false, readAt: null },
        { name: 'Pooja Tiwari', role: 'Data Intern', read: true, readAt: '15 Sep 2026, 04:00 PM' }
      ],
      dueDate: '2026-09-15',
      priority: 'High',
      status: 'In Progress',
      subtasks: [
        { id: 'ST-01', title: 'Prepare physical health assessment checklists', completed: true, assignee: 'Kavita Joshi', assignees: ['Kavita Joshi'], dueDate: '2026-09-15', priority: 'High', status: 'Completed', description: 'Cross-check PHC physical assessment checklists with district CMO standards before dispatching field team.', estimatedHours: '3 hrs' },
        { id: 'ST-02', title: 'Visit Ujjain Urban PHC Sector 1 & 2', completed: false, assignee: 'Rohan Sharma', assignees: ['Rohan Sharma'], dueDate: '2026-09-15', priority: 'High', status: 'In Progress', description: 'Inspect cold-chain equipment, medical equipment, and staff attendance log at Sector 1 & 2 PHC facilities.', estimatedHours: '6 hrs' },
        { id: 'ST-03', title: 'Collect inventory & emergency drug records', completed: false, assignee: 'Pooja Tiwari', assignees: ['Pooja Tiwari'], dueDate: '2026-09-16', priority: 'Medium', status: 'Pending', description: 'Gather stock registers for Essential Drugs List (EDL) and verify expiry logs.', estimatedHours: '4 hrs' }
      ]
    },
    {
      id: 'TSK-02',
      title: 'Monthly District Report — August',
      tag: '',
      description: 'Compile attendance, leave, and task completion data for August monthly review.',
      project: 'District Governance Performance Index',
      assignee: 'All Fellows',
      assignees: [
        { name: 'Dr. Neha Saxena', role: 'District Fellow', read: true, readAt: '05 Sep 2026, 02:00 PM' },
        { name: 'Alok Mishra', role: 'Policy Fellow', read: false, readAt: null },
        { name: 'Deepak Chouhan', role: 'Research Fellow', read: false, readAt: null }
      ],
      dueDate: '2026-09-05',
      priority: 'High',
      status: 'Pending',
      subtasks: [
        { id: 'ST-04', title: 'Extract August attendance data from bio-metrics', completed: true, assignee: 'Dr. Neha Saxena', dueDate: '2026-09-04', priority: 'Medium', status: 'Completed' },
        { id: 'ST-05', title: 'Consolidate block fellow achievement notes', completed: false, assignee: 'Alok Mishra', dueDate: '2026-09-05', priority: 'High', status: 'Pending' }
      ]
    },
    {
      id: 'TSK-03',
      title: 'Rural Infrastructure Assessment',
      tag: 'Survey',
      description: 'Document road and connectivity infrastructure conditions in assigned blocks.',
      project: 'Rural Connectivity & Public Works Audit',
      assignee: 'All Interns',
      assignees: [
        { name: 'Siddharth Sen', role: 'Infra Intern', read: true, readAt: '31 Jul 2026, 09:15 AM' },
        { name: 'Aakash Rathore', role: 'GIS Intern', read: true, readAt: '31 Jul 2026, 10:00 AM' },
        { name: 'Megha Patidar', role: 'Field Intern', read: true, readAt: '31 Jul 2026, 11:20 AM' },
        { name: 'Nikhil Jain', role: 'Audit Intern', read: true, readAt: '31 Jul 2026, 11:45 AM' }
      ],
      dueDate: '2026-07-31',
      priority: 'Medium',
      status: 'Overdue'
    },
    {
      id: 'TSK-04',
      title: 'Community Feedback Collection',
      tag: 'Survey',
      description: 'Gather community satisfaction feedback on government scheme delivery.',
      project: 'Public Scheme Delivery Assessment',
      assignee: 'All Interns',
      assignees: [
        { name: 'Tanvi Dubey', role: 'Feedback Intern', read: true, readAt: '18 Sep 2026, 09:30 AM' },
        { name: 'Gaurav Yadav', role: 'Field Intern', read: false, readAt: null },
        { name: 'Divya Rajput', role: 'Community Intern', read: false, readAt: null },
        { name: 'Kunal Malviya', role: 'Survey Intern', read: true, readAt: '18 Sep 2026, 01:00 PM' },
        { name: 'Preeti Solanki', role: 'Data Intern', read: false, readAt: null }
      ],
      dueDate: '2026-09-18',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      id: 'TSK-05',
      title: 'Digital Literacy Workshop & Gram Panchayat Drive',
      tag: '',
      description: 'Conduct 2-day digital literacy awareness session at gram panchayat level.',
      project: 'Digital Inclusion Drive',
      assignee: 'All Interns',
      assignees: [
        { name: 'Priya Patel', role: 'Digital Training Intern', read: false, readAt: null }
      ],
      dueDate: '2026-09-28',
      priority: 'Low',
      status: 'In Progress'
    },
    {
      id: 'TSK-06',
      title: 'Divisional Review & Orientation Drive',
      tag: '',
      description: 'Coordinate with all district Fellows for quarterly performance review and intern orientation.',
      project: 'State Capacity Building Framework',
      assignee: 'All Fellows',
      assignees: [
        { name: 'Virendra Singh', role: 'Divisional Coordinator', read: true, readAt: '20 Sep 2026, 10:00 AM' },
        { name: 'Anuradha Mehta', role: 'Orientation Lead', read: true, readAt: '20 Sep 2026, 11:20 AM' },
        { name: 'Sanjay Deshmukh', role: 'Program Coordinator', read: false, readAt: null },
        { name: 'Ritu Bhargava', role: 'Capacity Coordinator', read: true, readAt: '20 Sep 2026, 03:15 PM' },
        { name: 'Harish Parihar', role: 'Training Coordinator', read: true, readAt: '20 Sep 2026, 04:45 PM' },
        { name: 'Sunil Shrivastava', role: 'Monitoring Coordinator', read: false, readAt: null }
      ],
      dueDate: '2026-09-20',
      priority: 'High',
      status: 'Completed'
    }
  ];

  const DEFAULT_SURVEYS = [
    {
      id: 'SRV-01',
      name: 'Baseline Household Field Evaluation Survey',
      description: 'Field questionnaire deployed to assess household status across target project clusters.',
      project: 'Socio-Economic Baseline Study of Tribal Livelihoods',
      minRespondents: 100,
      targetSample: 100,
      collectedSamples: 68,
      progress: 68,
      assignedSurveyors: ['Rajesh Kumar', 'Sunita Meena', 'Vikas Tiwari', 'Anita Das'],
      questions: [...DEFAULT_QUESTION_BANK],
      status: 'Active'
    },
    {
      id: 'SRV-02',
      name: 'Primary Health Center Service Delivery Audit',
      description: 'Facility readiness and patient satisfaction assessment across community health centers.',
      project: 'Evaluation of Rural Healthcare Infrastructure',
      minRespondents: 50,
      targetSample: 50,
      collectedSamples: 42,
      progress: 84,
      assignedSurveyors: ['Dr. Ramesh Chandra', 'Kavita Solanki'],
      questions: DEFAULT_QUESTION_BANK.slice(0, 6),
      status: 'Active'
    }
  ];

  const DEFAULT_MEETINGS = [
    {
      id: 'MTG-01',
      title: 'Field Methodology Review & Investigator Briefing',
      agenda: 'Coordinate with Field Investigators to review data collection progress, sampling roadblocks, and mobile sync quality.',
      project: 'Evaluation of Rural Healthcare Infrastructure',
      dateTime: '2026-10-15 15:00',
      mode: 'Virtual (Google Meet)',
      attendees: 'Senior Advisor, Research Associate, Fellow, Field Investigators',
      participants: [
        { name: 'Dr. Alok Verma (Advisor)', status: 'Accepted' },
        { name: 'Priya Verma (RA)', status: 'Accepted' },
        { name: 'Rahul Sharma (Fellow)', status: 'Accepted' },
        { name: 'Rajesh Kumar (Field Lead)', status: 'Accepted' },
        { name: 'Sunita Meena (Investigator)', status: 'Pending' }
      ],
      status: 'Scheduled'
    }
  ];

  function get(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('LocalStorage read error for key:', key, e);
    }
    return defaultVal;
  }

  function set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write error for key:', key, e);
    }
  }

  return {
    // Projects
    getProjects: function () {
      let list = get(KEYS.PROJECTS, null);
      if (!list || list.length === 0) {
        set(KEYS.PROJECTS, DEFAULT_PROJECTS);
        return DEFAULT_PROJECTS;
      }
      return list.map(p => {
        if ((!p.budgetHeads || p.budgetHeads.length === 0) && (p.id === 'PRJ-01' || p.code === 'PRJ-01')) {
          p.budgetHeads = [
            {
              id: 'BH-01',
              name: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
              mode: 'detailed',
              lumpSumAmount: 0,
              subItems: [
                { id: 'sub-1', particular: 'Lead Policy Fellow', units: 1, period: 12, unitType: 'Months', costPerUnit: 125000, total: 1500000 },
                { id: 'sub-2', particular: 'Lead Policy Fellow', units: 1, period: 1, unitType: 'Months', costPerUnit: 125000, total: 125000 }
              ]
            },
            {
              id: 'BH-02',
              name: 'Travel Allowances & Field Mobility (BH-TRV-02)',
              mode: 'lumpSum',
              lumpSumAmount: 25000,
              subItems: []
            }
          ];
          p.budgetSummary = {
            subTotal: 1525000,
            overheadsPct: 15,
            overheadsAmount: 228750,
            totalEstimatedCost: 1753750
          };
        }
        if (p.financialYear) {
          if (p.financialYear.includes('2026') && p.financialYear.includes('2027')) {
            p.financialYear = '2026–2027';
          } else if (p.financialYear.includes('2025') && p.financialYear.includes('2026')) {
            p.financialYear = '2025–2026';
          } else if (p.financialYear.includes('2024') && p.financialYear.includes('2025')) {
            p.financialYear = '2024–2025';
          } else {
            p.financialYear = p.financialYear.replace(/^FY\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim();
          }
        } else {
          p.financialYear = '2026–2027';
        }
        return p;
      });
    },
    saveProjects: (data) => set(KEYS.PROJECTS, data),
    addProject: function (p) {
      const list = this.getProjects();
      list.unshift(p);
      this.saveProjects(list);
    },
    updateProject: function (updatedProject) {
      const list = this.getProjects();
      const idx = list.findIndex(p => p.id === updatedProject.id);
      if (idx !== -1) {
        list[idx] = updatedProject;
      } else {
        list.unshift(updatedProject);
      }
      this.saveProjects(list);
      return updatedProject;
    },
    updateProjectBudgetDetails: function (projectId, budgetData) {
      const list = this.getProjects();
      const p = list.find(x => x.id === projectId);
      if (p) {
        p.budgetHeads = budgetData.heads || [];
        p.budgetItems = budgetData.items || [];
        p.budgetSummary = budgetData.summary || {};
        if (typeof budgetData.totalEstimatedCost !== 'undefined') {
          p.budgetSanctioned = budgetData.totalEstimatedCost;
        }
        this.saveProjects(list);
      }
      return p;
    },

    // Question Bank
    getQuestionBank: function () {
      const stored = get(KEYS.QUESTION_BANK, null);
      if (!stored || stored.length < 8) {
        set(KEYS.QUESTION_BANK, DEFAULT_QUESTION_BANK);
        return DEFAULT_QUESTION_BANK;
      }
      return stored;
    },
    resetToDefaultQuestions: function () {
      set(KEYS.QUESTION_BANK, DEFAULT_QUESTION_BANK);
      return DEFAULT_QUESTION_BANK;
    },
    saveQuestionBank: (data) => set(KEYS.QUESTION_BANK, data),
    getQuestions: function () { return this.getQuestionBank(); },
    saveQuestions: function (data) { return this.saveQuestionBank(data); },
    addQuestion: function (q) {
      const list = this.getQuestionBank();
      list.push(q);
      this.saveQuestionBank(list);
    },
    deleteQuestion: function (id) {
      const list = this.getQuestionBank().filter(q => (q.id !== id && q.code !== id));
      this.saveQuestionBank(list);
    },
    clearQuestionBank: function () {
      this.saveQuestionBank([]);
    },

    // Surveys
    getSurveys: function () {
      let list = get(KEYS.SURVEYS, null);
      if (!list || list.length === 0) {
        set(KEYS.SURVEYS, DEFAULT_SURVEYS);
        return DEFAULT_SURVEYS;
      }
      list = list.map(s => {
        if (!s.assignedSurveyors || s.assignedSurveyors.length === 0) {
          s.assignedSurveyors = ['Rajesh Kumar', 'Sunita Meena', 'Vikas Tiwari'];
        }
        if (typeof s.targetSample === 'undefined') {
          s.targetSample = s.minRespondents || 100;
        }
        if (typeof s.collectedSamples === 'undefined') {
          s.collectedSamples = Math.round((s.targetSample || 100) * 0.65);
        }
        if (typeof s.progress === 'undefined') {
          s.progress = Math.min(100, Math.round((s.collectedSamples / (s.targetSample || 1)) * 100));
        }
        return s;
      });
      return list;
    },
    saveSurveys: (data) => set(KEYS.SURVEYS, data),
    addSurvey: function (s) {
      const list = this.getSurveys();
      list.unshift(s);
      this.saveSurveys(list);
    },
    deleteSurvey: function (id) {
      const list = this.getSurveys().filter(s => s.id !== id);
      this.saveSurveys(list);
    },
    toggleSurveyStatus: function (id) {
      const list = this.getSurveys();
      const s = list.find(x => x.id === id);
      if (s) {
        s.status = (s.status === 'Active') ? 'Completed' : 'Active';
        this.saveSurveys(list);
      }
      return s;
    },
    updateSurveyProgress: function (id, collected) {
      const list = this.getSurveys();
      const s = list.find(x => x.id === id);
      if (s) {
        s.collectedSamples = collected;
        s.progress = Math.min(100, Math.round((collected / (s.targetSample || 100)) * 100));
        this.saveSurveys(list);
      }
      return s;
    },

    // Tasks
    getTasks: function () {
      let list = get(KEYS.TASKS, null);
      // Only reset to defaults if the list has no real tasks AND no milestones
      // (milestones are user data that must not be wiped)
      const hasMilestones = list && list.some(t => t.isMilestone);
      if (!list || (!hasMilestones && (list.length < 6 || !list.some(t => t.id === 'TSK-01')))) {
        // Preserve any milestone tasks that exist in the current list
        const existingMilestones = (list || []).filter(t => t.isMilestone);
        const merged = [...DEFAULT_TASKS, ...existingMilestones];
        set(KEYS.TASKS, merged);
        return merged;
      }
      list = list.map(t => {
        if (!t.assignees || t.assignees.length === 0) {
          const names = (t.assignee || 'Assigned Member').split(',').map(s => s.trim());
          t.assignees = names.map((name, i) => ({
            name: name,
            role: 'Team Member',
            read: i === 0,
            readAt: i === 0 ? 'Today, 10:00 AM' : null
          }));
        }
        if (typeof t.progress === 'undefined') {
          t.progress = t.status === 'Completed' ? 100 : 60;
        }
        if (!Array.isArray(t.subtasks)) {
          t.subtasks = [];
        }
        if (t.id === 'TSK-02' && t.assignees && t.assignees[1] && t.assignees[1].name.includes('Sunita')) {
          if (t.assignees[1].readAt && (t.assignees[1].readAt.includes('Today') || t.assignees[1].readAt.includes('Just now'))) {
            t.assignees[1].read = false;
            t.assignees[1].readAt = null;
          }
        }
        return t;
      });
      return list;
    },
    saveTasks: (data) => set(KEYS.TASKS, data),
    addTask: function (t) {
      const list = this.getTasks();
      list.unshift(t);
      this.saveTasks(list);
    },
    updateTask: function (updatedTask) {
      const list = this.getTasks();
      const idx = list.findIndex(t => t.id === updatedTask.id);
      if (idx !== -1) {
        list[idx] = updatedTask;
        this.saveTasks(list);
      }
      return updatedTask;
    },
    updateTaskField: function (id, field, value) {
      const list = this.getTasks();
      const t = list.find(x => x.id === id);
      if (t) {
        t[field] = value;
        if (field === 'status' && value === 'Completed') {
          t.progress = 100;
        }
        this.saveTasks(list);
      }
      return t;
    },
    deleteTask: function (id) {
      const list = this.getTasks().filter(t => t.id !== id);
      this.saveTasks(list);
    },
    addSubtask: function (taskId, subtask) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t) {
        if (!Array.isArray(t.subtasks)) t.subtasks = [];
        const rawAssignees = Array.isArray(subtask.assignees) ? subtask.assignees : (subtask.assignee ? subtask.assignee.split(',').map(s => s.trim()).filter(Boolean) : []);
        const newSubtask = {
          id: 'ST-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
          title: (subtask.title || '').trim(),
          completed: !!subtask.completed,
          assignee: rawAssignees.join(', '),
          assignees: rawAssignees,
          dueDate: subtask.dueDate || t.dueDate || '2026-09-24',
          priority: subtask.priority || 'Medium',
          status: subtask.status || (subtask.completed ? 'Completed' : 'In Progress'),
          description: subtask.description || '',
          estimatedHours: subtask.estimatedHours || '',
          checklists: Array.isArray(subtask.checklists) ? subtask.checklists : [],
          createdAt: new Date().toISOString()
        };
        t.subtasks.push(newSubtask);
        this.saveTasks(list);
        return newSubtask;
      }
      return null;
    },
    updateSubtask: function (taskId, subtaskId, updatedData) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t && Array.isArray(t.subtasks)) {
        const idx = t.subtasks.findIndex(s => s.id === subtaskId);
        if (idx !== -1) {
          const rawAssignees = Array.isArray(updatedData.assignees)
            ? updatedData.assignees
            : (updatedData.assignee ? updatedData.assignee.split(',').map(s => s.trim()).filter(Boolean) : (t.subtasks[idx].assignees || []));
          t.subtasks[idx] = {
            ...t.subtasks[idx],
            ...updatedData,
            assignees: rawAssignees,
            assignee: rawAssignees.join(', '),
            completed: updatedData.status === 'Completed' ? true : (updatedData.status ? false : !!t.subtasks[idx].completed)
          };
          this.saveTasks(list);
          return t.subtasks[idx];
        }
      }
      return null;
    },
    toggleSubtask: function (taskId, subtaskId) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t && Array.isArray(t.subtasks)) {
        const st = t.subtasks.find(s => s.id === subtaskId);
        if (st) {
          st.completed = !st.completed;
          st.status = st.completed ? 'Completed' : 'In Progress';
          this.saveTasks(list);
          return st;
        }
      }
      return null;
    },
    deleteSubtask: function (taskId, subtaskId) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t && Array.isArray(t.subtasks)) {
        t.subtasks = t.subtasks.filter(s => s.id !== subtaskId);
        this.saveTasks(list);
      }
    },

    // Milestones
    getMilestones: function () {
      return get(KEYS.MILESTONES, []);
    },
    saveMilestones: function (data) {
      set(KEYS.MILESTONES, data);
    },
    getMilestonesForProject: function (projectId) {
      return this.getMilestones().filter(m => m.projectId === projectId);
    },
    /**
     * Creates 5 default research-phase milestones for a project.
     * Milestones are stored in BOTH the milestones index AND the tasks store
     * so they appear naturally in the Activities task table.
     * Safe to call multiple times — skips if milestones already exist for that project.
     */
    createDefaultMilestones: function (projectId, projectName) {
      if (!projectId) return [];

      // Guard: skip if already seeded (check tasks store)
      const existingTasks = this.getTasks();
      const alreadySeeded = existingTasks.some(t => t.isMilestone && t.projectId === projectId);
      if (alreadySeeded) return [];

      const MILESTONE_NAMES = [
        'Literature Review',
        'Questionnaire Development',
        'Field Survey',
        'Data Analysis',
        'Report Writing'
      ];

      const now = new Date();
      // Spread milestones across the next 12 months as placeholder due dates
      const newMilestones = MILESTONE_NAMES.map((name, i) => {
        const due = new Date(now);
        due.setMonth(due.getMonth() + (i + 1) * 2); // every 2 months
        const dueDateStr = due.toISOString().split('T')[0];

        return {
          id: 'MS-' + Date.now().toString(36) + '-' + i,
          projectId,
          project: projectName || '',          // used by activities.js project filter
          projectName: projectName || '',
          title: name,
          isMilestone: true,
          tag: 'Milestone',
          category: 'milestone',
          status: 'Pending',
          priority: 'Medium',
          assignees: [],
          assignee: '',
          dueDate: dueDateStr,
          description: '',
          subtasks: [],
          progress: 0,
          createdAt: new Date(now.getTime() + i).toISOString()
        };
      });

      // Add to tasks store so activities.js renderTable() picks them up
      const taskList = this.getTasks();
      newMilestones.forEach(m => taskList.unshift(m));
      this.saveTasks(taskList);

      // Also index in the milestones store
      const allMilestones = this.getMilestones();
      this.saveMilestones([...allMilestones, ...newMilestones]);

      return newMilestones;
    },
    updateMilestone: function (milestoneId, updatedData) {
      const list = this.getMilestones();
      const idx = list.findIndex(m => m.id === milestoneId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedData };
        this.saveMilestones(list);
        return list[idx];
      }
      return null;
    },
    deleteMilestone: function (milestoneId) {
      const list = this.getMilestones().filter(m => m.id !== milestoneId);
      this.saveMilestones(list);
    },
    updateSubtaskField: function (taskId, subtaskId, field, value) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t && Array.isArray(t.subtasks)) {
        const st = t.subtasks.find(s => s.id === subtaskId);
        if (st) {
          st[field] = value;
          if (field === 'assignees') {
            st.assignee = Array.isArray(value) ? value.join(', ') : (value || '');
          } else if (field === 'assignee') {
            st.assignees = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
          } else if (field === 'status') {
            st.completed = (value === 'Completed');
          } else if (field === 'completed') {
            st.status = value ? 'Completed' : 'In Progress';
          }
          this.saveTasks(list);
          return st;
        }
      }
      return null;
    },
    toggleTaskStatus: function (id) {
      const list = this.getTasks();
      const t = list.find(x => x.id === id);
      if (t) {
        t.status = (t.status === 'Active') ? 'Completed' : 'Active';
        if (t.status === 'Completed') t.progress = 100;
        this.saveTasks(list);
      }
      return t;
    },
    updateTaskProgress: function (id, progress) {
      const list = this.getTasks();
      const t = list.find(x => x.id === id);
      if (t) {
        t.progress = Math.max(0, Math.min(100, parseInt(progress) || 0));
        if (t.progress === 100) t.status = 'Completed';
        this.saveTasks(list);
      }
      return t;
    },
    toggleTaskReadReceipt: function (taskId, memberIdx) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (t && t.assignees && t.assignees[memberIdx]) {
        const mem = t.assignees[memberIdx];
        mem.read = !mem.read;
        mem.readAt = mem.read ? 'Just now' : null;
        this.saveTasks(list);
      }
      return t;
    },
    markTaskAsReadAutomatically: function (taskId, userName) {
      const list = this.getTasks();
      const t = list.find(x => x.id === taskId);
      if (!t || !t.assignees || t.assignees.length === 0) return { task: t, newlyMarked: false };

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timestamp = `Today, ${timeStr}`;

      let targetAssignee = null;
      if (userName) {
        targetAssignee = t.assignees.find(a => a.name.toLowerCase().includes(userName.toLowerCase()) && !a.read);
      }
      if (!targetAssignee) {
        targetAssignee = t.assignees.find(a => !a.read);
      }

      let newlyMarked = false;
      let memberName = '';
      if (targetAssignee) {
        targetAssignee.read = true;
        targetAssignee.readAt = timestamp;
        newlyMarked = true;
        memberName = targetAssignee.name;
        this.saveTasks(list);
      }

      return { task: t, newlyMarked, memberName, timestamp };
    },

    // Meetings
    getMeetings: function () {
      let list = get(KEYS.MEETINGS, null);
      if (!list || list.length === 0) {
        set(KEYS.MEETINGS, DEFAULT_MEETINGS);
        return DEFAULT_MEETINGS;
      }
      list = list.map(m => {
        if (!m.participants || m.participants.length === 0) {
          const names = (m.attendees || 'Advisor, RA, Fellow').split(',').map(s => s.trim());
          m.participants = names.map((name, i) => ({
            name: name,
            status: i < names.length - 1 ? 'Accepted' : 'Pending'
          }));
        }
        return m;
      });
      return list;
    },
    saveMeetings: (data) => set(KEYS.MEETINGS, data),
    addMeeting: function (m) {
      const list = this.getMeetings();
      list.unshift(m);
      this.saveMeetings(list);
    },
    deleteMeeting: function (id) {
      const list = this.getMeetings().filter(m => m.id !== id);
      this.saveMeetings(list);
    },
    toggleMeetingStatus: function (id) {
      const list = this.getMeetings();
      const m = list.find(x => x.id === id);
      if (m) {
        m.status = (m.status === 'Scheduled') ? 'Completed' : 'Scheduled';
        this.saveMeetings(list);
      }
      return m;
    },

    // Date & Time formatting helpers: dd/MM/yyyy
    formatDate: function (dateStr) {
      if (!dateStr) return '—';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, y, m, d] = match;
        return `${d}/${m}/${y}`;
      }
      const dt = new Date(dateStr);
      if (!isNaN(dt.getTime())) {
        const d = String(dt.getDate()).padStart(2, '0');
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const y = dt.getFullYear();
        return `${d}/${m}/${y}`;
      }
      return dateStr;
    },

    formatDateTime: function (dtStr) {
      if (!dtStr) return '—';
      const parts = String(dtStr).split(/[T ]/);
      const datePart = this.formatDate(parts[0]);
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        let hours = parseInt(timeParts[0], 10);
        const mins = timeParts[1] ? timeParts[1].substring(0, 2) : '00';
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');
        return `${datePart} · ${hoursStr}:${mins} ${ampm}`;
      }
      return datePart;
    }
  };
})();

window.Store = Store;

// Global Toast Notification Helper
function showToast(message) {
  let toast = document.getElementById('globalToastBox');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToastBox';
    toast.style.position = 'fixed';
    toast.style.bottom = '28px';
    toast.style.right = '28px';
    toast.style.background = '#1e293b';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="pi pi-check-circle" style="color: #4ade80;"></i><span>${message}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3200);
}

// ── Global Collapsible Sidebar Controller ──
(function initGlobalSidebar() {
  const COLLAPSE_KEY = 'aiggpa_sidebar_collapsed';

  function applySidebarState(isCollapsed) {
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
      if (document.body) document.body.classList.add('sidebar-collapsed');
      const sidebar = document.getElementById('mainSidebar');
      if (sidebar) sidebar.classList.add('collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
      if (document.body) document.body.classList.remove('sidebar-collapsed');
      const sidebar = document.getElementById('mainSidebar');
      if (sidebar) sidebar.classList.remove('collapsed');
    }
  }

  function toggleSidebarCollapse() {
    const isCurrentlyCollapsed = document.documentElement.classList.contains('sidebar-collapsed') ||
      (document.body && document.body.classList.contains('sidebar-collapsed'));
    const newState = !isCurrentlyCollapsed;
    applySidebarState(newState);
    try {
      localStorage.setItem(COLLAPSE_KEY, newState ? 'true' : 'false');
    } catch (e) {}
    return newState;
  }

  window.toggleAiggpaSidebar = toggleSidebarCollapse;
  window.applyAiggpaSidebarState = applySidebarState;

  // Immediately apply from localStorage
  try {
    if (localStorage.getItem(COLLAPSE_KEY) === 'true') {
      applySidebarState(true);
    }
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === 'true') {
        applySidebarState(true);
      }
    } catch (e) {}

    // Global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        // Only if not focused in an input/textarea
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          toggleSidebarCollapse();
        }
      }
    });
  });
})();

