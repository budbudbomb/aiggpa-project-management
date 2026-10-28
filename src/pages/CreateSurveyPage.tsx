import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import surveysCss from '../styles/surveys.css?inline';
import { usePageStyles } from '../lib/usePageStyles';
import SurveyStore from '../stores/surveyStore';
import Store from '../stores/projectStore';
import { PageContainer } from '../components';
import { useAuthStore } from '../auth/store/authStore';

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'likert_scale'
  | 'dichotomous'
  | 'descriptive';

interface LikertConfig {
  points: number;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
  labels: string[];
}

interface BuilderQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  likertConfig?: LikertConfig;
  dichotomousLabels?: string[];
  placeholder?: string;
  required: boolean;
  allowVoice?: boolean;
  allowVideo?: boolean;
  allowImage?: boolean;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

function makeId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createQuestion(type: QuestionType): BuilderQuestion {
  const id = makeId();
  const base = {
    id,
    question: '',
    required: true,
    allowVoice: false,
    allowVideo: false,
    allowImage: false,
  };
  switch (type) {
    case 'single_choice':
    case 'multiple_choice':
      return { ...base, type, options: ['Option 1', 'Option 2', 'Option 3'] };
    case 'likert_scale':
      return {
        ...base,
        type,
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
      };
    case 'dichotomous':
      return { ...base, type, dichotomousLabels: ['Yes', 'No'] };
    case 'descriptive':
      return {
        ...base,
        type,
        placeholder: 'Type detailed observations or respondent response here…',
        allowVoice: true,
        allowImage: true,
      };
    default:
      return {
        ...base,
        type: 'single_choice',
        options: ['Option 1', 'Option 2'],
      };
  }
}

function initialQuestion(): BuilderQuestion {
  return {
    id: `q-${Date.now()}-1`,
    type: 'single_choice',
    question: '',
    options: ['Option 1', 'Option 2', 'Option 3'],
    required: true,
    allowVoice: false,
    allowVideo: false,
    allowImage: false,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

const TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = [
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'likert_scale', label: 'Likert Scale' },
  { value: 'dichotomous', label: 'Dichotomous' },
  { value: 'descriptive', label: 'Descriptive' },
];

const FORMAT_CARDS: Array<{
  type: QuestionType;
  icon: string;
  iconStyle: React.CSSProperties;
  title: string;
  desc: string;
}> = [
  {
    type: 'single_choice',
    icon: 'pi pi-circle-fill',
    iconStyle: { background: '#eff6ff', color: '#2563eb', fontSize: 14 },
    title: 'Single Choice',
    desc: 'Respondent selects only one option from a list',
  },
  {
    type: 'multiple_choice',
    icon: 'pi pi-check-square',
    iconStyle: { background: '#ecfdf5', color: '#059669', fontSize: 16 },
    title: 'Multiple Choice',
    desc: 'Respondent can check multiple relevant options',
  },
  {
    type: 'likert_scale',
    icon: 'pi pi-sliders-h',
    iconStyle: { background: '#faf5ff', color: '#9333ea', fontSize: 16 },
    title: 'Likert Scale',
    desc: '5-point agreement, satisfaction, or quality scale',
  },
  {
    type: 'dichotomous',
    icon: 'pi pi-arrows-h',
    iconStyle: { background: '#fffbeb', color: '#d97706', fontSize: 16 },
    title: 'Dichotomous',
    desc: 'Binary decisions (Yes / No, True / False)',
  },
  {
    type: 'descriptive',
    icon: 'pi pi-align-left',
    iconStyle: { background: '#f0fdfa', color: '#0d9488', fontSize: 16 },
    title: 'Descriptive',
    desc: 'Open-ended text for explanations and feedback',
  },
];

export default function CreateSurveyPage(): React.ReactElement {
  usePageStyles(surveysCss);
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  const today = new Date().toISOString().split('T')[0];
  const threeWeeksLater = new Date(Date.now() + 21 * 86400000)
    .toISOString()
    .split('T')[0];

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeWeeksLater);
  const [participants, setParticipants] = useState('100');
  const [desc, setDesc] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    initialQuestion(),
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const projects = Store.getProjects();
  const [projectId, setProjectId] = useState(projects[0]?.id || 'PRJ-01');

  const questionsListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'AIGGPA - Create Survey';
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  function goToStep(step: 1 | 2) {
    if (step === 2) {
      if (!name.trim()) {
        setNameInvalid(true);
        alert('Please enter a Survey Name before continuing.');
        return;
      }
      setNameInvalid(false);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || !fileList.length) return;
    const next: AttachedFile[] = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const f = fileList[i];
      next.push({
        id: `f-${Date.now()}-${i}`,
        name: f.name,
        size: formatBytes(f.size),
        type: f.name.split('.').pop()?.toUpperCase() || 'DOC',
      });
    }
    setAttachedFiles(prev => [...prev, ...next]);
  }

  function updateQuestion(
    id: string,
    updater: (q: BuilderQuestion) => BuilderQuestion
  ) {
    setQuestions(prev => prev.map(q => (q.id === id ? updater(q) : q)));
  }

  function changeQuestionType(id: string, newType: QuestionType) {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== id) return q;
        const updated = createQuestion(newType);
        updated.id = id;
        updated.question = q.question;
        updated.required = q.required;
        return updated;
      })
    );
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[target];
      next[target] = tmp;
      return next;
    });
  }

  function duplicateQuestion(id: string) {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx === -1) return prev;
      const cloned: BuilderQuestion = JSON.parse(JSON.stringify(prev[idx]));
      cloned.id = makeId();
      const next = [...prev];
      next.splice(idx + 1, 0, cloned);
      return next;
    });
  }

  function deleteQuestion(id: string) {
    setQuestions(prev =>
      prev.length <= 1 ? prev : prev.filter(q => q.id !== id)
    );
  }

  function addQuestionOfType(type: QuestionType) {
    setQuestions(prev => [...prev, createQuestion(type)]);
    setTimeout(() => {
      const cards = questionsListRef.current?.querySelectorAll(
        '.question-builder-card'
      );
      if (cards && cards.length) {
        cards[cards.length - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 80);
  }

  function handleSaveSurvey(andAllocate: boolean) {
    const title = name.trim();
    if (!title) {
      goToStep(1);
      setNameInvalid(true);
      alert('Please provide a Survey Name.');
      return;
    }

    const finalQuestions = questions.map((q, i) =>
      q.question.trim() ? q : { ...q, question: `Survey Question ${i + 1}` }
    );
    setQuestions(finalQuestions);

    const selectedProj = projects.find(p => p.id === projectId) || projects[0];

    const surveyData = {
      title,
      projectId: selectedProj.id,
      projectName: selectedProj.name,
      description: desc.trim(),
      startDate,
      endDate,
      participantsRequired: parseInt(participants, 10) || 100,
      documents: attachedFiles,
      questions: finalQuestions,
      submissionStatus: 'draft',
      createdBy: authUser
        ? { name: authUser.name, role: authUser.role }
        : { name: 'Dr. Rajesh Verma', role: 'Chief Program Manager' },
    };

    const saved = SurveyStore.saveSurvey(surveyData);
    if (andAllocate) {
      navigate(
        `/activities?surveyId=${saved.id}&title=${encodeURIComponent(saved.title)}`
      );
    } else {
      navigate('/surveys?saved=true');
    }
  }

  const stepTab1Class = `cs-step-tab${currentStep === 1 ? ' active' : currentStep === 2 ? ' completed' : ''}`;
  const stepTab2Class = `cs-step-tab${currentStep === 2 ? ' active' : ''}`;

  const previewTitle = name.trim() || 'Untitled Survey';
  const previewDesc =
    desc.trim() ||
    'Field survey instructions and questionnaires for assigned cluster.';

  const questionCountText = useMemo(
    () =>
      `${questions.length} Question${questions.length !== 1 ? 's' : ''} added`,
    [questions.length]
  );

  function renderFormatInputs(q: BuilderQuestion): React.ReactNode {
    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const isRadio = q.type === 'single_choice';
      const options = q.options || ['Option 1', 'Option 2'];
      return (
        <div>
          <div className="qbc-options-title">OPTIONS</div>
          <div className="qbc-options-wrap">
            {options.map((opt, oIdx) => (
              <div className="qbc-option-row" key={oIdx}>
                <div
                  className={
                    isRadio
                      ? 'qbc-option-radio-visual'
                      : 'qbc-option-check-visual'
                  }
                />
                <input
                  type="text"
                  className="qbc-option-input"
                  value={opt}
                  placeholder={`Option ${oIdx + 1}`}
                  onChange={e => {
                    const value = e.target.value;
                    updateQuestion(q.id, cur => {
                      const nextOpts = [...(cur.options || [])];
                      nextOpts[oIdx] = value;
                      return { ...cur, options: nextOpts };
                    });
                  }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="qbc-option-remove"
                    onClick={() =>
                      updateQuestion(q.id, cur => {
                        if (!cur.options || cur.options.length <= 2) return cur;
                        const nextOpts = [...cur.options];
                        nextOpts.splice(oIdx, 1);
                        return { ...cur, options: nextOpts };
                      })
                    }
                  >
                    <i className="pi pi-times" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-option"
            onClick={() =>
              updateQuestion(q.id, cur =>
                cur.options
                  ? {
                      ...cur,
                      options: [
                        ...cur.options,
                        `Option ${cur.options.length + 1}`,
                      ],
                    }
                  : cur
              )
            }
          >
            <i className="pi pi-plus" style={{ fontSize: 11 }} />
            <span>Add Option</span>
          </button>
        </div>
      );
    }

    if (q.type === 'likert_scale') {
      const labels = q.likertConfig?.labels || [
        'Very Dissatisfied',
        'Dissatisfied',
        'Neutral',
        'Satisfied',
        'Very Satisfied',
      ];
      return (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: 12,
            padding: 14,
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#1e40af',
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}
          >
            5-POINT SCALE PREVIEWS
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 6,
              textAlign: 'center',
            }}
          >
            {labels.map((l, lIdx) => (
              <div
                key={lIdx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  padding: '8px 4px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#1d4ed8',
                  }}
                >
                  {lIdx + 1}
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    color: '#475569',
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (q.type === 'dichotomous') {
      const labels = q.dichotomousLabels || ['Yes', 'No'];
      return (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: 12,
            padding: 14,
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              color: '#b45309',
              marginBottom: 8,
            }}
          >
            BINARY DECISION OPTIONS
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[labels[0], labels[1]].map((l, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid #fde68a',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#92400e',
                  textAlign: 'center',
                }}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (q.type === 'descriptive') {
      return (
        <div style={{ marginTop: 8 }}>
          <textarea
            className="cs-input"
            rows={2}
            placeholder={
              q.placeholder ||
              'Type detailed observations or respondent response here…'
            }
            disabled
            style={{
              background: '#f8fafc',
              cursor: 'not-allowed',
              resize: 'none',
            }}
          />
        </div>
      );
    }

    return null;
  }

  if (
    authUser?.role !== 'Center Head' &&
    authUser?.role !== 'Advisor' &&
    authUser?.role !== 'Super Admin'
  ) {
    return <Navigate to="/activities" replace />;
  }

  return (
    <PageContainer>
      {/* ── Create Survey Top Header Strip ── */}
      <div className="cs-header-strip">
        <div className="cs-back-title-wrap">
          <Link to="/surveys" className="cs-back-btn" title="Back to Surveys">
            <i className="pi pi-arrow-left" />
          </Link>
          <div className="cs-title-group">
            <h1>
              <span>Create Survey</span>
              <span className="cs-badge-admin">Admin Builder</span>
            </h1>
            <p>
              Design structured field questionnaires for Program Coordinators,
              Fellows, and Interns
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-live-preview-pill"
          id="btnLivePreviewTop"
          onClick={() => setPreviewOpen(true)}
        >
          <span className="dot" />
          <i className="pi pi-eye" style={{ fontSize: 13 }} />
          <span>Live Preview</span>
        </button>
      </div>

      {/* ── 2-Step Stepper Indicator Strip ── */}
      <div className="cs-stepper-box">
        <button
          type="button"
          className={stepTab1Class}
          id="stepTab1"
          onClick={() => goToStep(1)}
        >
          <div className="cs-step-num">
            {currentStep === 2 ? (
              <i
                className="pi pi-check"
                style={{ fontWeight: 900, fontSize: 13 }}
              />
            ) : (
              1
            )}
          </div>
          <div className="cs-step-info">
            <h4>General Details</h4>
            <p>Title, timeline &amp; targets</p>
          </div>
        </button>

        <button
          type="button"
          className={stepTab2Class}
          id="stepTab2"
          onClick={() => name.trim() && goToStep(2)}
        >
          <div className="cs-step-num">2</div>
          <div className="cs-step-info">
            <h4>Add Questions</h4>
            <p>Interactive question builder</p>
          </div>
        </button>
      </div>

      {/* ══ STEP 1: GENERAL INFORMATION ══ */}
      {currentStep === 1 && (
        <div id="step1Container">
          <div className="cs-card-form">
            <h2 className="cs-card-form-title">Step 1: General Information</h2>
            <p className="cs-card-form-sub">
              Define the primary purpose, duration, and target participation
              count for this survey.
            </p>

            <div className="cs-form-group">
              <label className="cs-form-label">
                Associated Project <span className="req">*</span>
              </label>
              <select
                id="surveyProjectIn"
                className="cs-input"
                style={{ background: '#ffffff', cursor: 'pointer' }}
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="cs-form-group">
              <label className="cs-form-label">
                Survey Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="surveyNameIn"
                className="cs-input"
                placeholder="e.g. District Livelihood Assessment & Scheme Coverage Q3"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (nameInvalid && e.target.value.trim())
                    setNameInvalid(false);
                }}
                style={nameInvalid ? { borderColor: '#ef4444' } : undefined}
              />
            </div>

            <div className="cs-grid-2">
              <div className="cs-form-group">
                <label className="cs-form-label">
                  Start Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  id="surveyStartDateIn"
                  className="cs-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">
                  End Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  id="surveyEndDateIn"
                  className="cs-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="cs-form-group">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <label className="cs-form-label" style={{ margin: 0 }}>
                  No. of Participants Required <span className="req">*</span>
                </label>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Target sample size
                </span>
              </div>
              <div className="cs-target-wrap">
                <input
                  type="number"
                  id="surveyParticipantsIn"
                  className="cs-input"
                  style={{ maxWidth: 140 }}
                  min={10}
                  value={participants}
                  onChange={e => setParticipants(e.target.value)}
                />
                <div className="cs-target-pills">
                  {[50, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`cs-target-pill${participants === String(val) ? ' active' : ''}`}
                      data-val={val}
                      onClick={() => setParticipants(String(val))}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cs-form-group">
              <label className="cs-form-label">
                Description &amp; Field instructions (optional)
              </label>
              <textarea
                id="surveyDescIn"
                className="cs-input"
                rows={4}
                style={{ resize: 'vertical' }}
                placeholder="Briefly explain the objective of this survey and instructions for field respondents or interviewing officers..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div className="cs-form-group">
              <label className="cs-form-label">
                Upload Documents (optional)
              </label>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: '#64748b',
                  marginTop: -3,
                  marginBottom: 8,
                }}
              >
                Attach survey questionnaires, field SOPs, guidelines, or
                reference materials
              </p>

              <div
                className={`cs-dropzone${dragOver ? ' dragover' : ''}`}
                id="fileDropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <div className="cs-dropzone-icon">
                  <i className="pi pi-upload" />
                </div>
                <div className="cs-dropzone-text">
                  Click to upload document or drag &amp; drop
                </div>
                <div className="cs-dropzone-sub">
                  Supports PDF, DOC, DOCX, XLS, XLSX, CSV, TXT (up to 10MB each)
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={e => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />

              <div className="cs-file-list" id="attachedFilesList">
                {attachedFiles.map((file, idx) => (
                  <div className="cs-file-item" key={file.id}>
                    <div className="cs-file-item-left">
                      <i
                        className="pi pi-file"
                        style={{ color: '#2563eb', fontSize: '1.1rem' }}
                      />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        ({file.size})
                      </span>
                    </div>
                    <i
                      className="pi pi-times cs-file-remove"
                      title="Remove file"
                      onClick={() =>
                        setAttachedFiles(prev =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="btn-create-survey-main"
                id="btnContinueToStep2"
                onClick={() => goToStep(2)}
              >
                <span>Continue to Add Questions</span>
                <i className="pi pi-arrow-right" style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 2: ADD QUESTIONS ══ */}
      {currentStep === 2 && (
        <div id="step2Container">
          <div id="questionsListContainer" ref={questionsListRef}>
            {questions.map((q, idx) => (
              <div className="question-builder-card" key={q.id} data-id={q.id}>
                <div className="qbc-top-row">
                  <div className="qbc-left">
                    <div className="qbc-num-badge">{idx + 1}</div>
                    <select
                      className="qbc-type-select"
                      value={q.type}
                      onChange={e =>
                        changeQuestionType(q.id, e.target.value as QuestionType)
                      }
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="qbc-right-actions">
                    <label className="qbc-required-toggle">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={e =>
                          updateQuestion(q.id, cur => ({
                            ...cur,
                            required: e.target.checked,
                          }))
                        }
                      />
                      <span>Required</span>
                    </label>

                    <button
                      type="button"
                      className="qbc-icon-btn"
                      title="Move Up"
                      disabled={idx === 0}
                      style={
                        idx === 0
                          ? { opacity: 0.3, cursor: 'default' }
                          : undefined
                      }
                      onClick={() => moveQuestion(q.id, -1)}
                    >
                      <i className="pi pi-arrow-up" />
                    </button>

                    <button
                      type="button"
                      className="qbc-icon-btn"
                      title="Move Down"
                      disabled={idx === questions.length - 1}
                      style={
                        idx === questions.length - 1
                          ? { opacity: 0.3, cursor: 'default' }
                          : undefined
                      }
                      onClick={() => moveQuestion(q.id, 1)}
                    >
                      <i className="pi pi-arrow-down" />
                    </button>

                    <button
                      type="button"
                      className="qbc-icon-btn"
                      title="Duplicate Question"
                      onClick={() => duplicateQuestion(q.id)}
                    >
                      <i className="pi pi-copy" />
                    </button>

                    <button
                      type="button"
                      className="qbc-icon-btn danger"
                      title="Delete Question"
                      style={
                        questions.length === 1
                          ? { opacity: 0.3, pointerEvents: 'none' }
                          : undefined
                      }
                      onClick={() => deleteQuestion(q.id)}
                    >
                      <i className="pi pi-trash" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  className="qbc-prompt-input"
                  placeholder="Type your question prompt here..."
                  value={q.question}
                  onChange={e =>
                    updateQuestion(q.id, cur => ({
                      ...cur,
                      question: e.target.value,
                    }))
                  }
                />

                {renderFormatInputs(q)}

                <div className="qbc-media-capture-box">
                  <div>
                    <div className="qbc-media-title">
                      Take Evidence & Verification Requirements
                    </div>
                    <div className="qbc-media-sub">
                      Enable surveyor to click picture, record voice note, or
                      record video when answering this question
                    </div>
                  </div>
                  <div className="qbc-media-toggles">
                    <button
                      type="button"
                      className={`qbc-media-btn${q.allowImage ? ' active' : ''}`}
                      onClick={() =>
                        updateQuestion(q.id, cur => ({
                          ...cur,
                          allowImage: !cur.allowImage,
                        }))
                      }
                      title="Enable surveyor to click picture with camera"
                    >
                      <i className="pi pi-camera" />
                      <span>Click Picture</span>
                    </button>
                    <button
                      type="button"
                      className={`qbc-media-btn${q.allowVoice ? ' active' : ''}`}
                      onClick={() =>
                        updateQuestion(q.id, cur => ({
                          ...cur,
                          allowVoice: !cur.allowVoice,
                        }))
                      }
                      title="Enable respondent voice note recording"
                    >
                      <i className="pi pi-volume-up" />
                      <span>Record Voice Note</span>
                    </button>
                    <button
                      type="button"
                      className={`qbc-media-btn${q.allowVideo ? ' active' : ''}`}
                      onClick={() =>
                        updateQuestion(q.id, cur => ({
                          ...cur,
                          allowVideo: !cur.allowVideo,
                        }))
                      }
                      title="Enable surveyor video clip recording"
                    >
                      <i className="pi pi-video" />
                      <span>Record Video</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Add Question Formats Selector Box */}
          <div className="cs-format-selector-box">
            <div className="cs-format-selector-top">
              <div className="cs-format-selector-title">
                <div className="cs-format-plus-circle">
                  <i className="pi pi-plus" style={{ fontWeight: 900 }} />
                </div>
                <div>
                  <h3>Add Question</h3>
                  <p>
                    Pick any of the 5 question formats below to configure your
                    questionnaire
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="cs-question-count-pill"
                  id="questionCountBadge"
                >
                  {questionCountText}
                </span>
              </div>
            </div>

            <div className="cs-formats-grid">
              {FORMAT_CARDS.map(card => (
                <div
                  key={card.type}
                  className="cs-format-card"
                  data-type={card.type}
                  onClick={() => addQuestionOfType(card.type)}
                >
                  <div className="cs-format-icon" style={card.iconStyle}>
                    <i className={card.icon} />
                  </div>
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="cs-sticky-bottom-bar">
            <button
              type="button"
              className="btn-cs-secondary"
              id="btnBackToStep1"
              onClick={() => goToStep(1)}
            >
              <i className="pi pi-arrow-left" />
              <span>Back to General Details</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn-cs-secondary"
                id="btnPreviewBottom"
                onClick={() => setPreviewOpen(true)}
              >
                <i className="pi pi-eye" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                className="btn-cs-save"
                id="btnSaveSurvey"
                onClick={() => handleSaveSurvey(false)}
              >
                <span>Save Survey</span>
                <i className="pi pi-check" style={{ fontWeight: 900 }} />
              </button>

              <button
                type="button"
                className="btn-cs-allocate"
                id="btnSaveAndAllocate"
                onClick={() => handleSaveSurvey(true)}
              >
                <span>Save &amp; Allocate as Task</span>
                <i className="pi pi-arrow-right" style={{ fontWeight: 900 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESPONDENT LIVE PREVIEW MODAL ── */}
      <div
        className="survey-modal-backdrop"
        id="livePreviewModal"
        style={{ display: previewOpen ? 'flex' : 'none' }}
        onClick={e => {
          if (e.target === e.currentTarget) setPreviewOpen(false);
        }}
      >
        <div className="survey-modal-box" style={{ maxWidth: 720 }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Respondent Live Preview
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#e0e7ff',
                  color: '#3730a3',
                }}
              >
                Fellow / Intern View
              </span>
            </div>
            <button
              type="button"
              className="survey-modal-close"
              id="btnCloseLivePreview"
              style={{
                position: 'static',
                color: '#64748b',
                background: '#e2e8f0',
              }}
              onClick={() => setPreviewOpen(false)}
            >
              <i className="pi pi-times" />
            </button>
          </div>

          <div className="survey-modal-body" style={{ padding: 20 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                color: '#ffffff',
                padding: 20,
                borderRadius: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#93c5fd',
                  marginBottom: 4,
                }}
              >
                Madhya Pradesh Youth Program Field Survey
              </div>
              <h2
                style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}
              >
                {previewTitle}
              </h2>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  lineHeight: 1.4,
                  marginBottom: 12,
                }}
              >
                {previewDesc}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  fontSize: '0.74rem',
                  color: '#93c5fd',
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  flexWrap: 'wrap',
                }}
              >
                <span>{`📅 Active: ${startDate} → ${endDate}`}</span>
                <span>{`🎯 Target: ${participants || 100} responses`}</span>
              </div>
            </div>

            <div id="previewQuestionsList">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#2563eb',
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        flex: 1,
                      }}
                    >
                      {q.question || `Untitled Question ${idx + 1}`}
                      {q.required && (
                        <span style={{ color: '#ef4444', marginLeft: 3 }}>
                          *
                        </span>
                      )}
                    </div>
                  </div>

                  {q.type === 'single_choice' && (
                    <div
                      style={{
                        marginLeft: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {(q.options || []).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.82rem',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          <input type="radio" name={`preview_${q.id}`} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple_choice' && (
                    <div
                      style={{
                        marginLeft: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {(q.options || []).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.82rem',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          <input type="checkbox" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'likert_scale' && (
                    <div
                      style={{
                        marginLeft: 10,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 6,
                        textAlign: 'center',
                      }}
                    >
                      {(
                        q.likertConfig?.labels || ['1', '2', '3', '4', '5']
                      ).map((l, lIdx) => (
                        <button
                          key={lIdx}
                          type="button"
                          style={{
                            padding: '8px 4px',
                            borderRadius: 8,
                            border: '1px solid #e9d5ff',
                            background: '#faf5ff',
                            color: '#7e22ce',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <div>{lIdx + 1}</div>
                          <div
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 600,
                              color: '#64748b',
                              marginTop: 2,
                            }}
                          >
                            {l}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'dichotomous' && (
                    <div style={{ marginLeft: 20, display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        style={{
                          padding: '6px 18px',
                          borderRadius: 8,
                          border: '1px solid #fde68a',
                          background: '#fffbeb',
                          color: '#92400e',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {q.dichotomousLabels?.[0] || 'Yes'}
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '6px 18px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {q.dichotomousLabels?.[1] || 'No'}
                      </button>
                    </div>
                  )}

                  {q.type === 'descriptive' && (
                    <div style={{ marginLeft: 20 }}>
                      <textarea
                        rows={2}
                        style={{
                          width: '100%',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          outline: 'none',
                          resize: 'none',
                        }}
                        placeholder={q.placeholder || 'Write response here…'}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="survey-modal-footer"
            style={{ justifyContent: 'space-between' }}
          >
            <span
              style={{ fontSize: '0.74rem', color: '#64748b' }}
              id="previewTotalCount"
            >
              {`${questions.length} question${questions.length !== 1 ? 's' : ''} in survey`}
            </span>
            <button
              type="button"
              className="btn-cs-secondary"
              id="btnCloseLivePreviewFooter"
              onClick={() => setPreviewOpen(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
