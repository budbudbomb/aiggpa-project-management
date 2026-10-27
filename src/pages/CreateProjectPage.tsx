import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import pageCss from '../styles/create-project.css?inline';
import { usePageStyles } from '../lib/usePageStyles';
import { useStoreData } from '../lib/storeEvents';
import Store from '../stores/projectStore';
import { MasterStore } from '../stores/masterStore';
import { ActivityTaskStore } from '../stores/activityTaskStore';
import { PageContainer } from '../components';
import type {
  BudgetHead,
  BudgetSubItem,
  BudgetSummary,
  Project,
} from '../stores/types';

type ViewMode = 'create' | 'edit' | 'budget' | 'list';
export type ProjectTab = 'general' | 'budget' | 'assignee';

interface CategoryConf {
  code: string;
  type: 'DTL' | 'LMP' | 'FXD';
  badge?: string;
  subNote?: string;
  subCategories: string[];
  defaultUnit?: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConf> = {
  'Human resources': {
    code: 'HR',
    type: 'DTL',
    subCategories: [
      'Research Associate',
      'Fellow',
      'Senior Advisor',
      'Lead Policy Fellow',
      'Field Investigator',
      'Data Analyst',
    ],
    defaultUnit: 'Months',
  },
  'Printing & Publications': {
    code: 'P&P',
    type: 'LMP',
    badge: 'Lump Sum',
    subCategories: [
      'Lump Sum Direct Allocation',
      'Report Printing & Publication',
      'Dissemination Materials',
    ],
    defaultUnit: 'Lump Sum',
  },
  Contingency: {
    code: 'CTG',
    type: 'LMP',
    badge: 'Lump Sum',
    subCategories: ['Contingency Allocation', 'Emergency Survey Contingency'],
    defaultUnit: 'Lump Sum',
  },
  'Institutional overheads cost': {
    code: 'IOC',
    type: 'FXD',
    badge: 'Fixed % Overhead',
    subNote: '(40% overhead)',
    subCategories: ['Institutional Overhead Charge'],
    defaultUnit: '% Overhead',
  },
};

const AVATAR_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#059669',
  '#d97706',
  '#0891b2',
  '#4f46e5',
  '#ca8a04',
  '#dc2626',
  '#475569',
];

function formatINR(val: string | number): string {
  const num = parseFloat(String(val)) || 0;
  return (
    '₹ ' +
    num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function calculateDuration(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr) return 0;
  const d1 = new Date(fromStr);
  const d2 = new Date(toStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 0;
  const days = diffTime / (1000 * 60 * 60 * 24);
  const months = Math.round(days / 30.4375);
  return Math.max(0, months);
}

function normalizeEditDate(d: string | number | null | undefined): string {
  if (!d) return '';
  const str = String(d);
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
  }
  return str;
}

function getInitials(name?: string): string {
  if (!name) return 'TM';
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

interface AssigneeEntry {
  name: string;
  role: string;
}

function getProjectAssignees(p: Project): AssigneeEntry[] {
  const list: AssigneeEntry[] = [];
  if (
    p.team &&
    Array.isArray(p.team.assignedDetails) &&
    p.team.assignedDetails.length > 0
  ) {
    p.team.assignedDetails.forEach(
      (item: {
        designation?: string;
        positions?: number;
        employees?: string[];
      }) => {
        if (item.employees && item.employees.length > 0) {
          item.employees.forEach(emp => {
            list.push({ name: emp, role: item.designation || 'Team Member' });
          });
        } else {
          const count = item.positions || 1;
          for (let i = 0; i < count; i++) {
            list.push({
              name: `${item.designation} #${i + 1}`,
              role: item.designation || 'Team Member',
            });
          }
        }
      }
    );
  }

  if (list.length === 0) {
    if (p.id === 'PRJ-01' || p.code === 'PRJ-01') {
      return [
        { name: 'Dr. Rameshwar Singh', role: 'Senior Advisor' },
        { name: 'Priya Patel', role: 'Research Associate' },
        { name: 'Sunita Meena', role: 'Fellow' },
        { name: 'Vikas Tiwari', role: 'Field Investigator' },
        { name: 'Amit Sharma', role: 'Field Investigator' },
        { name: 'Neha Saxena', role: 'Field Investigator' },
        { name: 'Rajesh Kumar', role: 'Field Investigator' },
      ];
    } else if (p.id === 'PRJ-02' || p.code === 'PRJ-02') {
      return [
        { name: 'Dr. Ananya Joshi', role: 'Lead / Advisor' },
        { name: 'Kavita Joshi', role: 'Research Associate' },
        { name: 'Rohan Sharma', role: 'Research Associate' },
        { name: 'Rahul Sharma', role: 'Fellow' },
        { name: 'Pooja Tiwari', role: 'Field Investigator' },
        { name: 'Alok Mishra', role: 'Field Investigator' },
        { name: 'Manish Verma', role: 'Field Investigator' },
        { name: 'Deepak Chouhan', role: 'Field Investigator' },
      ];
    } else if (p.id === 'PRJ-03' || p.code === 'PRJ-03') {
      return [
        { name: 'Prof. Manish Gupta', role: 'Advisor' },
        { name: 'Siddharth Sen', role: 'Research Associate' },
        { name: 'Aakash Rathore', role: 'Field Investigator' },
        { name: 'Megha Patidar', role: 'Field Investigator' },
        { name: 'Nikhil Jain', role: 'Field Investigator' },
      ];
    }
  }

  return list;
}

interface ProjectForm {
  id: string;
  name: string;
  localName: string;
  department: string;
  scheme: string;
  financialYear: string;
  fundingPattern: string;
  fromDate: string;
  toDate: string;
  duration: string;
  prcDate: string;
}

function createEmptyForm(): ProjectForm {
  return {
    id: '',
    name: '',
    localName: '',
    department: '',
    scheme: '',
    financialYear: '',
    fundingPattern: '',
    fromDate: '',
    toDate: '',
    duration: '0',
    prcDate: '',
  };
}

interface TeamRow {
  designation: string;
  positions: number;
  employees: string[];
}

function computeModalFormula(
  qtyStr: string,
  durStr: string,
  rateStr: string
): { total: string; formula: string } {
  const qty = parseFloat(qtyStr) || 0;
  const durRaw = parseFloat(durStr) || 0;
  const dur = durRaw === 0 ? 1 : durRaw;
  const rate = parseFloat(rateStr) || 0;

  let computed = 0;
  let formulaText = 'Quantity × Duration × Rate';

  if (qty > 0 && rate > 0) {
    computed = qty * dur * rate;
    formulaText = `${qty} × ${dur} × ₹ ${rate.toLocaleString('en-IN')} = ₹ ${computed.toLocaleString('en-IN')}`;
  }

  return { total: computed.toFixed(2), formula: formulaText };
}

export default function CreateProjectPage(): React.ReactElement {
  usePageStyles(pageCss);
  const version = useStoreData();
  const [params, setParams] = useSearchParams();

  const projects = useMemo(() => {
    void version;
    return Store.getProjects();
  }, [version]);

  const centers = useMemo(() => {
    void version;
    return MasterStore.getCenters();
  }, [version]);
  const schemes = useMemo(() => {
    void version;
    return MasterStore.getSchemes();
  }, [version]);
  const financialYears = useMemo(() => {
    void version;
    return MasterStore.getFinancialYears();
  }, [version]);
  const masterBudgetHeads = useMemo(() => {
    void version;
    return MasterStore.getBudgetHeads();
  }, [version]);
  const allEmployees = useMemo(() => {
    void version;
    return ActivityTaskStore.getEmployees();
  }, [version]);

  const activeCategoryConfig = useMemo(() => {
    const config: Record<string, CategoryConf> = { ...CATEGORY_CONFIG };
    masterBudgetHeads.forEach(head => {
      const headName = head.name || head.headName;
      if (!headName) return;
      config[headName] = {
        code: head.code || head.headCode,
        type:
          head.mode === 'lumpSum'
            ? 'LMP'
            : head.mode === 'overhead'
              ? 'FXD'
              : 'DTL',
        badge:
          head.badge ||
          (head.mode === 'lumpSum'
            ? 'Lump Sum'
            : head.mode === 'overhead'
              ? 'Fixed % Overhead'
              : undefined),
        subNote: head.subNote,
        subCategories:
          head.subParticulars && head.subParticulars.length > 0
            ? head.subParticulars
            : [headName],
        defaultUnit:
          head.defaultUnit || (head.mode === 'lumpSum' ? 'Lump Sum' : 'Months'),
      };
    });
    return config;
  }, [masterBudgetHeads]);

  const viewParam = params.get('view');
  const paramProjectId = params.get('projectId');
  const paramId = params.get('id');
  const tabParam = params.get('tab') as ProjectTab | null;

  const mode: ViewMode =
    viewParam === 'create' || viewParam === 'edit' || viewParam === 'budget'
      ? viewParam
      : 'list';

  const [lastBudgetId, setLastBudgetId] = useState<string | null>(null);
  const editingPid =
    paramId ||
    paramProjectId ||
    (mode === 'create' ? '' : projects[0]?.id || '');
  const activeProjectId =
    mode === 'create'
      ? lastBudgetId || ''
      : paramProjectId || paramId || lastBudgetId || projects[0]?.id || '';

  const [activeTab, setActiveTabState] = useState<ProjectTab>(() => {
    if (viewParam === 'budget') return 'budget';
    if (
      tabParam === 'budget' ||
      tabParam === 'assignee' ||
      tabParam === 'general'
    ) {
      return tabParam;
    }
    return 'general';
  });

  useEffect(() => {
    if (viewParam === 'budget' && activeTab !== 'budget') {
      setActiveTabState('budget');
    } else if (
      tabParam &&
      (tabParam === 'general' ||
        tabParam === 'budget' ||
        tabParam === 'assignee')
    ) {
      if (activeTab !== tabParam) {
        setActiveTabState(tabParam);
      }
    }
  }, [viewParam, tabParam, activeTab]);

  const switchTab = (tab: ProjectTab): void => {
    setActiveTabState(tab);
    const next = new URLSearchParams(params);
    next.set('tab', tab);
    if (mode === 'create') {
      next.set('view', 'create');
      if (activeProjectId) next.set('projectId', activeProjectId);
    } else if (tab === 'budget') {
      next.set('view', 'budget');
      if (activeProjectId) next.set('projectId', activeProjectId);
    } else {
      next.set('view', 'edit');
      if (activeProjectId) next.set('id', activeProjectId);
    }
    setParams(next, { replace: true });
  };

  const [form, setForm] = useState<ProjectForm>(createEmptyForm);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [listSearch, setListSearch] = useState('');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<number | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [mbCategory, setMbCategory] = useState('');
  const [mbSubCategory, setMbSubCategory] = useState('');
  const [mbUnitType, setMbUnitType] = useState('Months');
  const [mbQuantity, setMbQuantity] = useState('0');
  const [mbDuration, setMbDuration] = useState('0');
  const [mbRate, setMbRate] = useState('0.00');
  const [mbTotal, setMbTotal] = useState('0.00');
  const [mbFormula, setMbFormula] = useState('Quantity × Duration × Rate');
  const [mbLump, setMbLump] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignTeam, setAssignTeam] = useState<TeamRow[]>([]);
  const [desig, setDesig] = useState('');
  const [posCount, setPosCount] = useState('1');
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [empMenuOpen, setEmpMenuOpen] = useState(false);
  const [hoverTrashIdx, setHoverTrashIdx] = useState(-1);
  const [hoverEmpName, setHoverEmpName] = useState('');
  const empWrapRef = useRef<HTMLDivElement>(null);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);
  const heads = activeProject?.budgetHeads || [];

  const showToast = (msg: string): void => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mode === 'list' && (viewParam !== 'list' || paramId !== null)) {
      const next = new URLSearchParams(params);
      next.set('view', 'list');
      next.delete('id');
      setParams(next, { replace: true });
    }
  }, [mode, viewParam, paramId, params, setParams]);

  useEffect(() => {
    if (mode === 'create') {
      if (!lastBudgetId) {
        setForm(createEmptyForm());
        setAssignProjectId('');
        setAssignTeam([]);
      }
      return;
    }
    if (mode !== 'edit') return;
    const list = Store.getProjects();
    const p =
      list.find(x => x.id === editingPid || x.code === editingPid) || list[0];
    if (!p) return;
    setForm({
      id: p.id,
      name: p.name || '',
      localName: p.localName || p.name?.toLowerCase() || '',
      department: p.department || '',
      scheme: p.scheme || '',
      financialYear: p.financialYear || '',
      fundingPattern: p.fundingPattern || '',
      fromDate: normalizeEditDate(p.fromDate || ''),
      toDate: normalizeEditDate(p.toDate || ''),
      duration: p.durationMonths !== undefined ? String(p.durationMonths) : '0',
      prcDate: normalizeEditDate(p.prcDate || ''),
    });
    setAssignProjectId(p.id);
    loadAssignTeam(p.id);
  }, [mode, editingPid, lastBudgetId]);

  useEffect(() => {
    if (activeProjectId) {
      setAssignProjectId(activeProjectId);
      loadAssignTeam(activeProjectId);
    } else if (mode === 'create') {
      setAssignProjectId('');
      setAssignTeam([]);
    }
  }, [activeProjectId, mode]);

  useEffect(() => {
    const open = budgetModalOpen || assignOpen;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [budgetModalOpen, assignOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setAssignOpen(false);
        setBudgetModalOpen(false);
        setEmpMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!empMenuOpen) return;
    const handler = (e: MouseEvent): void => {
      const wrap = empWrapRef.current;
      if (wrap && !wrap.contains(e.target as Node)) setEmpMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [empMenuOpen]);

  const switchView = (
    v: ViewMode,
    pid?: string,
    targetTab?: ProjectTab
  ): void => {
    const next = new URLSearchParams(params);
    if (v === 'create') {
      next.set('view', 'create');
      next.delete('id');
      next.delete('projectId');
      const tab = targetTab || 'general';
      next.set('tab', tab);
      setActiveTabState(tab);
      setLastBudgetId(null);
      setAssignProjectId('');
      setAssignTeam([]);
      setForm(createEmptyForm());
      setParams(next, { replace: true });
    } else if (v === 'edit') {
      const targetId = pid || activeProjectId || projects[0]?.id || '';
      next.set('view', 'edit');
      next.set('id', targetId);
      next.set('projectId', targetId);
      const tab = targetTab || 'general';
      next.set('tab', tab);
      setActiveTabState(tab);
      setLastBudgetId(targetId);
      setAssignProjectId(targetId);
      loadAssignTeam(targetId);
      setParams(next, { replace: true });
    } else if (v === 'budget') {
      const bid = pid || activeProjectId || projects[0]?.id || '';
      next.set('view', 'budget');
      next.set('projectId', bid);
      next.set('tab', 'budget');
      setActiveTabState('budget');
      setParams(next, { replace: true });
      setLastBudgetId(bid);
    } else {
      next.set('view', 'list');
      next.delete('id');
      next.delete('projectId');
      next.delete('tab');
      setParams(next, { replace: true });
    }
  };

  const setField = (key: keyof ProjectForm, value: string): void => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (
    key: 'fromDate' | 'toDate' | 'prcDate',
    value: string
  ): void => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      if (key !== 'prcDate') {
        updated.duration = String(
          calculateDuration(updated.fromDate, updated.toDate)
        );
      }
      return updated;
    });
  };

  const saveProjectData = (showNotification = false): string | null => {
    const pName = form.name.trim();
    if (!pName) {
      alert('Please enter a Project Name');
      nameInputRef.current?.focus();
      return null;
    }

    const pId = form.id || 'PRJ-' + Date.now().toString().slice(-4);
    const list = Store.getProjects();
    const existing = list.find(x => x.id === pId);

    const projectData = {
      id: pId,
      code: pId,
      name: pName,
      localName: form.localName.trim(),
      department: form.department,
      scheme: form.scheme,
      financialYear: form.financialYear,
      fundingPattern: form.fundingPattern,
      fromDate: form.fromDate,
      toDate: form.toDate,
      durationMonths: parseInt(form.duration, 10) || 0,
      prcDate: form.prcDate,
      budgetSanctioned: existing?.budgetSanctioned || 0,
      budgetUtilized: existing?.budgetUtilized || 0,
      status: 'Submitted',
      isSubmitted: true,
      budgetHeads: existing?.budgetHeads || [],
      budgetSummary: existing?.budgetSummary || ({} as BudgetSummary),
      team: existing?.team || { assignedDetails: [] },
    } as Project;

    if (existing) {
      Store.updateProject(projectData);
      if (showNotification)
        showToast(`Project "${pName}" successfully updated!`);
    } else {
      Store.addProject(projectData);
      if (showNotification) showToast(`Project "${pName}" proposal created!`);
    }

    setForm(prev => ({ ...prev, id: pId }));
    setLastBudgetId(pId);
    setAssignProjectId(pId);
    return pId;
  };

  const handleSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const savedId = saveProjectData(true);
    if (!savedId) return;

    window.setTimeout(() => {
      switchView('list');
    }, 700);
  };

  const handleContinueToBudget = (): void => {
    const savedId = saveProjectData(true);
    if (!savedId) return;
    switchTab('budget');
  };

  const deleteBudgetSubItem = (headId: string, subId: string): void => {
    const p = activeProject;
    if (!p) return;
    const head = (p.budgetHeads || []).find(h => h.id === headId);
    if (!head || !head.subItems) return;
    head.subItems = head.subItems.filter(s => s.id !== subId);
    head.headTotal = head.subItems.reduce(
      (acc, s) => acc + (parseFloat(String(s.total)) || 0),
      0
    );
    Store.updateProject(p);
    showToast('Budget line item removed.');
  };

  const handleClearAllBudget = (): void => {
    const p = activeProject;
    if (!p) return;
    const hasItems = (p.budgetHeads || []).some(
      h => h.subItems && h.subItems.length > 0
    );
    if (!hasItems) {
      showToast('Budget list is already empty.');
      return;
    }
    if (
      window.confirm(
        'Are you sure you want to clear all budget line items for this project?'
      )
    ) {
      (p.budgetHeads || []).forEach(h => {
        h.subItems = [];
        h.headTotal = 0;
      });
      p.budgetSanctioned = 0;
      if (p.budgetSummary) {
        p.budgetSummary.subTotal = 0;
        p.budgetSummary.totalEstimatedCost = 0;
      }
      Store.updateProject(p);
      showToast('Budget items cleared.');
    }
  };

  const handleSaveBudgetDraft = (): void => {
    const p = activeProject;
    if (!p) {
      showToast('Please select a project first!');
      return;
    }
    const hasItems = (p.budgetHeads || []).some(
      h => h.subItems && h.subItems.length > 0
    );
    if (!hasItems) {
      showToast('Budget list is empty. Add items before saving.');
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    p.budgetSummary = {
      subTotal: subTotal,
      overheadsPct: 15,
      overheadsAmount: overheadAmount,
      totalEstimatedCost: totalBudget,
      status: 'Draft',
      lastSaved: nowTime,
    };
    p.budgetSanctioned = totalBudget;
    Store.updateProject(p);
    showToast(
      `Draft estimation for "${p.name || p.id}" saved (${formatINR(totalBudget)})!`
    );
  };

  const handleOpenSubmitConfirm = (): void => {
    const p = activeProject;
    if (!p) {
      showToast('Please select a project first!');
      return;
    }
    const hasItems = (p.budgetHeads || []).some(
      h => h.subItems && h.subItems.length > 0
    );
    if (!hasItems) {
      showToast('Budget list is empty. Add items before submitting.');
      return;
    }
    setSubmitConfirmOpen(true);
  };

  const handleConfirmSubmitBudget = (): void => {
    const p = activeProject;
    if (!p) return;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    p.budgetSummary = {
      subTotal: subTotal,
      overheadsPct: 15,
      overheadsAmount: overheadAmount,
      totalEstimatedCost: totalBudget,
      status: 'Submitted',
      lastSaved: nowTime,
    };
    p.budgetSanctioned = totalBudget;
    p.status = 'In Review';
    Store.updateProject(p);
    setSubmitConfirmOpen(false);
    showToast(
      `Budget Estimation for "${p.name || p.id}" submitted for approval (${formatINR(totalBudget)})!`
    );
  };

  const toggleCollapse = (headKey: string): void => {
    setCollapsed(prev =>
      prev.includes(headKey)
        ? prev.filter(k => k !== headKey)
        : [...prev, headKey]
    );
  };

  const toggleExpandAll = (): void => {
    if (collapsed.length === 0) {
      setCollapsed(heads.map(h => h.id || h.name));
    } else {
      setCollapsed([]);
    }
  };

  const expandAllLabel =
    heads.length > 0 && collapsed.length >= heads.length
      ? 'Expand All'
      : 'Collapse All';

  const handleBudgetProjectChange = (value: string): void => {
    setLastBudgetId(value);
    setAssignProjectId(value);
    loadAssignTeam(value);
    const next = new URLSearchParams(params);
    next.set('projectId', value);
    setParams(next, { replace: true });
  };

  const openBudgetModal = (): void => {
    setBudgetModalOpen(true);
    setMbCategory('');
    setMbSubCategory('');
    setMbUnitType('Months');
    setMbQuantity('0');
    setMbDuration('0');
    setMbRate('0.00');
    setMbTotal('0.00');
    setMbFormula('Quantity × Duration × Rate');
    setMbLump(false);
  };

  const closeBudgetModal = (): void => setBudgetModalOpen(false);

  const handleModalCategoryChange = (value: string): void => {
    setMbCategory(value);
    const conf = activeCategoryConfig[value];
    if (!conf) {
      setMbSubCategory('');
      setMbLump(false);
      return;
    }
    if (conf.type === 'LMP') {
      setMbLump(true);
      setMbSubCategory('Lump Sum Direct Allocation');
      setMbFormula('Direct Lump Sum Entry');
      return;
    }
    setMbLump(false);
    setMbSubCategory(conf.subCategories[0]);
    setMbUnitType(conf.defaultUnit || 'Months');
    const { total, formula } = computeModalFormula(
      mbQuantity,
      mbDuration,
      mbRate
    );
    setMbTotal(total);
    setMbFormula(formula);
  };

  const handleModalNumChange = (
    key: 'mbQuantity' | 'mbDuration' | 'mbRate',
    value: string
  ): void => {
    const conf = activeCategoryConfig[mbCategory];
    if (conf && conf.type === 'LMP') return;
    const qty = key === 'mbQuantity' ? value : mbQuantity;
    const dur = key === 'mbDuration' ? value : mbDuration;
    const rate = key === 'mbRate' ? value : mbRate;
    if (key === 'mbQuantity') setMbQuantity(value);
    else if (key === 'mbDuration') setMbDuration(value);
    else setMbRate(value);
    const { total, formula } = computeModalFormula(qty, dur, rate);
    setMbTotal(total);
    setMbFormula(formula);
  };

  const submitBudget = (): void => {
    const category = mbCategory;
    if (!category) {
      alert('Please select a Category');
      return;
    }

    const conf: Partial<CategoryConf> = activeCategoryConfig[category] || {};
    const isLump = conf.type === 'LMP';
    const subCategory = isLump
      ? 'Lump Sum Direct Allocation'
      : mbSubCategory || 'General';
    const unitType = isLump ? '-' : mbUnitType || 'Months';
    const qty = isLump ? '-' : parseFloat(mbQuantity) || 0;
    const dur = isLump ? '-' : parseFloat(mbDuration) || 0;
    const rate = isLump ? '-' : parseFloat(mbRate) || 0;
    const total = parseFloat(mbTotal) || 0;

    if (total <= 0) {
      alert('Estimated Amount must be greater than 0');
      return;
    }

    let p = activeProject;
    if (!p) {
      if (!form.name.trim()) {
        alert(
          'Please enter a Project Name in General Details first before adding budget items.'
        );
        switchTab('general');
        return;
      }
      const savedPid = saveProjectData(false);
      if (!savedPid) return;
      p = Store.getProjects().find(x => x.id === savedPid) || null;
      if (!p) return;
    }
    if (!p.budgetHeads) p.budgetHeads = [];

    let head = p.budgetHeads.find(h =>
      (h.name || '').toLowerCase().includes(category.toLowerCase())
    );
    if (!head) {
      head = {
        id: 'BH-' + Date.now().toString().slice(-4),
        name: `${p.budgetHeads.length + 1}. ${category}`,
        code: conf.code || 'OTH',
        badge: conf.badge || '',
        mode: isLump ? 'lumpSum' : 'detailed',
        lumpSumAmount: 0,
        subItems: [],
        headTotal: 0,
      } as BudgetHead;
      p.budgetHeads.push(head);
    }

    head.subItems.push({
      id: 'sub-' + Date.now().toString().slice(-4),
      particular: subCategory,
      units: qty,
      period: dur,
      unitType: unitType,
      costPerUnit: rate,
      total: total,
    } as BudgetSubItem);

    head.headTotal = head.subItems.reduce(
      (acc, s) => acc + (parseFloat(String(s.total)) || 0),
      0
    );

    Store.updateProject(p);
    closeBudgetModal();
    showToast(`Budget item "${subCategory}" successfully added!`);
  };

  const loadAssignTeam = (pid: string): void => {
    setDesig('');
    setPosCount('1');
    setSelectedEmps([]);
    setEmpMenuOpen(false);
    if (!pid) {
      setAssignTeam([]);
      return;
    }
    const project = Store.getProjects().find(p => p.id === pid);
    if (!project) {
      setAssignTeam([]);
      return;
    }
    const assignedDetails = (
      project.team as { assignedDetails?: TeamRow[] } | undefined
    )?.assignedDetails;
    if (Array.isArray(assignedDetails) && assignedDetails.length > 0) {
      setAssignTeam(JSON.parse(JSON.stringify(assignedDetails)));
      return;
    }
    const defaults = getProjectAssignees(project);
    if (!defaults || defaults.length === 0) {
      setAssignTeam([]);
      return;
    }
    const groups: Record<string, string[]> = {};
    defaults.forEach(d => {
      const role = d.role || 'Field Investigator';
      if (!groups[role]) groups[role] = [];
      groups[role].push(d.name);
    });
    setAssignTeam(
      Object.keys(groups).map(role => ({
        designation: role,
        positions: groups[role].length,
        employees: groups[role],
      }))
    );
  };

  const openAssigneeModal = (pid?: string): void => {
    const target = pid || activeProjectId || projects[0]?.id || '';
    setAssignProjectId(target);
    setLastBudgetId(target);
    loadAssignTeam(target);
    switchView('edit', target, 'assignee');
  };

  const closeAssigneeModal = (): void => {
    setAssignOpen(false);
    setEmpMenuOpen(false);
  };

  const handleAssignProjectChange = (value: string): void => {
    if (!value) {
      setAssignProjectId('');
      setAssignTeam([]);
      const next = new URLSearchParams(params);
      next.delete('projectId');
      setParams(next, { replace: true });
      return;
    }
    setAssignProjectId(value);
    setLastBudgetId(value);
    loadAssignTeam(value);
    const next = new URLSearchParams(params);
    next.set('projectId', value);
    setParams(next, { replace: true });
  };

  const handleDesigChange = (value: string): void => {
    setDesig(value);
    setSelectedEmps([]);
  };

  const toggleEmp = (emp: string): void => {
    const next = selectedEmps.includes(emp)
      ? selectedEmps.filter(e => e !== emp)
      : [...selectedEmps, emp];
    setSelectedEmps(next);
    if ((parseInt(posCount, 10) || 0) < next.length)
      setPosCount(String(next.length));
  };

  const addTeamRow = (): void => {
    const count = parseInt(posCount, 10) || 0;
    if (!desig || count < 1) {
      alert('Please select a designation and enter at least 1 position.');
      return;
    }
    setAssignTeam([
      ...assignTeam,
      {
        designation: desig,
        positions: Math.max(count, selectedEmps.length, 1),
        employees: selectedEmps,
      },
    ]);
    setDesig('');
    setPosCount('1');
    setSelectedEmps([]);
  };

  const removeTeamRow = (index: number): void => {
    setAssignTeam(assignTeam.filter((_, idx) => idx !== index));
  };

  const saveTeam = (): void => {
    let targetPid = assignProjectId || activeProjectId;
    let project = targetPid
      ? Store.getProjects().find(p => p.id === targetPid)
      : null;
    if (!project) {
      if (!form.name.trim()) {
        alert(
          'Please enter a Project Name in General Details first before allocating team members.'
        );
        switchTab('general');
        return;
      }
      const savedPid = saveProjectData(false);
      if (!savedPid) return;
      targetPid = savedPid;
      project = Store.getProjects().find(p => p.id === savedPid);
      if (!project) return;
    }

    let sa = 0;
    let ra = 0;
    let fel = 0;
    let inv = 0;
    let total = 0;
    assignTeam.forEach(item => {
      total += item.positions;
      const d = (item.designation || '').toLowerCase();
      if (d.includes('senior') || d.includes('advisor')) sa += item.positions;
      else if (d.includes('associate') || d.includes('ra'))
        ra += item.positions;
      else if (d.includes('fellow')) fel += item.positions;
      else inv += item.positions;
    });

    project.team = {
      advisor: sa,
      ra: ra,
      fellow: fel,
      investigators: inv,
      totalMembers: total || 1,
      assignedDetails: assignTeam,
    };
    Store.updateProject(project);

    // Sync allocated team members to MasterStore Project Allocations
    assignTeam.forEach(item => {
      if (item.employees && item.employees.length > 0) {
        item.employees.forEach(empName => {
          const empObj = allEmployees.find(
            e => e.name.toLowerCase() === empName.toLowerCase()
          );
          if (empObj) {
            MasterStore.addProjectAllocation(
              project.id,
              empObj.id,
              item.designation
            );
          }
        });
      }
    });

    if (typeof Store.createDefaultMilestones === 'function') {
      Store.createDefaultMilestones(project.id, project.name);
    }
    showToast(`Team assignees saved for "${project.name}"!`);
    closeAssigneeModal();
  };

  const headerInfo = useMemo(() => {
    if (mode === 'list') {
      return {
        title: 'Projects Master List',
        subtitle:
          'Comprehensive repository of sanctioned and proposed projects',
      };
    }
    const isEdit = mode === 'edit';
    const projName = activeProject?.name ? ` — ${activeProject.name}` : '';
    if (activeTab === 'budget') {
      return {
        title: isEdit
          ? `Project Budget Estimation${projName}`
          : 'Add Project Budget',
        subtitle:
          'Head-wise itemization, cost calculations & institutional overheads',
      };
    }
    if (activeTab === 'assignee') {
      return {
        title: isEdit
          ? `Project Team Assignees${projName}`
          : 'Assign Project Team',
        subtitle:
          'Allocate designations, required positions, and staff members for the project',
      };
    }
    return isEdit
      ? { title: `Edit Project${projName}`, subtitle: 'Modify project details' }
      : {
          title: 'Create Project',
          subtitle: 'Enter project details to create a new project proposal',
        };
  }, [mode, activeTab, activeProject]);

  const isStep1Completed = Boolean(
    form.name.trim() && form.department && form.scheme && form.financialYear
  );

  const isStep2Completed = Boolean(
    heads.some(h => (h.subItems || []).length > 0) ||
    (activeProject && (activeProject.budgetSanctioned || 0) > 0)
  );

  const isStep3Completed = Boolean(
    assignTeam.length > 0 ||
    (activeProject && getProjectAssignees(activeProject).length > 0)
  );

  const filteredProjects = useMemo(() => {
    const query = listSearch.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.scheme && p.scheme.toLowerCase().includes(query)) ||
        (p.department && p.department.toLowerCase().includes(query))
    );
  }, [projects, listSearch]);

  const filterText = budgetSearch.trim().toLowerCase();

  let subTotal = 0;
  heads.forEach(h => {
    if (h.mode !== 'overhead') {
      const itemSum = (h.subItems || []).reduce(
        (acc, s) => acc + (parseFloat(String(s.total)) || 0),
        0
      );
      const actualHeadTotal =
        typeof h.headTotal === 'number' && h.headTotal > 0
          ? h.headTotal
          : itemSum;
      subTotal += actualHeadTotal;
    }
  });
  const overheadAmount = Math.round(subTotal * 0.4 * 100) / 100;
  const totalBudget = subTotal + overheadAmount;

  const subtotalPct =
    totalBudget > 0
      ? `(${((subTotal / totalBudget) * 100).toFixed(2)}%)`
      : '(0%)';
  const overheadPctText =
    totalBudget > 0
      ? `(${((overheadAmount / totalBudget) * 100).toFixed(2)}%)`
      : '(0%)';

  const tableRows: React.ReactElement[] = [];
  heads.forEach(head => {
    const matchesHead = (head.name || '').toLowerCase().includes(filterText);
    const matchingSubItems = (head.subItems || []).filter(sub =>
      (sub.particular || '').toLowerCase().includes(filterText)
    );
    if (filterText && !matchesHead && matchingSubItems.length === 0) return;

    let catClass = 'cat-hr';
    if (head.code === 'P&P' || (head.name || '').includes('Printing'))
      catClass = 'cat-printing';
    else if (head.code === 'CTG' || (head.name || '').includes('Contingency'))
      catClass = 'cat-contingency';
    else if (
      head.code === 'IOC' ||
      head.mode === 'overhead' ||
      (head.name || '').includes('overhead')
    )
      catClass = 'cat-overhead';

    const headKey = head.id || head.name;
    const isCollapsed = collapsed.includes(headKey);
    const subItemsCount = head.subItems ? head.subItems.length : 0;
    const countText =
      subItemsCount === 1 ? '(1 sub-item)' : `(${subItemsCount} sub-items)`;
    const itemSum = (head.subItems || []).reduce(
      (acc, s) => acc + (parseFloat(String(s.total)) || 0),
      0
    );
    const effectiveHeadTotal =
      typeof head.headTotal === 'number' && head.headTotal > 0
        ? head.headTotal
        : itemSum;

    tableRows.push(
      <tr
        key={`cat-${headKey}`}
        className={`category-header-row ${catClass}`}
        style={{ cursor: 'pointer' }}
        onClick={() => toggleCollapse(headKey)}
      >
        <td colSpan={5}>
          <div className="category-title-box">
            <i
              className={`pi ${isCollapsed ? 'pi-chevron-right' : 'pi-chevron-down'} cat-chevron`}
            />
            <span>{head.name}</span>
            {head.code && <span className="cat-tag">{head.code}</span>}
            {head.badge && <span className="cat-tag">{head.badge}</span>}
            {head.subNote && <span className="cat-tag">{head.subNote}</span>}
            <span className="cat-subcount">{countText}</span>
          </div>
        </td>
        <td style={{ textAlign: 'right' }}>
          <span className="cat-total-pill">
            {formatINR(
              head.mode === 'overhead' ? overheadAmount : effectiveHeadTotal
            )}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <button type="button" className="cat-action-toggle">
            {isCollapsed ? (
              <>
                Show <i className="pi pi-chevron-down" />
              </>
            ) : (
              <>
                Hide <i className="pi pi-chevron-up" />
              </>
            )}
          </button>
        </td>
      </tr>
    );

    if (!isCollapsed && head.subItems && head.subItems.length > 0) {
      head.subItems.forEach((sub, subIdx) => {
        if (
          filterText &&
          !matchesHead &&
          !(sub.particular || '').toLowerCase().includes(filterText)
        )
          return;

        let unitBadge: React.ReactNode = sub.unitType;
        if (sub.unitType === 'Months')
          unitBadge = <span className="badge-unit-months">Months</span>;
        else if (sub.unitType === '% Overhead')
          unitBadge = <span className="badge-unit-overhead">% Overhead</span>;

        const cpu = sub.costPerUnit;
        let rateText: React.ReactNode =
          String(cpu) !== '-' ? formatINR(sub.costPerUnit) : '-';
        if (typeof cpu === 'string' && (cpu as string).includes('%')) {
          rateText = cpu;
        }

        let totalText = formatINR(sub.total);
        if (head.mode === 'overhead') totalText = formatINR(overheadAmount);

        tableRows.push(
          <tr
            className="subitem-row"
            key={`sub-${headKey}-${sub.id || subIdx}`}
          >
            <td>
              <div className="subitem-title-box">
                <div className="main-name">{sub.particular}</div>
                {sub.subtext && <div className="sub-note">{sub.subtext}</div>}
              </div>
            </td>
            <td style={{ textAlign: 'center' }}>{sub.units}</td>
            <td style={{ textAlign: 'center' }}>{sub.period}</td>
            <td style={{ textAlign: 'center' }}>{unitBadge}</td>
            <td style={{ textAlign: 'right' }}>{rateText}</td>
            <td style={{ textAlign: 'right', fontWeight: 700 }}>{totalText}</td>
            <td style={{ textAlign: 'center' }}>
              {head.mode === 'overhead' ? (
                '-'
              ) : (
                <button
                  type="button"
                  className="btn-delete-row"
                  title="Delete Line Item"
                  onClick={e => {
                    e.stopPropagation();
                    deleteBudgetSubItem(head.id, sub.id);
                  }}
                >
                  <i className="pi pi-trash" />
                </button>
              )}
            </td>
          </tr>
        );
      });
    }
  });

  const budgetSelectValue = projects.some(p => p.id === activeProjectId)
    ? activeProjectId
    : projects[0]?.id || '';
  const categoryOptions = Object.keys(activeCategoryConfig).filter(
    cat => activeCategoryConfig[cat].type !== 'FXD'
  );
  const employeeList = desig
    ? allEmployees
        .filter(e => {
          const d = desig.toLowerCase();
          const r = e.role.toLowerCase();
          if (r === d) return true;
          if (d.includes('advisor') && r.includes('head')) return true;
          if (
            d.includes('associate') &&
            (r.includes('analyst') || r.includes('fellow'))
          )
            return true;
          if (
            d.includes('investigator') &&
            (r.includes('fellow') || r.includes('intern'))
          )
            return true;
          return true; // allow allocating any active team member
        })
        .map(e => e.name)
    : [];
  const empSelectText =
    selectedEmps.length > 0 ? selectedEmps.join(', ') : 'Select employees...';
  const query = listSearch.trim().toLowerCase();

  return (
    <PageContainer>
      <div className="erp-page-header">
        <div className="page-title-group">
          <h1 id="erpPageTitle">{headerInfo.title}</h1>
          <p id="erpPageSubtitle">{headerInfo.subtitle}</p>
        </div>
        <div>
          <button
            type="button"
            className="btn-erp-navy"
            id="btnTopViewList"
            style={{ display: mode === 'list' ? 'none' : 'inline-flex' }}
            onClick={() =>
              mode === 'list' ? switchView('create') : switchView('list')
            }
          >
            <i className="pi pi-bars" />
            <span>View List</span>
          </button>
        </div>
      </div>

      {/* ── 3-Step Stepper Indicator Strip (General, Budget, Assignee) ── */}
      {mode !== 'list' && (
        <div className="project-stepper-box">
          <button
            type="button"
            className={`project-step-tab${activeTab === 'general' ? ' active' : isStep1Completed ? ' completed' : ''}`}
            id="stepTabGeneral"
            onClick={() => switchTab('general')}
          >
            <div className="project-step-num">
              {isStep1Completed && activeTab !== 'general' ? (
                <i
                  className="pi pi-check"
                  style={{ fontWeight: 900, fontSize: 13 }}
                />
              ) : (
                1
              )}
            </div>
            <div className="project-step-info">
              <h4>General Details</h4>
              <p>Project info, timeline &amp; department</p>
            </div>
          </button>

          <button
            type="button"
            className={`project-step-tab${activeTab === 'budget' ? ' active' : isStep2Completed ? ' completed' : ''}`}
            id="stepTabBudget"
            onClick={() => {
              if (!form.name.trim() && mode === 'create') {
                showToast('Please enter a Project Name first.');
                nameInputRef.current?.focus();
                return;
              }
              switchTab('budget');
            }}
          >
            <div className="project-step-num">
              {isStep2Completed && activeTab !== 'budget' ? (
                <i
                  className="pi pi-check"
                  style={{ fontWeight: 900, fontSize: 13 }}
                />
              ) : (
                2
              )}
            </div>
            <div className="project-step-info">
              <h4>Budget Allocation</h4>
              <p>Head-wise itemization &amp; costing</p>
            </div>
          </button>

          <button
            type="button"
            className={`project-step-tab${activeTab === 'assignee' ? ' active' : isStep3Completed ? ' completed' : ''}`}
            id="stepTabAssignee"
            onClick={() => {
              if (!form.name.trim() && mode === 'create') {
                showToast('Please enter a Project Name first.');
                nameInputRef.current?.focus();
                return;
              }
              switchTab('assignee');
            }}
          >
            <div className="project-step-num">
              {isStep3Completed && activeTab !== 'assignee' ? (
                <i
                  className="pi pi-check"
                  style={{ fontWeight: 900, fontSize: 13 }}
                />
              ) : (
                3
              )}
            </div>
            <div className="project-step-info">
              <h4>Team Assignees</h4>
              <p>Designations &amp; member allocations</p>
            </div>
          </button>
        </div>
      )}

      <div
        id="viewCreateProject"
        className="erp-form-card"
        style={{
          display:
            mode !== 'list' && activeTab === 'general' ? 'block' : 'none',
        }}
      >
        <form id="erpProjectForm" autoComplete="off" onSubmit={handleSubmit}>
          <input type="hidden" id="cpProjectId" value={form.id} readOnly />

          <div className="erp-form-grid-3">
            <div className="erp-form-field">
              <label htmlFor="cpProjectName">
                Project Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-input-wrapper">
                <input
                  type="text"
                  id="cpProjectName"
                  className="erp-form-input"
                  placeholder=""
                  required
                  maxLength={200}
                  ref={nameInputRef}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpLocalName">Local Name</label>
              <div className="erp-input-wrapper">
                <input
                  type="text"
                  id="cpLocalName"
                  className="erp-form-input"
                  placeholder=""
                  maxLength={100}
                  value={form.localName}
                  onChange={e => setField('localName', e.target.value)}
                />
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpDepartment">
                Department / Center <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-input-wrapper">
                <select
                  id="cpDepartment"
                  className="erp-form-select"
                  required
                  value={form.department}
                  onChange={e => setField('department', e.target.value)}
                >
                  <option value="">Select Department / Center</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.code ? `[${c.code}] ` : ''}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpScheme">
                Scheme <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-input-wrapper">
                <select
                  id="cpScheme"
                  className="erp-form-select"
                  required
                  value={form.scheme}
                  onChange={e => setField('scheme', e.target.value)}
                >
                  <option value="">Select Scheme</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.code ? `[${s.code}] ` : ''}
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpFinancialYear">
                Financial Year <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-input-wrapper">
                <select
                  id="cpFinancialYear"
                  className="erp-form-select"
                  required
                  value={form.financialYear}
                  onChange={e => setField('financialYear', e.target.value)}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map(fy => (
                    <option key={fy.id} value={fy.code}>
                      {fy.code} {fy.isCurrent ? '(Active Current FY)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpFundingPattern">
                Funding Pattern <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-input-wrapper">
                <select
                  id="cpFundingPattern"
                  className="erp-form-select"
                  required
                  value={form.fundingPattern}
                  onChange={e => setField('fundingPattern', e.target.value)}
                >
                  <option value="">Select Funding Pattern</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                  <option value="Composite">Composite</option>
                  <option value="Pro Bono">Pro Bono</option>
                </select>
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpFromDate">
                From Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-date-wrapper">
                <input
                  type="date"
                  id="cpFromDate"
                  className="erp-form-input"
                  required
                  value={form.fromDate}
                  onChange={e => handleDateChange('fromDate', e.target.value)}
                />
                <i className="pi pi-calendar date-icon" />
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpToDate">
                To Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="erp-date-wrapper">
                <input
                  type="date"
                  id="cpToDate"
                  className="erp-form-input"
                  required
                  value={form.toDate}
                  onChange={e => handleDateChange('toDate', e.target.value)}
                />
                <i className="pi pi-calendar date-icon" />
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpDuration">Duration Value (Months)</label>
              <div className="erp-input-wrapper">
                <input
                  type="number"
                  id="cpDuration"
                  className="erp-form-input"
                  value={form.duration}
                  readOnly
                  style={{
                    background: '#f8fafc',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                />
              </div>
            </div>

            <div className="erp-form-field">
              <label htmlFor="cpDateOfPrc">Date of PRC</label>
              <div className="erp-date-wrapper">
                <input
                  type="date"
                  id="cpDateOfPrc"
                  className="erp-form-input"
                  value={form.prcDate}
                  onChange={e => handleDateChange('prcDate', e.target.value)}
                />
                <i className="pi pi-calendar date-icon" />
              </div>
            </div>
          </div>

          <div className="step-nav-footer">
            <button
              type="button"
              className="btn-erp-outline"
              onClick={() => switchView('list')}
            >
              <i className="pi pi-arrow-left" />
              <span>Back to List</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="submit"
                className="btn-erp-submit"
                id="btnSubmitProject"
              >
                <i className="pi pi-save" />
                <span>
                  {mode === 'edit' ? 'Update Project' : 'Save Project'}
                </span>
              </button>
              <button
                type="button"
                className="btn-erp-navy"
                id="btnContinueToBudget"
                onClick={handleContinueToBudget}
              >
                <span>Continue to Budget</span>
                <i className="pi pi-arrow-right" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div
        id="viewAddBudget"
        style={{
          display: mode !== 'list' && activeTab === 'budget' ? 'block' : 'none',
        }}
      >
        <div className="budget-project-selector-bar">
          <label htmlFor="budgetProjectSelect">
            Select Project <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="erp-input-wrapper">
            <select
              id="budgetProjectSelect"
              className="erp-form-select"
              value={budgetSelectValue}
              onChange={e => handleBudgetProjectChange(e.target.value)}
            >
              {mode === 'create' &&
                !projects.some(p => p.id === activeProjectId) && (
                  <option value="">
                    {form.name.trim()
                      ? `(Draft) ${form.name.trim()}`
                      : '(Draft) New Project Proposal'}
                  </option>
                )}
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code || p.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="budget-tree-card" style={{ padding: 24 }}>
          <div className="budget-toolbar">
            <div className="budget-search-input-box">
              <i className="pi pi-search" />
              <input
                type="text"
                id="budgetSearchInput"
                placeholder="Search category / subcategory..."
                value={budgetSearch}
                onChange={e => setBudgetSearch(e.target.value)}
              />
            </div>
            <div className="budget-toolbar-actions">
              <button
                type="button"
                className="btn-erp-outline"
                id="btnExpandAll"
                onClick={toggleExpandAll}
              >
                <i className="pi pi-arrows-alt" />
                <span>{expandAllLabel}</span>
              </button>
              <button
                type="button"
                className="btn-erp-navy"
                id="btnOpenAddBudgetModal"
                onClick={openBudgetModal}
              >
                <i className="pi pi-plus" />
                <span>Add Budget</span>
              </button>
            </div>
          </div>

          <div
            style={{
              overflowX: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
            }}
          >
            <table className="budget-tree-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 260 }}>
                    Category &amp; Sub -Category Details
                  </th>
                  <th style={{ textAlign: 'center', width: 100 }}>Quantity</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Duration</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Unit Type</th>
                  <th style={{ textAlign: 'right', width: 130 }}>
                    Rate / Unit (₹)
                  </th>
                  <th style={{ textAlign: 'right', width: 140 }}>
                    Total Amount (₹)
                  </th>
                  <th style={{ textAlign: 'center', width: 90 }}>Action</th>
                </tr>
              </thead>
              <tbody id="budgetTableBody">
                {tableRows.length > 0 ? (
                  tableRows
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        padding: '40px 16px',
                        color: '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      <i
                        className="pi pi-inbox"
                        style={{
                          fontSize: '2rem',
                          marginBottom: 8,
                          display: 'block',
                          color: '#94a3b8',
                        }}
                      />
                      No budget line items added yet. Click &quot;Add
                      Budget&quot; to allocate heads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="budget-summary-strip">
            <div className="budget-metric-card metric-card-subtotal">
              <span className="metric-label">Sub Total</span>
              <span className="metric-val" id="txtBudgetSubTotal">
                {formatINR(subTotal)}
              </span>
              <span
                style={{ fontSize: '0.72rem', opacity: 0.85 }}
                id="txtBudgetSubTotalPct"
              >
                {subtotalPct}
              </span>
            </div>
            <div className="metric-math-symbol">+</div>
            <div className="budget-metric-card metric-card-overhead">
              <span className="metric-label">Overhead</span>
              <span className="metric-val" id="txtBudgetOverhead">
                {formatINR(overheadAmount)}
              </span>
              <span
                style={{ fontSize: '0.72rem', opacity: 0.85 }}
                id="txtBudgetOverheadPct"
              >
                {overheadPctText}
              </span>
            </div>
            <div className="metric-math-symbol">=</div>
            <div className="budget-metric-card metric-card-total">
              <span className="metric-label">Total Budget</span>
              <span className="metric-val" id="txtBudgetTotal">
                {formatINR(totalBudget)}
              </span>
              <span
                style={{ fontSize: '0.72rem', opacity: 0.85 }}
                id="txtBudgetTotalPct"
              >
                (100%)
              </span>
            </div>
          </div>

          {/* BUDGET ACTION BAR */}
          <div
            className="budget-action-bar"
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              padding: '16px 24px',
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              id="btnClearBudget"
              onClick={handleClearAllBudget}
              style={{
                background: '#ffffff',
                color: '#ef4444',
                border: '1.5px solid #fecaca',
                fontWeight: 700,
                height: 42,
                padding: '0 20px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                borderRadius: 8,
              }}
            >
              <i className="pi pi-trash" /> Clear
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              id="btnSaveBudgetDraft"
              onClick={handleSaveBudgetDraft}
              style={{
                background: '#ffffff',
                color: '#1d4ed8',
                border: '1.5px solid #bfdbfe',
                fontWeight: 700,
                height: 42,
                padding: '0 20px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(29,78,216,0.05)',
              }}
            >
              <i className="pi pi-save" /> Save Draft
            </button>
            <button
              type="button"
              className="btn btn-primary"
              id="btnSaveBudgetSubmit"
              onClick={handleOpenSubmitConfirm}
              style={{
                fontWeight: 800,
                height: 42,
                padding: '0 24px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                borderRadius: 8,
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
              }}
            >
              <i className="pi pi-send" /> Submit Budget
            </button>
          </div>
        </div>

        <div
          className="step-nav-footer"
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '16px 24px',
            border: '1px solid #e2e8f0',
            marginTop: 20,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <button
            type="button"
            className="btn-erp-outline"
            onClick={() => switchTab('general')}
          >
            <i className="pi pi-arrow-left" />
            <span>Back to General Details</span>
          </button>
          <button
            type="button"
            className="btn-erp-navy"
            onClick={() => switchTab('assignee')}
          >
            <span>Continue to Team Assignees</span>
            <i className="pi pi-arrow-right" />
          </button>
        </div>
      </div>

      <div
        id="viewAssignees"
        className="erp-form-card"
        style={{
          display:
            mode !== 'list' && activeTab === 'assignee' ? 'block' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
              }}
            >
              <i className="pi pi-users" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: '#0f172a',
                }}
              >
                Team Member Allocations
              </h3>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                Allocate designations, required positions, and staff members for
                the project
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-erp-outline"
            onClick={() => switchView('list')}
          >
            <i className="pi pi-bars" />
            <span>View List</span>
          </button>
        </div>

        <div className="budget-project-selector-bar">
          <label htmlFor="assignProjectSelect">
            Selected Project <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="erp-input-wrapper">
            <select
              id="assignProjectSelect"
              className="erp-form-select"
              value={assignProjectId || activeProjectId}
              onChange={e => handleAssignProjectChange(e.target.value)}
            >
              {mode === 'create' &&
                !projects.some(
                  p => p.id === (assignProjectId || activeProjectId)
                ) && (
                  <option value="">
                    {form.name.trim()
                      ? `(Draft) ${form.name.trim()}`
                      : '(Draft) New Project Proposal'}
                  </option>
                )}
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code ? `[${p.code}] ` : ''}
                  {p.name || p.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 110px 2fr auto',
              gap: 16,
              alignItems: 'flex-end',
            }}
          >
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: 6,
                  display: 'block',
                }}
              >
                Designation <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="modalTeamDesignationSelect"
                className="form-control-select"
                style={{
                  height: 42,
                  fontWeight: 600,
                  width: '100%',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  borderRadius: 8,
                }}
                value={desig}
                onChange={e => handleDesigChange(e.target.value)}
              >
                <option value="" disabled>
                  Select Designation...
                </option>
                <option value="Center Head">Center Head</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Research Analyst">Research Analyst</option>
                <option value="Fellow">Fellow</option>
                <option value="Intern">Intern</option>
                <option value="Senior Advisor">Senior Advisor</option>
                <option value="Research Associate">Research Associate</option>
                <option value="Field Investigator">Field Investigator</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: 6,
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Positions <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                id="modalTeamPositionCount"
                className="form-control-input"
                min={1}
                value={posCount}
                onChange={e => setPosCount(e.target.value)}
                style={{
                  height: 42,
                  fontWeight: 700,
                  textAlign: 'center',
                  width: '100%',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  borderRadius: 8,
                }}
              />
            </div>

            <div style={{ position: 'relative' }} ref={empWrapRef}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: 6,
                  display: 'block',
                }}
              >
                Select Employees <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                id="modalEmployeeDropdownTrigger"
                onClick={() => setEmpMenuOpen(o => !o)}
                style={{
                  height: 42,
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: '#ffffff',
                }}
              >
                <span
                  id="modalSelectedEmployeesText"
                  style={{
                    fontSize: '0.86rem',
                    color: '#64748b',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90%',
                  }}
                >
                  {empSelectText}
                </span>
                <i
                  className="pi pi-chevron-down"
                  style={{ color: '#64748b', fontSize: 11 }}
                />
              </div>

              <div
                id="modalEmployeeCheckboxMenu"
                style={{
                  display: empMenuOpen ? 'block' : 'none',
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    padding: 12,
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    display: desig ? 'none' : 'block',
                  }}
                  id="modalEmployeeMenuEmpty"
                >
                  Select a designation first
                </div>
                <div
                  id="modalEmployeeMenuList"
                  style={{
                    display: desig ? 'block' : 'none',
                    padding: '6px 0',
                  }}
                >
                  {employeeList.map(emp => (
                    <label
                      key={emp}
                      onMouseEnter={() => setHoverEmpName(emp)}
                      onMouseLeave={() => setHoverEmpName('')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                        background:
                          hoverEmpName === emp ? '#f1f5f9' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="modal-emp-checkbox"
                        checked={selectedEmps.includes(emp)}
                        onChange={() => toggleEmp(emp)}
                        style={{
                          accentColor: '#15803d',
                          width: 16,
                          height: 16,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: '#334155',
                          fontWeight: 600,
                        }}
                      >
                        {emp}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addTeamRow}
                style={{
                  height: 42,
                  padding: '0 20px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(24,55,212,0.2)',
                  whiteSpace: 'nowrap',
                  borderRadius: 8,
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <i className="pi pi-plus" /> Add Member
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#ffffff',
            marginBottom: 20,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead
              style={{
                background: '#f8fafc',
                borderBottom: '1.5px solid #e2e8f0',
              }}
            >
              <tr>
                <th
                  style={{
                    padding: '11px 14px',
                    color: '#475569',
                    fontWeight: 800,
                    width: 200,
                  }}
                >
                  Designation
                </th>
                <th
                  style={{
                    padding: '11px 14px',
                    color: '#475569',
                    fontWeight: 800,
                    width: 100,
                    textAlign: 'center',
                  }}
                >
                  Positions
                </th>
                <th
                  style={{
                    padding: '11px 14px',
                    color: '#475569',
                    fontWeight: 800,
                  }}
                >
                  Assigned Employees
                </th>
                <th
                  style={{
                    padding: '11px 14px',
                    width: 70,
                    textAlign: 'center',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody id="modalAssignedTeamTbody">
              {assignTeam.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    No team members assigned yet. Use the form above to add
                    members.
                  </td>
                </tr>
              ) : (
                assignTeam.map((item, idx) => (
                  <tr
                    key={`${item.designation}-${idx}`}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td
                      style={{
                        padding: '12px 14px',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {item.designation}
                    </td>
                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        fontWeight: 800,
                        color: '#1e3a8a',
                      }}
                    >
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1e3a8a',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: '0.82rem',
                          fontWeight: 800,
                        }}
                      >
                        {item.positions}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {item.employees && item.employees.length > 0 ? (
                        item.employees.map(emp => (
                          <span
                            key={emp}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: 14,
                              padding: '3px 10px 3px 6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#1e293b',
                              margin: '2px 4px 2px 0',
                            }}
                          >
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: getAvatarColor(emp),
                                color: '#fff',
                                fontSize: '0.65rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getInitials(emp)}
                            </span>
                            {emp}
                          </span>
                        ))
                      ) : (
                        <span
                          style={{
                            color: '#64748b',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                          }}
                        >
                          To be assigned later
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeTeamRow(idx)}
                        onMouseEnter={() => setHoverTrashIdx(idx)}
                        onMouseLeave={() => setHoverTrashIdx(-1)}
                        style={{
                          background:
                            hoverTrashIdx === idx ? '#fee2e2' : '#fef2f2',
                          color: '#ef4444',
                          border: 'none',
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        title="Remove Row"
                      >
                        <i className="pi pi-trash" style={{ fontSize: 13 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="step-nav-footer">
          <button
            type="button"
            className="btn-erp-outline"
            onClick={() => switchTab('budget')}
          >
            <i className="pi pi-arrow-left" />
            <span>Back to Budget Allocation</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn-erp-outline"
              onClick={() => switchView('list')}
            >
              <span>View All Projects</span>
            </button>
            <button type="button" className="btn-erp-navy" onClick={saveTeam}>
              <i className="pi pi-check-circle" />
              <span>Save Team Assignees</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="viewProjectsList"
        className="projects-list-card"
        style={{ display: mode === 'list' ? 'block' : 'none' }}
      >
        <div className="projects-filter-bar">
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="pi pi-list" style={{ color: '#2563eb' }} />
            <span>All Registered Projects</span>
            <span
              id="projectListCountBadge"
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '2px 9px',
                borderRadius: 12,
                border: '1px solid #bfdbfe',
              }}
            >
              {filteredProjects.length}{' '}
              {filteredProjects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="search-box"
              style={{ width: 240, position: 'relative' }}
            >
              <i
                className="pi pi-search search-icon"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 11,
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                }}
              />
              <input
                type="text"
                id="projectListSearchInput"
                placeholder="Search projects..."
                style={{
                  width: '100%',
                  height: 38,
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  paddingLeft: 34,
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-erp-navy"
              onClick={() => switchView('create')}
            >
              <i className="pi pi-plus" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>Project Name</th>
                <th>Department &amp; Scheme</th>
                <th>Financial Year</th>
                <th style={{ textAlign: 'center' }}>Timeline</th>
                <th style={{ textAlign: 'right' }}>Estimated Budget</th>
                <th>Assignees</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="projectsListTbody">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    No projects found matching "{query}".
                  </td>
                </tr>
              ) : (
                filteredProjects.map(p => {
                  const isSub =
                    p.isSubmitted !== false &&
                    (p.status === 'Submitted' || p.status === 'Active');
                  const durationStr = `${p.durationMonths || 12} Months`;
                  let budgetVal = p.budgetSanctioned;
                  if (
                    !budgetVal &&
                    p.budgetSummary &&
                    p.budgetSummary.totalEstimatedCost
                  ) {
                    budgetVal = p.budgetSummary.totalEstimatedCost;
                  }
                  if (!budgetVal) budgetVal = 55308.4;
                  const assignees = getProjectAssignees(p);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '0.9rem',
                            lineHeight: 1.35,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: '#64748b',
                            marginTop: 2,
                          }}
                        >
                          Local: {p.localName || '-'}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#334155',
                            fontSize: '0.84rem',
                          }}
                        >
                          {p.department || 'Center 11'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginTop: 1,
                            maxWidth: 220,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.scheme || '-'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            background: '#e0f2fe',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {p.financialYear || '2026–2027'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#1e40af',
                            fontWeight: 700,
                            background: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <i
                            className="pi pi-clock"
                            style={{ fontSize: '0.72rem', marginRight: 3 }}
                          />
                          {durationStr}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#0f172a',
                        }}
                      >
                        {formatINR(budgetVal)}
                      </td>
                      <td>
                        {assignees.length === 0 ? (
                          <div
                            className="assignee-avatar-group"
                            onClick={() => openAssigneeModal(p.id)}
                            title="Click to assign team members"
                            style={{ cursor: 'pointer' }}
                          >
                            <span
                              style={{
                                background: '#f8fafc',
                                border: '1.5px dashed #cbd5e1',
                                color: '#64748b',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                padding: '4px 10px',
                                borderRadius: 20,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                              }}
                            >
                              <i
                                className="pi pi-user-plus"
                                style={{ fontSize: 11 }}
                              />
                              <span>Assign</span>
                            </span>
                          </div>
                        ) : (
                          <div
                            className="assignee-avatar-group"
                            onClick={() => openAssigneeModal(p.id)}
                            title={`Assigned: ${assignees.map(a => a.name).join(', ')} (Click to view/assign team members)`}
                            style={{ cursor: 'pointer' }}
                          >
                            {assignees.slice(0, 4).map(m => (
                              <div
                                key={m.name}
                                className="assignee-avatar-circle"
                                style={{ background: getAvatarColor(m.name) }}
                                title={`${m.name} (${m.role})`}
                              >
                                {getInitials(m.name)}
                              </div>
                            ))}
                            {assignees.length > 4 && (
                              <div
                                className="assignee-avatar-more"
                                title={`${assignees.length - 4} more assignee${assignees.length - 4 > 1 ? 's' : ''}`}
                              >
                                +{assignees.length - 4}
                              </div>
                            )}
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#475569',
                              }}
                            >
                              {assignees.length}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isSub ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: 12,
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            Submitted
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: 12,
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            Draft
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            className="btn-action-edit"
                            title="Edit Project"
                            onClick={() => switchView('edit', p.id, 'general')}
                          >
                            <i className="pi pi-pencil" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-budget-view"
                            title="Manage Budget"
                            onClick={() => switchView('edit', p.id, 'budget')}
                          >
                            <i className="pi pi-wallet" />
                            <span>Budget</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="erp-modal-overlay"
        id="modalAddBudget"
        style={{ display: budgetModalOpen ? 'flex' : 'none' }}
      >
        <div className="erp-modal-box">
          <div className="erp-modal-header">
            <h3>Add Budget</h3>
            <button
              type="button"
              className="erp-modal-close-btn"
              id="btnCloseBudgetModal"
              onClick={closeBudgetModal}
            >
              &times;
            </button>
          </div>

          <div className="erp-modal-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              <div className="erp-form-field">
                <label htmlFor="modalBudgetCategory">
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="erp-input-wrapper">
                  <select
                    id="modalBudgetCategory"
                    className="erp-form-select"
                    value={mbCategory}
                    onChange={e => handleModalCategoryChange(e.target.value)}
                  >
                    <option value="">-- Select Category --</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="erp-form-field">
                <label htmlFor="modalBudgetSubCategory">Sub -category</label>
                <div className="erp-input-wrapper">
                  <select
                    id="modalBudgetSubCategory"
                    className="erp-form-select"
                    disabled={mbLump}
                    value={
                      mbLump ? 'Lump Sum Direct Allocation' : mbSubCategory
                    }
                    onChange={e => setMbSubCategory(e.target.value)}
                  >
                    {mbLump ? (
                      <option value="Lump Sum Direct Allocation">
                        Not applicable for Lump Sum
                      </option>
                    ) : mbSubCategory ? (
                      (
                        activeCategoryConfig[mbCategory]?.subCategories || [
                          mbSubCategory,
                        ]
                      ).map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))
                    ) : (
                      <option value="">Select Category first</option>
                    )}
                  </select>
                </div>
              </div>

              <div
                className="erp-form-field"
                style={{ display: mbLump ? 'none' : 'flex' }}
              >
                <label htmlFor="modalBudgetUnitType">Unit Type</label>
                <div className="erp-input-wrapper">
                  <select
                    id="modalBudgetUnitType"
                    className="erp-form-select"
                    value={mbUnitType}
                    onChange={e => setMbUnitType(e.target.value)}
                  >
                    <option value="">-- Select Unit --</option>
                    <option value="Months">Months</option>
                    <option value="Days">Days</option>
                    <option value="Trips">Trips</option>
                    <option value="Set">Set</option>
                    <option value="Piece">Piece</option>
                    <option value="% Overhead">% Overhead</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              <div
                className="erp-form-field"
                style={{ display: mbLump ? 'none' : 'flex' }}
              >
                <label htmlFor="modalBudgetQuantity">Quantity</label>
                <div className="modal-input-addon-wrap">
                  <span className="modal-addon-badge">#</span>
                  <input
                    type="number"
                    id="modalBudgetQuantity"
                    className="erp-form-input"
                    min={0}
                    value={mbQuantity}
                    onChange={e =>
                      handleModalNumChange('mbQuantity', e.target.value)
                    }
                  />
                </div>
              </div>

              <div
                className="erp-form-field"
                style={{ display: mbLump ? 'none' : 'flex' }}
              >
                <label htmlFor="modalBudgetDuration">Duration</label>
                <div className="modal-input-addon-wrap">
                  <span className="modal-addon-badge">
                    <i
                      className="pi pi-calendar"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </span>
                  <input
                    type="number"
                    id="modalBudgetDuration"
                    className="erp-form-input"
                    min={0}
                    value={mbDuration}
                    onChange={e =>
                      handleModalNumChange('mbDuration', e.target.value)
                    }
                  />
                </div>
              </div>

              <div
                className="erp-form-field"
                style={{ display: mbLump ? 'none' : 'flex' }}
              >
                <label htmlFor="modalBudgetRate">Cost / Unit (₹ Rate)</label>
                <div className="modal-input-addon-wrap">
                  <span className="modal-addon-badge">₹</span>
                  <input
                    type="number"
                    id="modalBudgetRate"
                    className="erp-form-input"
                    step={0.01}
                    min={0}
                    value={mbRate}
                    onChange={e =>
                      handleModalNumChange('mbRate', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: 16,
                alignItems: 'flex-end',
              }}
            >
              <div className="erp-form-field">
                <label htmlFor="modalBudgetTotal">
                  Total Estimated (₹){' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="modal-input-addon-wrap">
                  <span className="modal-addon-badge">₹</span>
                  <input
                    type="text"
                    id="modalBudgetTotal"
                    className={
                      mbLump
                        ? 'erp-form-input'
                        : 'erp-form-input modal-input-total'
                    }
                    readOnly={!mbLump}
                    value={mbTotal}
                    onChange={e => setMbTotal(e.target.value)}
                  />
                </div>
              </div>

              <div className="erp-form-field">
                <label>Calculation Breakdown</label>
                <div className="calculation-breakdown-box">
                  <span className="formula-label">Formula Preview</span>
                  <span className="formula-expr" id="modalFormulaPreview">
                    {mbFormula}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="erp-modal-footer">
            <button
              type="button"
              className="btn-erp-navy"
              id="btnSubmitBudget"
              onClick={submitBudget}
            >
              <span>Add Budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* FINAL SUBMIT CONFIRMATION MODAL */}
      <div
        id="submitConfirmModal"
        style={{
          display: submitConfirmOpen ? 'flex' : 'none',
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          zIndex: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)',
        }}
        onClick={() => setSubmitConfirmOpen(false)}
      >
        <div
          style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: 480,
            borderRadius: 14,
            boxShadow: '0 20px 35px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            margin: 16,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i
                className="pi pi-send"
                style={{ color: '#2563eb', fontSize: '1.1rem' }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                Submit Budget Estimation
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSubmitConfirmOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 16,
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '18px 20px' }}>
            <p
              style={{
                fontSize: '0.86rem',
                color: '#475569',
                margin: '0 0 14px 0',
              }}
            >
              Are you sure you want to finalize and submit this budget
              estimation? Below is the final summary:
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Selected Project:
                </span>
                <strong
                  id="modalProjectName"
                  style={{
                    color: '#0f172a',
                    maxWidth: 250,
                    textAlign: 'right',
                  }}
                >
                  {activeProject
                    ? `${activeProject.name} (${activeProject.id})`
                    : activeProjectId}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Total Line Items:
                </span>
                <strong id="modalTotalItems" style={{ color: '#0f172a' }}>
                  {heads.reduce(
                    (acc, h) => acc + (h.subItems ? h.subItems.length : 0),
                    0
                  )}{' '}
                  items
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Direct Heads Subtotal:
                </span>
                <strong id="modalSubtotal" style={{ color: '#0f172a' }}>
                  {formatINR(subTotal)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Institutional Overheads:
                </span>
                <strong id="modalOverheads" style={{ color: '#2563eb' }}>
                  {formatINR(overheadAmount)} {overheadPctText}
                </strong>
              </div>
              <div
                style={{
                  borderTop: '1.5px solid #e2e8f0',
                  paddingTop: 8,
                  marginTop: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    color: '#15803d',
                    textTransform: 'uppercase',
                    fontSize: '0.78rem',
                  }}
                >
                  Total Estimated Cost:
                </span>
                <strong
                  id="modalGrandTotal"
                  style={{
                    color: '#15803d',
                    fontSize: '1.18rem',
                    fontWeight: 900,
                  }}
                >
                  {formatINR(totalBudget)}
                </strong>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSubmitConfirmOpen(false)}
              style={{
                height: 36,
                padding: '0 16px',
                fontWeight: 700,
                fontSize: '0.84rem',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmSubmitBudget}
              style={{
                height: 36,
                padding: '0 18px',
                fontWeight: 800,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <i className="pi pi-check" /> Confirm &amp; Submit
            </button>
          </div>
        </div>
      </div>

      <div
        className="erp-toast"
        style={{ display: toastMsg ? 'flex' : 'none' }}
      >
        <i
          className="pi pi-check-circle"
          style={{ color: '#4ade80', fontSize: '1.15rem' }}
        />
        <span>{toastMsg}</span>
      </div>
    </PageContainer>
  );
}
