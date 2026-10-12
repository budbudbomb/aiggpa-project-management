import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Store from '../stores/projectStore';
import { MasterStore } from '../stores/masterStore';
import { useStoreData } from '../lib/storeEvents';
import type { QuestionBankItem } from '../stores/types';
import {
  PageContainer,
  PageHeader,
  AppButton,
  TableToolbar,
  DataTable,
  ActionIconButton,
} from '../components';
import {
  Plus,
  Trash2,
  Radio as RadioIcon,
  CheckSquare,
  Star,
  Hash,
  AlignLeft,
  Scale,
  Mic,
  Camera,
  Video,
  RefreshCw,
  Database,
  Check,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';

interface AnyQuestion extends QuestionBankItem {
  mediaVoice?: boolean;
  mediaPhoto?: boolean;
  mediaVideo?: boolean;
  media?: { voice?: boolean; photo?: boolean; video?: boolean };
}

interface ParsedQuestion {
  id: string;
  category: string;
  text: string;
  type: string;
  options: string;
  optionsList?: string[];
  voice: boolean;
  image: boolean;
  video: boolean;
}

interface TypeCard {
  type: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const CATEGORIES = [
  'Income & Livelihood',
  'Water & Sanitation',
  'Public Health & Nutrition',
  'Demographics & Household',
  'Education & Literacy',
  'Agriculture & Land Holdings',
  'Infrastructure & Energy',
  'General Governance',
];

const TYPE_CARDS: TypeCard[] = [
  {
    type: 'Single choice',
    icon: <RadioIcon className="w-4 h-4 text-blue-600" />,
    title: 'Single Choice',
    desc: 'Radio selection (one response only)',
  },
  {
    type: 'Multiple choice',
    icon: <CheckSquare className="w-4 h-4 text-blue-600" />,
    title: 'Multiple Choice',
    desc: 'Checkboxes (select multiple options)',
  },
  {
    type: 'Dichotomous',
    icon: <Scale className="w-4 h-4 text-emerald-600" />,
    title: 'Yes / No',
    desc: 'Binary confirmation or boolean check',
  },
  {
    type: 'Likert Scale',
    icon: <Star className="w-4 h-4 text-amber-500" />,
    title: 'Rating Scale',
    desc: '1 to 5 or 1 to 10 rating scale',
  },
  {
    type: 'Numeric',
    icon: <Hash className="w-4 h-4 text-cyan-600" />,
    title: 'Number / Amount',
    desc: 'Numerical figures, quantities & counts',
  },
  {
    type: 'Descriptive',
    icon: <AlignLeft className="w-4 h-4 text-indigo-600" />,
    title: 'Text Response',
    desc: 'Open text remarks or feedback',
  },
];

const TYPE_TITLES: Record<string, string> = {
  'Single choice': 'Single Choice',
  'Multiple choice': 'Multiple Choice',
  Dichotomous: 'Yes / No',
  'Likert Scale': 'Rating Scale',
  Numeric: 'Number / Amount',
  Descriptive: 'Text Response',
};

const BULK_PLACEHOLDER =
  '1. What is the primary source of household income?\n' +
  'A) Agriculture / Farming\n' +
  'B) Daily Wage Labor\n' +
  'C) Salaried Job\n' +
  'D) Business / Shop\n\n' +
  '2. Do you have an Ayushman Bharat Health Card?\n' +
  '- Yes\n' +
  '- No\n\n' +
  '3. Rate the quality of village drinking water supply:\n' +
  '(Rating 1-5)\n\n' +
  '4. Total cultivable agricultural land in acres?\n\n' +
  'Paste questions here...';

const SAMPLE_BULK_TEXT = [
  '1. What is the primary source of household monthly income?',
  'A) Agriculture / Farming',
  'B) Daily Wage Labor',
  'C) Salaried Job (Govt / Private)',
  'D) Business / Retail Shop',
  '',
  '2. Does the household possess an active Ayushman Bharat Health Card?',
  '- Yes',
  '- No',
  '',
  '3. Rate the quality and reliability of village drinking water supply:',
  '(Rating 1-5)',
  '',
  '4. Total agricultural cultivable land owned by the household (in acres)?',
  '',
  '5. Please take a photograph of the electricity power connection meter:',
].join('\n');

const TEMPLATES: Record<string, string[]> = {
  income: [
    'Agriculture / Farming',
    'Daily Wage Labor',
    'Salaried Employment',
    'Trade / Shop / Business',
    'Remittances / Other',
  ],
  gender: ['Male', 'Female', 'Transgender / Other'],
  rating: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
  agreement: [
    'Strongly Agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly Disagree',
  ],
};

function formatQId(n: number): string {
  return `Q-${n < 10 ? '0' + n : n}`;
}

function getTypeBadgeStyle(type?: string): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: '0.74rem',
    fontWeight: 700,
    display: 'inline-block',
  };
  switch (type) {
    case 'Single choice':
      return {
        ...base,
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
      };
    case 'Multiple choice':
      return {
        ...base,
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      };
    case 'Dichotomous':
      return {
        ...base,
        background: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0',
      };
    case 'Likert Scale':
      return {
        ...base,
        background: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fde68a',
      };
    case 'Numeric':
      return {
        ...base,
        background: '#ecfeff',
        color: '#0e7490',
        border: '1px solid #a5f3fc',
      };
    default:
      return {
        ...base,
        background: '#f8fafc',
        color: '#475569',
        border: '1px solid #e2e8f0',
      };
  }
}

function optionsTextOf(
  options: string | Array<string | { text?: string }> | null | undefined,
  type?: string
): { text: string; isPlaceholder: boolean } {
  if (Array.isArray(options) && options.length > 0) {
    return {
      text: options
        .map(o =>
          typeof o === 'string' ? o : (o as { text?: string }).text || ''
        )
        .filter(Boolean)
        .join(', '),
      isPlaceholder: false,
    };
  }
  if (typeof options === 'string' && options.trim().length > 0) {
    return { text: options, isPlaceholder: false };
  }
  if (type === 'Numeric') {
    return { text: '(Numeric Entry)', isPlaceholder: true };
  }
  return { text: '(Open Text)', isPlaceholder: true };
}

function parseRawBulkText(
  rawText: string,
  defaultCat = 'Socio-Economic Survey'
): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
  const parsed: ParsedQuestion[] = [];
  let currentQ: ParsedQuestion | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      const qText = parts[0].replace(/^\d+[.)-]\s*/, '').trim();
      const opts = parts[1] || '';
      let qType = parts[2] || '';

      if (!qType) {
        if (
          opts.toLowerCase().includes('yes') &&
          opts.toLowerCase().includes('no')
        )
          qType = 'Dichotomous';
        else if (
          opts.toLowerCase().includes('rating') ||
          opts.toLowerCase().includes('scale')
        )
          qType = 'Likert Scale';
        else if (opts.includes(',')) qType = 'Single choice';
        else qType = 'Descriptive';
      }

      currentQ = {
        id: formatQId(parsed.length + 1),
        category: parts[3] || defaultCat,
        text: qText,
        type: qType,
        options: opts,
        optionsList: opts
          ? opts
              .split(',')
              .map(o => o.trim())
              .filter(Boolean)
          : [],
        voice: /voice|audio|record/i.test(line),
        image: /photo|image|picture/i.test(line),
        video: /video/i.test(line),
      };
      parsed.push(currentQ);
      continue;
    }

    const qNumMatch = line.match(/^(\d+)[.)-]\s*(.+)/);
    if (qNumMatch) {
      const qText = qNumMatch[2].trim();
      let detectedType = 'Descriptive';

      if (/\(rating\s*1-?5\)|\(scale\)/i.test(qText)) {
        detectedType = 'Likert Scale';
      } else if (/acres|amount|number|count|how many|age\b/i.test(qText)) {
        detectedType = 'Numeric';
      }

      currentQ = {
        id: formatQId(parsed.length + 1),
        category: defaultCat,
        text: qText.replace(/\(rating\s*1-?5\)|\(scale\)/gi, '').trim(),
        type: detectedType,
        options: '',
        optionsList: [],
        voice: /voice|audio|record/i.test(qText),
        image: /photo|image|picture|meter/i.test(qText),
        video: /video/i.test(qText),
      };
      parsed.push(currentQ);
      continue;
    }

    const optMatch = line.match(/^([A-Za-z]|-|\*|\d+)[.)-]\s*(.+)/);
    if (optMatch && currentQ) {
      const optText = optMatch[2].trim();
      if (!currentQ.optionsList) currentQ.optionsList = [];
      currentQ.optionsList.push(optText);
      currentQ.options = currentQ.optionsList.join(', ');

      if (
        currentQ.optionsList.length === 2 &&
        currentQ.optionsList.some(o => o.toLowerCase() === 'yes') &&
        currentQ.optionsList.some(o => o.toLowerCase() === 'no')
      ) {
        currentQ.type = 'Dichotomous';
      } else if (currentQ.type === 'Descriptive') {
        currentQ.type = 'Single choice';
      }
      continue;
    }

    if (!currentQ && line.length > 5) {
      const qText = line;
      currentQ = {
        id: formatQId(parsed.length + 1),
        category: defaultCat,
        text: qText,
        type: 'Descriptive',
        options: '',
        optionsList: [],
        voice: /voice|audio/i.test(qText),
        image: /photo|image/i.test(qText),
        video: /video/i.test(qText),
      };
      parsed.push(currentQ);
    }
  }

  return parsed;
}

export default function QuestionBankPage(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const version = useStoreData();

  const isListMode = location.hash === '#list';

  // Form State
  const [activeTab, setActiveTab] = useState<'visual' | 'bulk'>('visual');
  const [qText, setQText] = useState(
    'What is the primary source of household monthly income?'
  );
  const [qCategory, setQCategory] = useState('Income & Livelihood');
  const [qDescription, setQDescription] = useState(
    'Verify income source against physical occupation and village registrar records.'
  );
  const [isRequired, setIsRequired] = useState(true);
  const [qType, setQType] = useState('Single choice');

  // Choices & Type-Specific Configuration
  const [optionsList, setOptionsList] = useState<string[]>([
    'Agriculture / Farming',
    'Daily Wage Labor',
    'Salaried Job (Govt / Private)',
    'Business / Shop / Self-Employed',
  ]);
  const [defaultChoiceIdx, setDefaultChoiceIdx] = useState<number>(0);

  // Multiple Choice configuration
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [minChoices, setMinChoices] = useState<number>(1);
  const [maxChoices, setMaxChoices] = useState<number>(3);

  // Yes / No configuration
  const [yesLabel, setYesLabel] = useState('Yes');
  const [noLabel, setNoLabel] = useState('No');

  // Rating configuration
  const [ratingScale, setRatingScale] = useState<5 | 10>(5);
  const [ratingLowLabel, setRatingLowLabel] = useState('Very Poor');
  const [ratingHighLabel, setRatingHighLabel] = useState('Excellent');

  // Number configuration
  const [numMin, setNumMin] = useState<string>('0');
  const [numMax, setNumMax] = useState<string>('1000');
  const [numStep, setNumStep] = useState<string>('1');
  const [numUnit, setNumUnit] = useState<string>('Count / Acres');
  const [numPlaceholder, setNumPlaceholder] = useState<string>(
    'Enter numerical figure'
  );

  // Text Response configuration
  const [isMultiline, setIsMultiline] = useState<boolean>(true);
  const [textMaxLength, setTextMaxLength] = useState<string>('500');
  const [textPlaceholder, setTextPlaceholder] = useState<string>(
    'Type open observations, field notes, or beneficiary response...'
  );

  // Media attachments
  const [media, setMedia] = useState({
    voice: false,
    image: false,
    video: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bulk Paste State
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('Socio-Economic Survey');
  const [parsedBulkList, setParsedBulkList] = useState<ParsedQuestion[]>([]);

  // Catalog State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [catalogType, setCatalogType] = useState('');

  // Interactive preview state
  const [previewSelectedRadio, setPreviewSelectedRadio] = useState<number>(0);
  const [previewSelectedChecks, setPreviewSelectedChecks] = useState<number[]>([
    0,
  ]);
  const [previewYesNo, setPreviewYesNo] = useState<string | null>(null);
  const [previewRating, setPreviewRating] = useState<number>(3);
  const [previewNumericVal, setPreviewNumericVal] = useState<string>('');
  const [previewTextVal, setPreviewTextVal] = useState<string>('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const showToast = (msg: string, duration = 4000) => {
    setToastMsg(msg);
    setToastTimer(prev => {
      if (prev !== null) window.clearTimeout(prev);
      return window.setTimeout(() => setToastMsg(null), duration);
    });
  };

  const setQBMode = (mode: 'list' | 'create') => {
    navigate(`/question-bank#${mode}`, { replace: true });
  };

  useEffect(() => {
    if (location.hash !== '#list' && location.hash !== '#create') {
      navigate('/question-bank#create', { replace: true });
    }
  }, [location.hash, navigate]);

  useEffect(() => {
    document.title = 'AIGGPA - Question Bank';
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer !== null) window.clearTimeout(toastTimer);
    };
  }, [toastTimer]);

  const allQuestions = useMemo(() => {
    void version;
    return Store.getQuestions() as AnyQuestion[];
  }, [version]);

  const masterCategories = useMemo(() => {
    void version;
    return MasterStore.getQuestionCategories();
  }, [version]);

  const categories = useMemo(() => {
    const set = new Set([
      ...masterCategories.map(c => c.name),
      ...CATEGORIES,
      ...allQuestions.map(q => q.category || 'General').filter(Boolean),
    ]);
    return Array.from(set).sort();
  }, [masterCategories, allQuestions]);

  const filtered = useMemo(() => {
    const search = catalogSearch.toLowerCase().trim();
    return allQuestions.filter(q => {
      const opts = q.options;
      const matchSearch =
        !search ||
        (q.code && q.code.toLowerCase().includes(search)) ||
        (q.id && q.id.toLowerCase().includes(search)) ||
        (q.text && q.text.toLowerCase().includes(search)) ||
        (q.category && q.category.toLowerCase().includes(search)) ||
        (Array.isArray(opts) &&
          opts.some(o =>
            (typeof o === 'string' ? o : (o as { text?: string }).text || '')
              .toLowerCase()
              .includes(search)
          )) ||
        (typeof opts === 'string' && opts.toLowerCase().includes(search));

      const matchCat = !catalogCategory || q.category === catalogCategory;
      const matchType = !catalogType || q.type === catalogType;

      return matchSearch && matchCat && matchType;
    });
  }, [allQuestions, catalogSearch, catalogCategory, catalogType]);

  const previewText = qText.trim() || 'Enter your question text above';
  const previewCategory = qCategory || 'Income & Livelihood';
  const previewTypeBadge = TYPE_TITLES[qType] || qType;
  const activePreviewOptions = optionsList.filter(o => o.trim().length > 0);
  const displayPreviewOptions =
    activePreviewOptions.length > 0
      ? activePreviewOptions
      : ['Sample Choice A', 'Sample Choice B'];

  const updateOption = (idx: number, val: string) => {
    setOptionsList(prev => prev.map((o, i) => (i === idx ? val : o)));
    if (errors.options) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.options;
        return next;
      });
    }
  };

  const removeOptionRow = (idx: number) => {
    setOptionsList(prev =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
    if (defaultChoiceIdx >= idx && defaultChoiceIdx > 0) {
      setDefaultChoiceIdx(defaultChoiceIdx - 1);
    }
  };

  const addOptionRow = () => {
    setOptionsList(prev => [...prev, '']);
  };

  const applyTemplate = (tmpl: string) => {
    if (TEMPLATES[tmpl]) {
      setOptionsList([...TEMPLATES[tmpl]]);
      setDefaultChoiceIdx(0);
      showToast(`Loaded ${TEMPLATES[tmpl].length} template choices.`);
    }
  };

  const toggleMedia = (key: 'voice' | 'image' | 'video') => {
    setMedia(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBulkParse = (raw: string, defCat: string) => {
    if (!raw.trim()) {
      setParsedBulkList([]);
      return;
    }
    setParsedBulkList(parseRawBulkText(raw, defCat));
  };

  const onBulkTextChange = (value: string) => {
    setBulkText(value);
    handleBulkParse(value, bulkCategory.trim() || 'General');
  };

  const loadSampleBulkQs = () => {
    setBulkText(SAMPLE_BULK_TEXT);
    handleBulkParse(SAMPLE_BULK_TEXT, bulkCategory.trim() || 'General');
    showToast('Loaded 5 demo questions with options auto-detected!');
  };

  const updateParsedType = (idx: number, newType: string) => {
    setParsedBulkList(prev =>
      prev.map((q, i) => (i === idx ? { ...q, type: newType } : q))
    );
  };

  const toggleBulkMedia = (idx: number, key: 'voice' | 'image' | 'video') => {
    setParsedBulkList(prev =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const next = { ...q };
        if (key === 'voice') next.voice = !q.voice;
        else if (key === 'image') next.image = !q.image;
        else next.video = !q.video;
        return next;
      })
    );
  };

  const removeBulkItem = (idx: number) => {
    setParsedBulkList(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((q, i) => ({ ...q, id: formatQId(i + 1) }))
    );
  };

  const setBulkMediaAll = (
    key: 'voice' | 'image' | 'video',
    value: boolean
  ) => {
    setParsedBulkList(prev =>
      prev.map(q => {
        const next = { ...q };
        if (key === 'voice') next.voice = value;
        else if (key === 'image') next.image = value;
        else next.video = value;
        return next;
      })
    );
  };

  const handleResetForm = () => {
    setQText('');
    setQDescription('');
    setQCategory(CATEGORIES[0]);
    setQType('Single choice');
    setOptionsList(['Choice 1', 'Choice 2', 'Choice 3']);
    setDefaultChoiceIdx(0);
    setMedia({ voice: false, image: false, video: false });
    setIsRequired(true);
    setErrors({});
    showToast('Question authoring form reset to blank.');
  };

  const saveSingleQuestion = () => {
    const text = qText.trim();
    const cat = qCategory || 'General';
    const newErrors: Record<string, string> = {};

    if (!text) {
      newErrors.text = 'Question text is required.';
    }

    let finalOptions = '';
    if (qType === 'Single choice' || qType === 'Multiple choice') {
      const cleanOpts = optionsList
        .map(o => o.trim())
        .filter(o => o.length > 0);
      if (cleanOpts.length < 2) {
        newErrors.options = 'Please provide at least 2 non-empty choices.';
      } else {
        finalOptions = cleanOpts.join(', ');
      }
    } else if (qType === 'Dichotomous') {
      finalOptions = `${yesLabel.trim() || 'Yes'}, ${noLabel.trim() || 'No'}`;
    } else if (qType === 'Likert Scale') {
      finalOptions = `1 to ${ratingScale} Rating (${ratingLowLabel} to ${ratingHighLabel})`;
    } else if (qType === 'Numeric') {
      finalOptions = `Numeric (Min: ${numMin || 0}, Max: ${numMax || '∞'}, Unit: ${numUnit || 'None'})`;
    } else {
      finalOptions = isMultiline ? 'Multi-line Text' : 'Single-line Text';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('⚠️ Please correct validation errors before saving.', 3000);
      return;
    }

    const currentBank = Store.getQuestionBank();
    const nextNum = currentBank.length + 1;
    const newId = formatQId(nextNum);

    Store.addQuestion({
      id: newId,
      category: cat,
      text: text,
      type: qType,
      options: finalOptions,
      voice: media.voice,
      image: media.image,
      video: media.video,
      required: isRequired,
    });

    setErrors({});
    showToast(`✅ Question "${newId}" saved successfully to Question Bank!`);
    setQBMode('list');
  };

  const saveBulkQuestions = () => {
    if (parsedBulkList.length === 0) {
      alert('No parsed questions to save.');
      return;
    }

    const currentBank = Store.getQuestionBank();
    const startNum = currentBank.length;
    let savedCount = 0;

    parsedBulkList.forEach((pq, i) => {
      const codeNum = startNum + i + 1;
      Store.addQuestion({
        id: formatQId(codeNum),
        category: pq.category,
        text: pq.text,
        type: pq.type,
        options: pq.options || '',
        voice: !!pq.voice,
        image: !!pq.image,
        video: !!pq.video,
        required: true,
      });
      savedCount++;
    });

    setBulkText('');
    setParsedBulkList([]);
    showToast(
      `⚡ Successfully saved ${savedCount} questions into Question Bank!`
    );
    setQBMode('list');
  };

  const deleteCatalogQ = (code: string) => {
    if (!code) return;
    const questions = Store.getQuestions();
    const q = questions.find(item => item.code === code || item.id === code);
    const qTitle = q ? `"${q.text.substring(0, 40)}..."` : code;

    if (
      confirm(
        `Are you sure you want to delete question ${qTitle} from the Question Bank?`
      )
    ) {
      Store.deleteQuestion(code);
      showToast('Question deleted.');
    }
  };

  const reloadSampleQuestions = () => {
    Store.resetToDefaultQuestions();
    showToast('✨ 12 Standardized Field Questions loaded successfully!');
  };

  const clearEntireBank = () => {
    const questions = Store.getQuestions();
    if (questions.length === 0) {
      alert('Question Bank is already empty.');
      return;
    }
    if (
      confirm(
        `Are you sure you want to clear all ${questions.length} questions from the Question Bank?`
      )
    ) {
      Store.clearQuestionBank();
      showToast('🗑️ Question Bank cleared.');
    }
  };

  return (
    <PageContainer>
      {/* ── Page Header with Professional Breadcrumbs ── */}
      <PageHeader
        title="Question Bank Studio"
        subtitle="Author standardized survey questions, response schemas, and field constraints for enumerators."
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Question Bank' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              variant={!isListMode ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              id="btnModeCreate"
              onClick={() => setQBMode('create')}
            >
              Author Question
            </AppButton>
            <AppButton
              variant={isListMode ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Database className="w-3.5 h-3.5" />}
              id="btnModeList"
              onClick={() => setQBMode('list')}
            >
              Question Bank ({allQuestions.length})
            </AppButton>
          </div>
        }
      />

      {/* ══════════════════════════════════════════════════════════════════
          MODE: CREATE QUESTION (Visual Builder & Bulk Paste)
      ══════════════════════════════════════════════════════════════════ */}
      {!isListMode && (
        <div id="sectionQBCreate" className="mt-5">
          {/* Sub-tab strip: Single Question vs Bulk Paste */}
          <div className="flex items-center gap-2 mb-5 border-b border-slate-200">
            <button
              type="button"
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'visual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tabQSVisual"
              onClick={() => setActiveTab('visual')}
            >
              Single Question Builder
            </button>
            <button
              type="button"
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tabQSBulk"
              onClick={() => setActiveTab('bulk')}
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Bulk Paste & Auto-Detect</span>
            </button>
          </div>

          {/* ── Tab: Visual Builder ── */}
          {activeTab === 'visual' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Primary Form Area (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* SECTION 1: Question Details */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 m-0">
                        Question Details
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Core prompt & classification
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Question Text <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="qsSingleText"
                        rows={2}
                        className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                          errors.text
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200'
                        }`}
                        placeholder="e.g., What is the primary source of household monthly income?"
                        value={qText}
                        onChange={e => {
                          setQText(e.target.value);
                          if (errors.text) {
                            setErrors(prev => {
                              const n = { ...prev };
                              delete n.text;
                              return n;
                            });
                          }
                        }}
                      />
                      {errors.text && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {errors.text}
                        </p>
                      )}
                    </div>

                    {/* Category & Required Flag */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Thematic Category
                        </label>
                        <select
                          id="qsSingleCat"
                          className="w-full h-9.5 px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          value={qCategory}
                          onChange={e => setQCategory(e.target.value)}
                        >
                          {categories.map(cat => (
                            <option value={cat} key={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Response Obligation
                        </label>
                        <div className="flex items-center h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <label className="flex items-center gap-2 cursor-pointer w-full text-xs text-slate-700 font-medium">
                            <input
                              type="checkbox"
                              checked={isRequired}
                              onChange={e => setIsRequired(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span>Mandatory field in survey</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Field Notes / Instructions */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enumerator Notes / Guidance{' '}
                        <span className="text-slate-400 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-9.5 px-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        placeholder="Guidance for survey teams on how to verify this response"
                        value={qDescription}
                        onChange={e => setQDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Answer Configuration */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 m-0">
                        Answer Format & Type
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Select response collection modality
                    </span>
                  </div>

                  {/* Compact accessible 3x2 grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TYPE_CARDS.map(card => {
                      const isActive = qType === card.type;
                      return (
                        <button
                          key={card.type}
                          type="button"
                          onClick={() => setQType(card.type)}
                          className={`p-3 text-left rounded-xl border transition-all relative flex flex-col justify-between ${
                            isActive
                              ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1.5 rounded-lg bg-slate-100">
                              {card.icon}
                            </div>
                            {isActive && (
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {card.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                              {card.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: Answer Choices & Type-Specific Settings */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 m-0">
                        {TYPE_TITLES[qType] || 'Answer Configuration'} Settings
                      </h3>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      Type-specific controls
                    </span>
                  </div>

                  {/* ── Sub-view 3A: Single Choice ── */}
                  {qType === 'Single choice' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Options List &amp; Default Selection:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">
                            Presets:
                          </span>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 border border-slate-200"
                            onClick={() => applyTemplate('income')}
                          >
                            + Income
                          </button>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 border border-slate-200"
                            onClick={() => applyTemplate('gender')}
                          >
                            + Gender
                          </button>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 border border-slate-200"
                            onClick={() => applyTemplate('agreement')}
                          >
                            + Agreement
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {optionsList.map((opt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 bg-slate-50/70 p-1.5 rounded-lg border border-slate-200"
                          >
                            <label
                              title="Set as default selection"
                              className="flex items-center gap-1 px-2 cursor-pointer text-[11px] text-slate-500 hover:text-blue-600"
                            >
                              <input
                                type="radio"
                                name="defaultOptionRadio"
                                checked={defaultChoiceIdx === idx}
                                onChange={() => setDefaultChoiceIdx(idx)}
                                className="w-3.5 h-3.5 text-blue-600 border-slate-300"
                              />
                              <span className="font-semibold text-slate-600">
                                #{idx + 1}
                              </span>
                            </label>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateOption(idx, e.target.value)}
                              placeholder={`Choice option ${idx + 1}`}
                              className="flex-1 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                            />
                            {optionsList.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOptionRow(idx)}
                                title="Remove choice"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {errors.options && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {errors.options}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addOptionRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option Choice</span>
                      </button>
                    </div>
                  )}

                  {/* ── Sub-view 3B: Multiple Choice ── */}
                  {qType === 'Multiple choice' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Multi-Select Options List:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">
                            Presets:
                          </span>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 border border-slate-200"
                            onClick={() => applyTemplate('income')}
                          >
                            + Income
                          </button>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 border border-slate-200"
                            onClick={() => applyTemplate('agreement')}
                          >
                            + Agreement
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {optionsList.map((opt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 bg-slate-50/70 p-1.5 rounded-lg border border-slate-200"
                          >
                            <span className="w-7 text-center font-semibold text-xs text-slate-500">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateOption(idx, e.target.value)}
                              placeholder={`Choice option ${idx + 1}`}
                              className="flex-1 h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                            />
                            {optionsList.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOptionRow(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {errors.options && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {errors.options}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={addOptionRow}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option Choice</span>
                        </button>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allowMultiple}
                              onChange={e => setAllowMultiple(e.target.checked)}
                              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                            />
                            <span>Multi-select</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <span>Min:</span>
                            <input
                              type="number"
                              min={1}
                              max={optionsList.length}
                              value={minChoices}
                              onChange={e =>
                                setMinChoices(Number(e.target.value))
                              }
                              className="w-14 h-7 text-center border rounded bg-white border-slate-200"
                            />
                          </label>
                          <label className="flex items-center gap-1">
                            <span>Max:</span>
                            <input
                              type="number"
                              min={1}
                              max={optionsList.length}
                              value={maxChoices}
                              onChange={e =>
                                setMaxChoices(Number(e.target.value))
                              }
                              className="w-14 h-7 text-center border rounded bg-white border-slate-200"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Sub-view 3C: Yes / No ── */}
                  {qType === 'Dichotomous' && (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-start gap-3">
                        <Info className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                        <div className="text-xs text-emerald-900">
                          <span className="font-bold">
                            Binary Dichotomous Mode:
                          </span>
                          <p className="mt-0.5 text-emerald-800">
                            Presents an unambiguous 2-state decision to
                            enumerators. You can customize the labels below if
                            needed.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Affirmative Label
                          </label>
                          <input
                            type="text"
                            value={yesLabel}
                            onChange={e => setYesLabel(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="Yes"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Negative Label
                          </label>
                          <input
                            type="text"
                            value={noLabel}
                            onChange={e => setNoLabel(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="No"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Sub-view 3D: Rating Scale ── */}
                  {qType === 'Likert Scale' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Rating Scale Range
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="ratingScaleOption"
                              checked={ratingScale === 5}
                              onChange={() => setRatingScale(5)}
                              className="text-blue-600 border-slate-300"
                            />
                            <span>1 to 5 Stars (Standard field scale)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="ratingScaleOption"
                              checked={ratingScale === 10}
                              onChange={() => setRatingScale(10)}
                              className="text-blue-600 border-slate-300"
                            />
                            <span>1 to 10 Scale (Detailed index)</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Low Score Label (1)
                          </label>
                          <input
                            type="text"
                            value={ratingLowLabel}
                            onChange={e => setRatingLowLabel(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="Very Poor"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            High Score Label ({ratingScale})
                          </label>
                          <input
                            type="text"
                            value={ratingHighLabel}
                            onChange={e => setRatingHighLabel(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="Excellent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Sub-view 3E: Number ── */}
                  {qType === 'Numeric' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Minimum Value
                          </label>
                          <input
                            type="number"
                            value={numMin}
                            onChange={e => setNumMin(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Maximum Value
                          </label>
                          <input
                            type="number"
                            value={numMax}
                            onChange={e => setNumMax(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Step Increment
                          </label>
                          <input
                            type="number"
                            value={numStep}
                            onChange={e => setNumStep(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Unit / Suffix
                          </label>
                          <input
                            type="text"
                            value={numUnit}
                            onChange={e => setNumUnit(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="e.g. Acres, ₹"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Placeholder text for tablet input
                        </label>
                        <input
                          type="text"
                          value={numPlaceholder}
                          onChange={e => setNumPlaceholder(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                          placeholder="e.g. Enter area in acres..."
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Sub-view 3F: Text Response ── */}
                  {qType === 'Descriptive' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Input Mode
                          </label>
                          <div className="flex items-center gap-3 h-9">
                            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="textModeRadio"
                                checked={isMultiline}
                                onChange={() => setIsMultiline(true)}
                                className="text-blue-600"
                              />
                              <span>Multi-line textarea</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="textModeRadio"
                                checked={!isMultiline}
                                onChange={() => setIsMultiline(false)}
                                className="text-blue-600"
                              />
                              <span>Single line</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Max Character Limit
                          </label>
                          <input
                            type="number"
                            value={textMaxLength}
                            onChange={e => setTextMaxLength(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                            placeholder="500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Placeholder prompt for enumerator
                        </label>
                        <input
                          type="text"
                          value={textPlaceholder}
                          onChange={e => setTextPlaceholder(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                          placeholder="Type open observations..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 4: Optional Metadata & Multimedia Attachments */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                        4
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 m-0">
                        Media &amp; Verification Evidence (Optional)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Tablet sensors &amp; uploads
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Require field surveyor to capture real-time evidence
                    alongside this response:
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      id="qsSingleVoice"
                      onClick={() => toggleMedia('voice')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        media.voice
                          ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Mic
                        className={`w-3.5 h-3.5 ${media.voice ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                      <span>Audio Recording</span>
                      {media.voice && (
                        <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                      )}
                    </button>

                    <button
                      type="button"
                      id="qsSingleImage"
                      onClick={() => toggleMedia('image')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        media.image
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Camera
                        className={`w-3.5 h-3.5 ${media.image ? 'text-emerald-600' : 'text-slate-400'}`}
                      />
                      <span>Photo Capture</span>
                      {media.image && (
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      )}
                    </button>

                    <button
                      type="button"
                      id="qsSingleVideo"
                      onClick={() => toggleMedia('video')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        media.video
                          ? 'bg-rose-50 text-rose-700 border-rose-400 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Video
                        className={`w-3.5 h-3.5 ${media.video ? 'text-rose-600' : 'text-slate-400'}`}
                      />
                      <span>Video Recording</span>
                      {media.video && (
                        <Check className="w-3 h-3 text-rose-600 stroke-[3]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SECTION 5: Actions Area */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-slate-500">
                    Questions will be assigned a standardized ID upon
                    submission.
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Reset Form
                    </button>
                    <button
                      type="button"
                      id="btnSaveQSSingle"
                      onClick={saveSingleQuestion}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Question to Bank</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Live Mobile / Survey Preview (5 Cols) */}
              <div className="lg:col-span-5 sticky top-6">
                <div className="bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-slate-800 text-white">
                  {/* Smartphone header / speaker bar */}
                  <div className="flex items-center justify-between px-3 py-1 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      AIGGPA FIELD ENUMERATOR
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                        Live Preview
                      </span>
                    </div>
                  </div>

                  {/* Simulator Screen */}
                  <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-inner min-h-[460px] flex flex-col justify-between">
                    <div>
                      {/* Survey Screen Top Bar */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {previewCategory}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {previewTypeBadge}
                        </span>
                      </div>

                      {/* Question Prompt */}
                      <div className="mb-4">
                        <div className="flex items-start gap-1">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {previewText}
                          </h4>
                          {isRequired && (
                            <span className="text-rose-500 font-bold text-sm">
                              *
                            </span>
                          )}
                        </div>
                        {qDescription && (
                          <p className="text-xs text-slate-500 mt-1 leading-normal italic">
                            "{qDescription}"
                          </p>
                        )}
                      </div>

                      {/* Dynamic Answer Preview */}
                      <div className="my-4">
                        {/* 1. Single Choice */}
                        {qType === 'Single choice' && (
                          <div className="space-y-2">
                            {displayPreviewOptions.map((opt, i) => (
                              <label
                                key={i}
                                onClick={() => setPreviewSelectedRadio(i)}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  previewSelectedRadio === i
                                    ? 'bg-blue-50/70 border-blue-600 text-blue-900 font-semibold'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="previewRadio"
                                  checked={previewSelectedRadio === i}
                                  onChange={() => setPreviewSelectedRadio(i)}
                                  className="w-4 h-4 text-blue-600 border-slate-300"
                                />
                                <span className="flex-1">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* 2. Multiple Choice */}
                        {qType === 'Multiple choice' && (
                          <div className="space-y-2">
                            {displayPreviewOptions.map((opt, i) => {
                              const isChecked =
                                previewSelectedChecks.includes(i);
                              return (
                                <label
                                  key={i}
                                  onClick={() => {
                                    setPreviewSelectedChecks(prev =>
                                      prev.includes(i)
                                        ? prev.filter(x => x !== i)
                                        : [...prev, i]
                                    );
                                  }}
                                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-blue-50/70 border-blue-600 text-blue-900 font-semibold'
                                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                  />
                                  <span className="flex-1">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. Yes / No */}
                        {qType === 'Dichotomous' && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPreviewYesNo('yes')}
                              className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                                previewYesNo === 'yes'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70'
                              }`}
                            >
                              ✓ {yesLabel || 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewYesNo('no')}
                              className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                                previewYesNo === 'no'
                                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/70'
                              }`}
                            >
                              ✕ {noLabel || 'No'}
                            </button>
                          </div>
                        )}

                        {/* 4. Rating Scale */}
                        {qType === 'Likert Scale' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-1">
                              {Array.from(
                                { length: ratingScale },
                                (_, idx) => idx + 1
                              ).map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setPreviewRating(num)}
                                  className={`flex-1 py-2.5 rounded-lg border text-center transition-all ${
                                    previewRating >= num
                                      ? 'bg-amber-50 border-amber-400 text-amber-700 font-bold shadow-xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <div className="text-xs">⭐</div>
                                  <div className="text-[11px] font-bold mt-0.5">
                                    {num}
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                              <span>1 = {ratingLowLabel}</span>
                              <span>
                                {ratingScale} = {ratingHighLabel}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 5. Numeric */}
                        {qType === 'Numeric' && (
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type="number"
                                value={previewNumericVal}
                                onChange={e =>
                                  setPreviewNumericVal(e.target.value)
                                }
                                placeholder={
                                  numPlaceholder || 'Enter number...'
                                }
                                className="w-full h-11 px-3.5 pr-20 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                              />
                              <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">
                                {numUnit}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Range: {numMin || 0} to {numMax || '∞'}
                            </div>
                          </div>
                        )}

                        {/* 6. Text Response */}
                        {qType === 'Descriptive' && (
                          <div className="space-y-1.5">
                            <textarea
                              rows={isMultiline ? 3 : 1}
                              value={previewTextVal}
                              onChange={e => setPreviewTextVal(e.target.value)}
                              placeholder={
                                textPlaceholder || 'Type response...'
                              }
                              className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                            />
                            <div className="flex justify-end text-[10px] text-slate-400">
                              {previewTextVal.length} / {textMaxLength || 500}{' '}
                              characters
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Evidence requirements strip */}
                      {(media.voice || media.image || media.video) && (
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Required Evidence Attachments:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {media.voice && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                🎙️ Audio Log
                              </span>
                            )}
                            {media.image && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                📷 Site Photo
                              </span>
                            )}
                            {media.video && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                🎥 Clip Upload
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Surveyor bottom button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Question 1 of 12
                      </span>
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 opacity-90 cursor-default"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Bulk Paste & Auto-Detect ── */}
          {activeTab === 'bulk' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 m-0">
                    Paste Questionnaire Batch
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste multi-question text. The system automatically parses
                    numbers, choices, and question types.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={loadSampleBulkQs}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Batch</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Questionnaire Plain Text
                  </label>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={e => onBulkTextChange(e.target.value)}
                    placeholder={BULK_PLACEHOLDER}
                    className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Default Category:
                    </label>
                    <input
                      type="text"
                      value={bulkCategory}
                      onChange={e => setBulkCategory(e.target.value)}
                      className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg w-48"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold">Bulk Media:</span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-white border rounded text-[11px] font-medium hover:bg-slate-100"
                      onClick={() => setBulkMediaAll('voice', true)}
                    >
                      🎙️ Audio All
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-white border rounded text-[11px] font-medium hover:bg-slate-100"
                      onClick={() => setBulkMediaAll('image', true)}
                    >
                      📷 Photo All
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-white border rounded text-[11px] font-medium hover:bg-slate-100"
                      onClick={() => setBulkMediaAll('video', true)}
                    >
                      🎥 Video All
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-medium hover:bg-rose-100"
                      onClick={() => {
                        setBulkMediaAll('voice', false);
                        setBulkMediaAll('image', false);
                        setBulkMediaAll('video', false);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Parsed List Table */}
                {parsedBulkList.length > 0 && (
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Parsed Questions Preview
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {parsedBulkList.length} Detected
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 w-16">Code</th>
                            <th className="py-2.5 px-3">Question Text</th>
                            <th className="py-2.5 px-3 w-40">Detected Type</th>
                            <th className="py-2.5 px-3">Options</th>
                            <th className="py-2.5 px-3 w-28 text-center">
                              Media
                            </th>
                            <th className="py-2.5 px-3 w-14 text-center">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedBulkList.map((q, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-blue-600">
                                {q.id}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {q.text}
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={q.type}
                                  onChange={e =>
                                    updateParsedType(idx, e.target.value)
                                  }
                                  className="h-7 px-2 text-xs border border-slate-200 rounded bg-white w-full"
                                >
                                  <option value="Single choice">
                                    Single Choice
                                  </option>
                                  <option value="Multiple choice">
                                    Multiple Choice
                                  </option>
                                  <option value="Dichotomous">Yes / No</option>
                                  <option value="Likert Scale">
                                    Rating (1-5)
                                  </option>
                                  <option value="Numeric">Numeric</option>
                                  <option value="Descriptive">
                                    Text Response
                                  </option>
                                </select>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {q.options || '(None)'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleBulkMedia(idx, 'voice')
                                    }
                                    className={`p-1 rounded text-xs ${q.voice ? 'bg-blue-100' : 'opacity-40'}`}
                                  >
                                    🎙️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleBulkMedia(idx, 'image')
                                    }
                                    className={`p-1 rounded text-xs ${q.image ? 'bg-emerald-100' : 'opacity-40'}`}
                                  >
                                    📷
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleBulkMedia(idx, 'video')
                                    }
                                    className={`p-1 rounded text-xs ${q.video ? 'bg-rose-100' : 'opacity-40'}`}
                                  >
                                    🎥
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeBulkItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={saveBulkQuestions}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm"
                      >
                        Save {parsedBulkList.length} Questions to Bank
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODE: QUESTION BANK LIST (#list)
      ══════════════════════════════════════════════════════════════════ */}
      {isListMode && (
        <div id="sectionQBList" className="mt-5 space-y-4">
          <TableToolbar
            searchPlaceholder="Search questions by text or code..."
            searchValue={catalogSearch}
            onSearchChange={setCatalogSearch}
            totalCount={allQuestions.length}
            filteredCount={filtered.length}
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={catalogCategory}
                  onChange={e => setCatalogCategory(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={catalogType}
                  onChange={e => setCatalogType(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All Question Types</option>
                  <option value="Single choice">Single Choice</option>
                  <option value="Multiple choice">Multiple Choice</option>
                  <option value="Dichotomous">Yes / No</option>
                  <option value="Likert Scale">Rating Scale</option>
                  <option value="Numeric">Numeric</option>
                  <option value="Descriptive">Text Response</option>
                </select>
                <AppButton
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={reloadSampleQuestions}
                >
                  Reload Defaults
                </AppButton>
                <AppButton
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={clearEntireBank}
                >
                  Clear Bank
                </AppButton>
                <AppButton
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setQBMode('create')}
                >
                  Add Question
                </AppButton>
              </div>
            }
          />

          {/* Catalog Table */}
          <DataTable
            data={filtered}
            keyExtractor={q => q.id || q.code || ''}
            emptyMessage="No questions found matching current filters."
            columns={[
              {
                key: 'code',
                header: 'Code',
                width: '80px',
                render: (q: AnyQuestion) => (
                  <span className="font-bold text-blue-600">
                    {q.id || q.code}
                  </span>
                ),
              },
              {
                key: 'text',
                header: 'Question Text & Category',
                render: (q: AnyQuestion) => (
                  <div>
                    <div className="font-semibold text-slate-900 leading-snug">
                      {q.text}
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.category || 'General'}
                    </span>
                  </div>
                ),
              },
              {
                key: 'type',
                header: 'Type',
                width: '140px',
                render: (q: AnyQuestion) => (
                  <span style={getTypeBadgeStyle(q.type)}>
                    {TYPE_TITLES[q.type] || q.type}
                  </span>
                ),
              },
              {
                key: 'options',
                header: 'Configured Options',
                render: (q: AnyQuestion) => {
                  const opts = optionsTextOf(q.options, q.type);
                  return (
                    <span
                      className={
                        opts.isPlaceholder
                          ? 'text-slate-400 italic'
                          : 'text-slate-600'
                      }
                    >
                      {opts.text}
                    </span>
                  );
                },
              },
              {
                key: 'media',
                header: 'Media',
                align: 'center',
                width: '110px',
                render: (q: AnyQuestion) => (
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    {(q.mediaVoice || q.voice) && (
                      <span title="Audio Enabled">🎙️</span>
                    )}
                    {(q.mediaPhoto || q.image) && (
                      <span title="Photo Enabled">📷</span>
                    )}
                    {(q.mediaVideo || q.video) && (
                      <span title="Video Enabled">🎥</span>
                    )}
                    {!q.voice &&
                      !q.image &&
                      !q.video &&
                      !q.mediaVoice &&
                      !q.mediaPhoto &&
                      !q.mediaVideo && (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                  </div>
                ),
              },
              {
                key: 'actions',
                header: 'Action',
                align: 'center',
                width: '70px',
                render: (q: AnyQuestion) => (
                  <ActionIconButton
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    variant="danger"
                    tooltip="Delete Question"
                    onClick={() => deleteCatalogQ(q.id || q.code || '')}
                  />
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border-l-4 border-blue-600 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMsg}</span>
        </div>
      )}
    </PageContainer>
  );
}
