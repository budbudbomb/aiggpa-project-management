/**
 * Survey Store & Initial Mock Data
 * Matching Schame-managemt exact dataset and behavior
 */

const DEFAULT_SURVEYS = [
  {
    id: 'survey-01',
    title: 'Block Livelihood Survey — Q3 2026',
    description: 'Quarterly survey to assess household livelihood and employment conditions across all blocks.',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    participantsRequired: 150,
    responsesCount: 112,
    status: 'active',
    submissionStatus: 'submitted_by_pc',
    createdBy: { name: 'Dr. Rajesh Verma', role: 'Chief Program Manager' },
    isAllocatedAsTask: true,
    createdAt: '2026-08-01T00:00:00Z',
    feedbacks: [
      {
        id: 'fb-01',
        submittedBy: { name: 'Amit Solanki', role: 'Intern' },
        role: 'intern',
        submittedToRole: 'fellow',
        feedbackText: 'High participation from self-help group members. Many households requested dedicated training on poultry farming and tailoring.',
        challengesFaced: 'Network connectivity was weak in 3 remote gram panchayats.',
        recommendations: 'Provide offline sync capability and distribute regional flyers.',
        stakeholdersInterviewedCount: 45,
        createdAt: '25 Aug 2026, 02:30 PM'
      },
      {
        id: 'fb-02',
        submittedBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
        role: 'fellow',
        submittedToRole: 'pc',
        feedbackText: 'Reviewed field responses across Ujjain district. Data quality is verified. Interns showed strong community engagement.',
        challengesFaced: 'Heavy monsoon rains delayed visits to 2 panchayats.',
        recommendations: 'Recommend coordinating with Block Development Officer for SHG linkage.',
        stakeholdersInterviewedCount: 88,
        createdAt: '28 Aug 2026, 04:00 PM'
      },
      {
        id: 'fb-03',
        submittedBy: { name: 'Dr. Rajesh Verma', role: 'Chief Program Manager' },
        role: 'pc',
        submittedToRole: 'spm_cpm',
        feedbackText: 'Divisional compilation complete with 112 verified responses. Key livelihood trends highlighted for policy team review.',
        challengesFaced: 'None at divisional level; cross-verified with district data.',
        recommendations: 'Fast-track scheme allocation for SHG enterprise loans in Q4.',
        stakeholdersInterviewedCount: 112,
        createdAt: '02 Sep 2026, 11:00 AM'
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        question: 'What is the primary source of household income?',
        options: ['Agriculture', 'Daily Wage Labor', 'Small Business / Shop', 'Government / Private Job'],
        required: true,
        allowImage: true
      },
      {
        id: 'q2',
        type: 'likert_scale',
        question: 'How satisfied is the community with current road connectivity?',
        likertConfig: {
          points: 5,
          lowLabel: 'Very Dissatisfied',
          midLabel: 'Neutral',
          highLabel: 'Very Satisfied',
          labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
        },
        required: true
      },
      {
        id: 'q3',
        type: 'dichotomous',
        question: 'Does the household have access to piped drinking water?',
        dichotomousLabels: ['Yes', 'No'],
        required: true,
        allowImage: true
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'Which welfare schemes does the household benefit from?',
        options: ['PM Kisan', 'Ladli Behna Yojana', 'Ayushman Bharat', 'Ration (PDS)', 'None'],
        required: true
      },
      {
        id: 'q5',
        type: 'descriptive',
        question: 'What are the main development challenges reported by the village head?',
        placeholder: 'Enter key observations, grievances, or community suggestions…',
        required: false,
        allowVoice: true,
        allowVideo: true
      }
    ]
  },
  {
    id: 'survey-02',
    title: 'Youth Digital Literacy & Employment Assessment',
    description: 'Assess digital skills, smartphone accessibility, and career training requirements for rural youth.',
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    participantsRequired: 200,
    responsesCount: 84,
    status: 'active',
    submissionStatus: 'submitted_by_fellow',
    createdBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
    isAllocatedAsTask: true,
    createdAt: '2026-08-15T00:00:00Z',
    feedbacks: [
      {
        id: 'fb-04',
        submittedBy: { name: 'Sunita Meena', role: 'Intern' },
        role: 'intern',
        submittedToRole: 'fellow',
        feedbackText: 'Interviewed 84 youth across 6 colleges and youth clubs. High appetite for coding and digital marketing training.',
        challengesFaced: 'Access to computer labs was limited in 2 colleges.',
        recommendations: 'Establish mobile digital literacy vans.',
        stakeholdersInterviewedCount: 84,
        createdAt: '01 Sep 2026, 03:00 PM'
      },
      {
        id: 'fb-05',
        submittedBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
        role: 'fellow',
        submittedToRole: 'pc',
        feedbackText: 'Validated youth responses. 72% expressed interest in state government digital certificate courses.',
        challengesFaced: 'Need coordination with Technical Education department.',
        recommendations: 'Align curriculum with MP Rozgar portal requirements.',
        stakeholdersInterviewedCount: 84,
        createdAt: '03 Sep 2026, 05:30 PM'
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'dichotomous',
        question: 'Does the candidate have personal access to a smartphone or computer?',
        dichotomousLabels: ['Yes', 'No'],
        required: true,
        allowImage: true
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Which digital skills are you interested in learning?',
        options: ['Basic Computer Operations', 'Digital Payments & Banking', 'Graphic Design & Media', 'Online Government Services (MP e-District)', 'Coding & Programming'],
        required: true
      },
      {
        id: 'q3',
        type: 'likert_scale',
        question: 'How confident are you in using digital payment apps (UPI, DBT)?',
        likertConfig: {
          points: 5,
          lowLabel: 'Not Confident',
          midLabel: 'Moderate',
          highLabel: 'Extremely Confident',
          labels: ['Not Confident', 'Slightly Confident', 'Moderate', 'Confident', 'Extremely Confident']
        },
        required: true
      },
      {
        id: 'q4',
        type: 'descriptive',
        question: 'Describe your educational background and career aspiration.',
        placeholder: 'Write a brief description…',
        required: true,
        allowVoice: true
      }
    ]
  },
  {
    id: 'survey-03',
    title: 'Primary Healthcare Center Accessibility Audit',
    description: 'Evaluating medicine availability, doctor attendance, and ambulance response time in rural PHCs.',
    startDate: '2026-09-01',
    endDate: '2026-09-25',
    participantsRequired: 75,
    responsesCount: 29,
    status: 'active',
    submissionStatus: 'draft',
    createdBy: { name: 'Pooja Sharma', role: 'CM Fellow' },
    isAllocatedAsTask: true,
    createdAt: '2026-09-01T00:00:00Z',
    feedbacks: [],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        question: 'Distance of the village from the nearest PHC / CHC?',
        options: ['Under 2 km', '2–5 km', '5–10 km', 'More than 10 km'],
        required: true
      },
      {
        id: 'q2',
        type: 'likert_scale',
        question: 'Quality of service received during the last visit to the health center:',
        likertConfig: {
          points: 5,
          lowLabel: 'Very Poor',
          midLabel: 'Average',
          highLabel: 'Excellent',
          labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
        },
        required: true
      },
      {
        id: 'q3',
        type: 'dichotomous',
        question: 'Are essential generic medicines available free of cost at the center?',
        dichotomousLabels: ['Yes', 'No'],
        required: true
      }
    ]
  }
];

const SurveyStore = {
  STORAGE_KEY: 'aiggpa_admin_surveys',

  getSurveys() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SURVEYS));
        return DEFAULT_SURVEYS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading surveys from localStorage', e);
      return DEFAULT_SURVEYS;
    }
  },

  getSurveyById(id) {
    const list = this.getSurveys();
    return list.find(s => s.id === id) || null;
  },

  saveSurvey(surveyData) {
    const list = this.getSurveys();
    const newSurvey = {
      id: surveyData.id || `survey-${Date.now()}`,
      title: surveyData.title || 'Untitled Survey',
      description: surveyData.description || '',
      startDate: surveyData.startDate || new Date().toISOString().split('T')[0],
      endDate: surveyData.endDate || new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      participantsRequired: Number(surveyData.participantsRequired) || 100,
      responsesCount: 0,
      status: surveyData.status || 'active',
      submissionStatus: surveyData.submissionStatus || 'draft',
      createdBy: { name: 'Dr. Rajesh Verma', role: 'Chief Program Manager' },
      isAllocatedAsTask: false,
      createdAt: new Date().toISOString(),
      feedbacks: [],
      documents: surveyData.documents || [],
      questions: surveyData.questions || []
    };

    list.unshift(newSurvey);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed saving survey to localStorage', e);
    }
    return newSurvey;
  },

  resetDefaults() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SURVEYS));
    return DEFAULT_SURVEYS;
  }
};

window.SurveyStore = SurveyStore;
