export interface CenterItem {
  id: string;
  name: string;
  code: string;
}

export const initialCenterData: CenterItem[] = [
  {
    id: 'cat-1',
    name: 'Centre for Economy, Trade & Innovation (CETI)',
    code: 'CETI',
  },
  {
    id: 'cat-2',
    name: 'Centre for Health & Nutrition (CHN)',
    code: 'CHN',
  },
  {
    id: 'cat-3',
    name: 'Centre for Human Resource & Technology (CHR-T)',
    code: 'CHR-T',
  },
  {
    id: 'cat-4',
    name: 'Centre for Natural Resource Management & Decentralized (CNRM-DG)',
    code: 'CNRM-DG',
  },
  {
    id: 'cat-5',
    name: 'Centre for Urban Governance & Asset Management (CUGA)',
    code: 'CUGA',
  },
  {
    id: 'cat-6',
    name: 'Centre for Good Governance & Administrative Reforms (CGGAR)',
    code: 'CGGAR',
  },
];

export interface SchemeItem {
  id: string;
  financialYear: string;
  schemeName?: string;
  name: string;
  code: string;
  budgetAllocated?: string;
  isActive: boolean;
  createdAt: string;
}

export const initialSchemeData: SchemeItem[] = [
  {
    id: 'sch-1',
    financialYear: '2025-2026',
    name: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
    schemeName:
      'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
    code: '6483',
    budgetAllocated: '15,00,00,000',
    isActive: true,
    createdAt: '2025-04-01',
  },
  {
    id: 'sch-2',
    financialYear: '2025-2026',
    name: 'Strategy for promoting life science based economy in MP',
    schemeName: 'Strategy for promoting life science based economy in MP',
    code: '1165',
    budgetAllocated: '4,50,00,000',
    isActive: true,
    createdAt: '2025-04-01',
  },
  {
    id: 'sch-3',
    financialYear: '2025-2026',
    name: 'Research and Survey for Policy Design and Impact Assessment',
    schemeName:
      'Research and Survey for Policy Design and Impact Assessment',
    code: '7821',
    budgetAllocated: '8,00,00,000',
    isActive: true,
    createdAt: '2025-04-01',
  },
];

export type TimePeriodUnit = 'Days' | 'Months' | 'Years' | 'Trips' | 'Lump Sum' | string;

export interface ProjectSubHeadItem {
  id: string;
  subHeadId?: string;
  particulars?: string;
  units?: number;
  timePeriod?: number;
  timePeriodUnit?: TimePeriodUnit;
  costPerUnit?: number;
  formula?: string;
  estimatedCost?: number;
  spent?: number;
  name?: string;
  amount?: number;
}

export interface VoucherEntry {
  id?: string;
  type: 'Debit' | 'Credit';
  ledgerId?: string;
  ledgerName: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string;
  costCenterName?: string;
  subHeadId?: string;
}

export type VoucherType = 'Payment' | 'Receipt' | 'Journal' | 'Contra';

export interface VoucherItem {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  voucherType: VoucherType;
  financialYearId?: string;
  schemeId?: string;
  schemeName?: string;
  narration: string;
  totalAmount: number;
  entries: VoucherEntry[];
  status?: 'Draft' | 'Posted' | 'Approved' | 'Audited';
  createdAt?: string;
  updatedAt?: string;
  accountHead?: string;
  subHeadId?: string;
  debitAmount?: number;
  creditAmount?: number;
}

export const initialVoucherData: VoucherItem[] = [
  {
    id: 'vch-1',
    voucherNumber: 'VCH-2025-0101',
    voucherDate: '2025-05-12',
    voucherType: 'Payment',
    schemeId: 'sch-1',
    totalAmount: 350000,
    narration: 'Honorarium disbursement for Senior Policy Research Fellow',
    accountHead: 'Human Resources & Personnel',
    subHeadId: 'sub-1',
    entries: [
      {
        id: 'ent-1',
        type: 'Debit',
        ledgerName: 'Human Resources (HR & Research Personnel)',
        debitAmount: 350000,
        creditAmount: 0,
        subHeadId: 'sub-1-1',
      },
      {
        id: 'ent-2',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 350000,
      },
    ],
  },
  {
    id: 'vch-2',
    voucherNumber: 'VCH-2025-0142',
    voucherDate: '2025-06-20',
    voucherType: 'Payment',
    schemeId: 'sch-1',
    totalAmount: 180000,
    narration: 'Field survey logistics and enumerator travel allowances',
    accountHead: 'Travel Allowances & Mobility',
    subHeadId: 'sub-2',
    entries: [
      {
        id: 'ent-3',
        type: 'Debit',
        ledgerName: 'Travel Allowances & Mobility',
        debitAmount: 180000,
        creditAmount: 0,
        subHeadId: 'sub-1-2',
      },
      {
        id: 'ent-4',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 180000,
      },
    ],
  },
  {
    id: 'vch-3',
    voucherNumber: 'VCH-2025-0210',
    voucherDate: '2025-07-15',
    voucherType: 'Payment',
    schemeId: 'sch-1',
    totalAmount: 420000,
    narration: 'Policy symposium and stakeholder consultative workshop',
    accountHead: 'Workshops, Seminars & Training',
    subHeadId: 'sub-3',
    entries: [
      {
        id: 'ent-5',
        type: 'Debit',
        ledgerName: 'Workshops, Seminars & Policy Consultations',
        debitAmount: 420000,
        creditAmount: 0,
        subHeadId: 'sub-1-3',
      },
      {
        id: 'ent-6',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 420000,
      },
    ],
  },
  {
    id: 'vch-4',
    voucherNumber: 'VCH-2025-0285',
    voucherDate: '2025-08-04',
    voucherType: 'Payment',
    schemeId: 'sch-1',
    totalAmount: 125000,
    narration: 'Interim policy brief publication and distribution charges',
    accountHead: 'Printing, Stationery & Dissemination',
    subHeadId: 'sub-4',
    entries: [
      {
        id: 'ent-7',
        type: 'Debit',
        ledgerName: 'Printing, Stationery & Dissemination',
        debitAmount: 125000,
        creditAmount: 0,
        subHeadId: 'sub-1-4',
      },
      {
        id: 'ent-8',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 125000,
      },
    ],
  },
  {
    id: 'vch-5',
    voucherNumber: 'VCH-2025-0330',
    voucherDate: '2025-09-18',
    voucherType: 'Payment',
    schemeId: 'sch-1',
    totalAmount: 290000,
    narration: 'Statistical econometric dataset procurement and licensing',
    accountHead: 'Data Procurement & IT Infrastructure',
    subHeadId: 'sub-5',
    entries: [
      {
        id: 'ent-9',
        type: 'Debit',
        ledgerName: 'Data Procurement & IT Infrastructure',
        debitAmount: 290000,
        creditAmount: 0,
        subHeadId: 'sub-1-5',
      },
      {
        id: 'ent-10',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 290000,
      },
    ],
  },
  {
    id: 'vch-6',
    voucherNumber: 'VCH-2025-0412',
    voucherDate: '2025-10-25',
    voucherType: 'Payment',
    schemeId: 'sch-2',
    totalAmount: 550000,
    narration: 'Bio-economy laboratory consumables and field sampling testing',
    accountHead: 'Research Equipment & Consumables',
    subHeadId: 'sub-1',
    entries: [
      {
        id: 'ent-11',
        type: 'Debit',
        ledgerName: 'Research Equipment & Consumables',
        debitAmount: 550000,
        creditAmount: 0,
        subHeadId: 'sub-2-1',
      },
      {
        id: 'ent-12',
        type: 'Credit',
        ledgerName: 'Bank Account - SBI AIGGPA Operative',
        debitAmount: 0,
        creditAmount: 550000,
      },
    ],
  },
];
