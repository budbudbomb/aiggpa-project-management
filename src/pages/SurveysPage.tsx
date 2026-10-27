import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import surveysCss from '../styles/surveys.css?inline';
import { usePageStyles } from '../lib/usePageStyles';
import { useStoreData } from '../lib/storeEvents';
import SurveyStore from '../stores/surveyStore';
import {
  ActivityTaskStore,
  type ActivityTask,
} from '../stores/activityTaskStore';
import type { AdminSurvey, SurveyQuestion } from '../stores/types';
import { PageContainer, PageHeader, AppButton } from '../components';
import { Plus, FileText, CheckSquare, ExternalLink } from 'lucide-react';

function formatDate(dStr?: string): string {
  if (!dStr) return '';
  try {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(dStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dStr;
  }
}

interface BadgeConfig {
  label: string;
  cssClass: string;
  icon: string;
}

function getBadgeConfig(
  subStatus?: string,
  surveyStatus?: string
): BadgeConfig {
  if (subStatus === 'approved') {
    return {
      label: 'Approved',
      cssClass: 'badge-emerald',
      icon: 'pi-check-circle',
    };
  }
  if (subStatus === 'submitted_by_pc') {
    return {
      label: 'SUBMITTED BY PC',
      cssClass: 'badge-purple',
      icon: 'pi-check-circle',
    };
  }
  if (subStatus === 'submitted_by_fellow') {
    return {
      label: 'SUBMITTED BY FELLOW',
      cssClass: 'badge-blue',
      icon: 'pi-check-circle',
    };
  }
  if (subStatus === 'submitted_by_intern') {
    return {
      label: 'SUBMITTED BY INTERN',
      cssClass: 'badge-amber',
      icon: 'pi-check-circle',
    };
  }
  if (surveyStatus === 'closed') {
    return { label: 'CLOSED', cssClass: 'badge-slate', icon: 'pi-lock' };
  }
  return {
    label: 'ACTIVE (DRAFT)',
    cssClass: 'badge-emerald',
    icon: 'pi-check-circle',
  };
}

function getQuestionTypeLabel(type?: string): string {
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'likert_scale') return '5-Point Likert Scale';
  if (type === 'dichotomous') return 'Dichotomous (Yes/No)';
  if (type === 'descriptive') return 'Descriptive Response';
  return 'Single Choice';
}

export default function SurveysPage(): React.ReactElement {
  usePageStyles(surveysCss);
  const version = useStoreData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'questions' | 'feedback' | 'tasks'>(
    'questions'
  );

  const selectedSurveyTasks = useMemo(() => {
    if (!selectedId) return [];
    return ActivityTaskStore.getTasksForSurvey(selectedId);
  }, [selectedId, version]);

  const allSurveys: AdminSurvey[] = useMemo(() => {
    void version;
    return SurveyStore.getSurveys();
  }, [version]);

  const kpis = useMemo(() => {
    const total = allSurveys.length;
    const active = allSurveys.filter(s => s.status !== 'closed').length;
    const closed = allSurveys.filter(s => s.status === 'closed').length;
    const target = allSurveys.reduce(
      (acc, s) => acc + (s.participantsRequired || 100),
      0
    );
    const responses = allSurveys.reduce(
      (acc, s) => acc + (s.responsesCount || 0),
      0
    );
    const rate = target > 0 ? Math.round((responses / target) * 100) : 0;
    return { total, active, closed, target, responses, rate };
  }, [allSurveys]);

  const filtered = useMemo(
    () =>
      allSurveys.filter(s => {
        const matchesSearch =
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.description &&
            s.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter =
          currentFilter === 'all' ||
          (currentFilter === 'active' && s.status !== 'closed') ||
          (currentFilter === 'closed' && s.status === 'closed');
        return matchesSearch && matchesFilter;
      }),
    [allSurveys, searchTerm, currentFilter]
  );

  const selectedSurvey = selectedId
    ? SurveyStore.getSurveyById(selectedId)
    : null;

  useEffect(() => {
    document.title = 'AIGGPA - Survey Management';
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  function openDetails(id: string) {
    setSelectedId(id);
    setModalTab('questions');
    setModalOpen(true);
  }

  const tabBtnStyle = (activeTab: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    fontSize: '0.78rem',
    fontWeight: 800,
    cursor: 'pointer',
    background: activeTab ? '#0f172a' : '#f1f5f9',
    color: activeTab ? '#ffffff' : '#475569',
  });

  return (
    <PageContainer>
      <PageHeader
        title="Survey Management"
        subtitle="Create structured field questionnaires, review hierarchical submissions and supervisor feedbacks, and allocate field surveys"
        icon={<FileText className="w-5 h-5" />}
        breadcrumbs={[{ label: 'Field Research' }, { label: 'Surveys' }]}
        actions={
          <Link to="/create-survey">
            <AppButton
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Survey
            </AppButton>
          </Link>
        }
      />

      {/* Executive KPI Metric Strip (4 Cards) */}
      <div className="survey-kpi-grid">
        <div className="survey-kpi-card">
          <div className="survey-kpi-top">
            <span className="survey-kpi-label">TOTAL SURVEYS</span>
            <div className="survey-kpi-icon-wrap icon-indigo">
              <i className="pi pi-file" />
            </div>
          </div>
          <div className="survey-kpi-val" id="kpiTotalSurveys">
            {kpis.total}
          </div>
          <p className="survey-kpi-sub">Created state-wide</p>
        </div>

        <div className="survey-kpi-card">
          <div className="survey-kpi-top">
            <span className="survey-kpi-label">ACTIVE SURVEYS</span>
            <div className="survey-kpi-icon-wrap icon-emerald">
              <i className="pi pi-check-circle" />
            </div>
          </div>
          <div
            className="survey-kpi-val"
            style={{ color: '#059669' }}
            id="kpiActiveSurveys"
          >
            {kpis.active}
          </div>
          <p className="survey-kpi-sub">Currently open for responses</p>
        </div>

        <div className="survey-kpi-card">
          <div className="survey-kpi-top">
            <span className="survey-kpi-label">TOTAL TARGET</span>
            <div className="survey-kpi-icon-wrap icon-purple">
              <i className="pi pi-users" />
            </div>
          </div>
          <div className="survey-kpi-val" id="kpiTotalTarget">
            {kpis.target}
          </div>
          <p className="survey-kpi-sub">Participants required</p>
        </div>

        <div className="survey-kpi-card">
          <div className="survey-kpi-top">
            <span className="survey-kpi-label">RESPONSES COLLECTED</span>
            <div className="survey-kpi-icon-wrap icon-blue">
              <i className="pi pi-chart-bar" />
            </div>
          </div>
          <div className="survey-kpi-val">
            <span id="kpiTotalResponses">{kpis.responses}</span>
            <span
              style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}
              id="kpiOverallRate"
            >
              ({kpis.rate}%)
            </span>
          </div>
          <p className="survey-kpi-sub">From Fellows and Interns</p>
        </div>
      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="survey-filter-strip">
        <div className="survey-filter-tabs">
          <button
            type="button"
            className={`survey-tab-pill${currentFilter === 'all' ? ' active' : ''}`}
            data-filter="all"
            onClick={() => setCurrentFilter('all')}
          >
            <span>All Surveys</span>
            <span className="pill-count" id="countAllSurveys">
              {kpis.total}
            </span>
          </button>
          <button
            type="button"
            className={`survey-tab-pill${currentFilter === 'active' ? ' active' : ''}`}
            data-filter="active"
            onClick={() => setCurrentFilter('active')}
          >
            <span>Active</span>
            <span className="pill-count" id="countActiveSurveys">
              {kpis.active}
            </span>
          </button>
          <button
            type="button"
            className={`survey-tab-pill${currentFilter === 'closed' ? ' active' : ''}`}
            data-filter="closed"
            onClick={() => setCurrentFilter('closed')}
          >
            <span>Closed</span>
            <span className="pill-count" id="countClosedSurveys">
              {kpis.closed}
            </span>
          </button>
        </div>

        <div className="survey-search-box">
          <i className="pi pi-search" />
          <input
            type="text"
            id="surveySearchInput"
            placeholder="Search by survey name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Dynamic Survey Cards Grid */}
      <div className="survey-cards-grid" id="surveyCardsContainer">
        {filtered.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: 16,
              padding: '48px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: 12,
              }}
            >
              <i className="pi pi-file-edit" />
            </div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 6,
              }}
            >
              No surveys found
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                maxWidth: 400,
                margin: '0 auto 16px',
              }}
            >
              {searchTerm
                ? `No surveys matched your search "${searchTerm}".`
                : 'Get started by creating your first structured survey questionnaire.'}
            </p>
            <Link
              to="/create-survey"
              className="btn-create-survey-main"
              style={{ display: 'inline-flex' }}
            >
              <i className="pi pi-plus" />
              <span>Create Survey Now</span>
            </Link>
          </div>
        ) : (
          filtered.map(survey => {
            const req = survey.participantsRequired || 100;
            const resCount = survey.responsesCount || 0;
            const percent = Math.min(100, Math.round((resCount / req) * 100));
            const questionCount = survey.questions?.length || 0;
            const feedbackCount = survey.feedbacks?.length || 0;
            const linkedTasks = ActivityTaskStore.getTasksForSurvey(survey.id);
            const badge = getBadgeConfig(
              survey.submissionStatus,
              survey.status
            );

            let fillClass = 'fill-blue';
            if (percent >= 100) fillClass = 'fill-emerald';
            else if (percent < 45) fillClass = 'fill-amber';

            return (
              <div className="survey-card" key={survey.id} data-id={survey.id}>
                <div>
                  <div className="survey-card-top-row">
                    <span className={`survey-badge ${badge.cssClass}`}>
                      <i
                        className={`pi ${badge.icon}`}
                        style={{ fontSize: 10 }}
                      />
                      <span>{badge.label}</span>
                    </span>
                    <div className="survey-card-meta">
                      {linkedTasks.length > 0 && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          <i
                            className="pi pi-check-square"
                            style={{ fontSize: 9 }}
                          />
                          <span>
                            {linkedTasks.length} Task
                            {linkedTasks.length > 1 ? 's' : ''}
                          </span>
                        </span>
                      )}
                      {feedbackCount > 0 && (
                        <span className="review-pill">
                          <i
                            className="pi pi-comments"
                            style={{ fontSize: 10 }}
                          />
                          <span>
                            {feedbackCount} Review{feedbackCount > 1 ? 's' : ''}
                          </span>
                        </span>
                      )}
                      <span className="q-count">{questionCount} Qs</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <h3 className="survey-card-title">{survey.title}</h3>
                    {survey.description && (
                      <p className="survey-card-desc">{survey.description}</p>
                    )}
                  </div>

                  {(survey.startDate || survey.endDate) && (
                    <div className="survey-card-dates">
                      <i className="pi pi-calendar" />
                      <span>
                        {formatDate(survey.startDate)} &rarr;{' '}
                        {formatDate(survey.endDate)}
                      </span>
                    </div>
                  )}

                  <div className="survey-progress-wrap">
                    <div className="survey-progress-labels">
                      <span className="lbl">Stakeholders Interviewed</span>
                      <span className="stat">
                        {resCount} / {req} ({percent}%)
                      </span>
                    </div>
                    <div className="survey-progress-bar">
                      <div
                        className={`survey-progress-fill ${fillClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="survey-card-footer">
                  <button
                    type="button"
                    className="btn-card-details"
                    data-action="details"
                    data-id={survey.id}
                    onClick={() => openDetails(survey.id)}
                  >
                    <i className="pi pi-eye" />
                    <span>
                      Details {feedbackCount > 0 ? `(${feedbackCount})` : ''}
                    </span>
                  </button>

                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Link
                      to={`/activities?surveyId=${survey.id}&title=${encodeURIComponent(survey.title)}`}
                      className="btn-card-allocate"
                    >
                      <span>
                        {linkedTasks.length > 0 ? '+ Allocate Task' : 'Allocate'}
                      </span>
                      <i
                        className="pi pi-arrow-right"
                        style={{ fontSize: 10 }}
                      />
                    </Link>
                    <Link
                      to={`/surveys/${survey.id}/dashboard`}
                      id={`view-dashboard-btn-${survey.id}`}
                      className="btn-card-dashboard"
                    >
                      <i className="pi pi-chart-bar" />
                      <span>View Dashboard</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SURVEY DETAILS & HIERARCHY REVIEWS MODAL */}
      <div
        className="survey-modal-backdrop"
        id="surveyDetailsModal"
        style={{ display: modalOpen && selectedSurvey ? 'flex' : 'none' }}
        onClick={e => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className="survey-modal-box">
          <div className="survey-modal-header">
            <button
              type="button"
              className="survey-modal-close"
              id="modalCloseBtn"
              onClick={() => setModalOpen(false)}
            >
              <i className="pi pi-times" />
            </button>
            <div style={{ paddingRight: 40 }}>
              <h2
                id="modalSurveyTitle"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  marginBottom: 8,
                }}
              >
                {selectedSurvey?.title ?? 'Survey Details'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  id="modalSurveyBadge"
                  className={`survey-badge ${
                    selectedSurvey
                      ? getBadgeConfig(
                          selectedSurvey.submissionStatus,
                          selectedSurvey.status
                        ).cssClass
                      : 'badge-purple'
                  }`}
                >
                  {selectedSurvey
                    ? getBadgeConfig(
                        selectedSurvey.submissionStatus,
                        selectedSurvey.status
                      ).label
                    : 'Active'}
                </span>
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                  id="modalSurveyQCount"
                >
                  {selectedSurvey?.questions?.length || 0} Questions
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              id="modalTabQuestions"
              style={tabBtnStyle(modalTab === 'questions')}
              onClick={() => setModalTab('questions')}
            >
              Questionnaire ({selectedSurvey?.questions?.length || 0})
            </button>
            <button
              type="button"
              id="modalTabFeedback"
              style={tabBtnStyle(modalTab === 'feedback')}
              onClick={() => setModalTab('feedback')}
            >
              Reviews ({selectedSurvey?.feedbacks?.length || 0})
            </button>
            <button
              type="button"
              id="modalTabTasks"
              style={tabBtnStyle(modalTab === 'tasks')}
              onClick={() => setModalTab('tasks')}
            >
              Linked Tasks ({selectedSurveyTasks.length})
            </button>
          </div>

          <div className="survey-modal-body">
            <div
              id="modalQuestionsContent"
              style={{ display: modalTab === 'questions' ? 'block' : 'none' }}
            >
              {!selectedSurvey?.questions ||
              selectedSurvey.questions.length === 0 ? (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    padding: '16px 0',
                  }}
                >
                  No questions configured for this survey.
                </p>
              ) : (
                selectedSurvey.questions.map(
                  (q: SurveyQuestion, idx: number) => (
                    <div
                      key={q.id ?? idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '14px 16px',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: '#2563eb',
                          }}
                        >
                          Q{idx + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            flex: 1,
                          }}
                        >
                          {q.question || 'Untitled Question'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {getQuestionTypeLabel(q.type)}
                        </span>
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div
                          style={{
                            marginLeft: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            marginTop: 8,
                          }}
                        >
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              style={{
                                fontSize: '0.78rem',
                                color: '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: '#94a3b8',
                                }}
                              />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.dichotomousLabels && (
                        <div
                          style={{
                            marginLeft: 24,
                            display: 'flex',
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 6,
                              background: '#fef3c7',
                              color: '#92400e',
                            }}
                          >
                            {q.dichotomousLabels[0]}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#475569',
                            }}
                          >
                            {q.dichotomousLabels[1]}
                          </span>
                        </div>
                      )}
                      {q.likertConfig && (
                        <div
                          style={{
                            marginLeft: 24,
                            display: 'flex',
                            gap: 4,
                            marginTop: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          {(
                            q.likertConfig.labels || ['1', '2', '3', '4', '5']
                          ).map((l, lIdx) => (
                            <span
                              key={lIdx}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: '#faf5ff',
                                border: '1px solid #e9d5ff',
                                color: '#7e22ce',
                              }}
                            >
                              {lIdx + 1}. {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )
              )}
            </div>

            <div
              id="modalFeedbackContent"
              style={{ display: modalTab === 'feedback' ? 'block' : 'none' }}
            >
              {!selectedSurvey?.feedbacks ||
              selectedSurvey.feedbacks.length === 0 ? (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    padding: '16px 0',
                    textAlign: 'center',
                  }}
                >
                  No supervisory reviews or field observations submitted yet.
                </p>
              ) : (
                selectedSurvey.feedbacks.map(fb => (
                  <div
                    key={fb.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '14px 16px',
                      marginBottom: 12,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: '#0f172a',
                          }}
                        >
                          {fb.submittedBy?.name || 'Reviewer'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 7px',
                            borderRadius: 999,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                          }}
                        >
                          {fb.submittedBy?.role || fb.role}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {fb.createdAt || ''}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#334155',
                        lineHeight: 1.45,
                        marginBottom: 8,
                      }}
                    >
                      {fb.feedbackText}
                    </p>
                    {fb.challengesFaced && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          background: '#fff1f2',
                          borderLeft: '3px solid #f43f5e',
                          padding: '6px 10px',
                          borderRadius: 4,
                          marginBottom: 6,
                          color: '#9f1239',
                        }}
                      >
                        <strong>Field Bottleneck:</strong> {fb.challengesFaced}
                      </div>
                    )}
                    {fb.recommendations && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          background: '#f0fdf4',
                          borderLeft: '3px solid #22c55e',
                          padding: '6px 10px',
                          borderRadius: 4,
                          color: '#166534',
                        }}
                      >
                        <strong>Recommendation:</strong> {fb.recommendations}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* ── Linked Tasks Content Tab ── */}
            <div
              id="modalTasksContent"
              style={{ display: modalTab === 'tasks' ? 'block' : 'none' }}
            >
              {selectedSurveyTasks.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <i
                    className="pi pi-list-check"
                    style={{
                      fontSize: '1.8rem',
                      color: '#94a3b8',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  />
                  <h4
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      margin: '0 0 4px',
                    }}
                  >
                    No Tasks Allocated Yet
                  </h4>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#64748b',
                      maxWidth: 380,
                      margin: '0 auto 16px',
                    }}
                  >
                    This survey does not have any operational tasks linked to
                    field staff or groups yet.
                  </p>
                  <Link
                    to={`/activities?surveyId=${selectedSurvey?.id}&title=${encodeURIComponent(selectedSurvey?.title || '')}`}
                    className="btn-create-survey-main"
                    style={{ display: 'inline-flex' }}
                  >
                    <i className="pi pi-plus" />
                    <span>Allocate First Task</span>
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {selectedSurveyTasks.length} Operational Task
                      {selectedSurveyTasks.length > 1 ? 's' : ''} Linked
                    </span>
                    <Link
                      to={`/activities?surveyId=${selectedSurvey?.id}&title=${encodeURIComponent(selectedSurvey?.title || '')}`}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2563eb',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        textDecoration: 'none',
                      }}
                    >
                      <i className="pi pi-plus" style={{ fontSize: 10 }} />
                      <span>Allocate Another Task</span>
                    </Link>
                  </div>

                  {selectedSurveyTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                              }}
                            >
                              {task.id}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background:
                                  task.status === 'Completed'
                                    ? '#dcfce7'
                                    : task.status === 'In Review'
                                      ? '#fef3c7'
                                      : '#eff6ff',
                                color:
                                  task.status === 'Completed'
                                    ? '#15803d'
                                    : task.status === 'In Review'
                                      ? '#b45309'
                                      : '#1d4ed8',
                              }}
                            >
                              {task.status}
                            </span>
                            {task.assignmentMode === 'Group' && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#ede9fe',
                                  color: '#6d28d9',
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                }}
                              >
                                Group ({task.groupName || 'Team'})
                              </span>
                            )}
                          </div>
                          <h4
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              margin: 0,
                            }}
                          >
                            {task.title}
                          </h4>
                        </div>
                        <Link
                          to="/activities"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: '#eff6ff',
                          }}
                        >
                          <span>Open Board</span>
                          <i
                            className="pi pi-arrow-up-right"
                            style={{ fontSize: 9 }}
                          />
                        </Link>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: 8,
                          fontSize: '0.75rem',
                          background: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: 8,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.68rem',
                              display: 'block',
                              fontWeight: 600,
                            }}
                          >
                            ASSIGNEE
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            {task.assigneeName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#64748b',
                              display: 'block',
                            }}
                          >
                            ({task.assigneeRole})
                          </span>
                        </div>
                        <div>
                          <span
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.68rem',
                              display: 'block',
                              fontWeight: 600,
                            }}
                          >
                            REVIEWER
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            {task.reviewerName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#64748b',
                              display: 'block',
                            }}
                          >
                            ({task.reviewerRole})
                          </span>
                        </div>
                        <div>
                          <span
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.68rem',
                              display: 'block',
                              fontWeight: 600,
                            }}
                          >
                            PRIORITY &amp; DUE DATE
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            {task.priority} Priority
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#64748b',
                              display: 'block',
                            }}
                          >
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="survey-modal-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <button
              type="button"
              className="btn-cs-secondary"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
            {selectedSurvey && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  to={`/activities?surveyId=${selectedSurvey.id}&title=${encodeURIComponent(selectedSurvey.title)}`}
                  className="btn-card-allocate"
                  style={{ padding: '8px 14px', textDecoration: 'none' }}
                >
                  <span>Allocate Task</span>
                  <i className="pi pi-arrow-right" style={{ fontSize: 10 }} />
                </Link>
                <Link
                  to={`/surveys/${selectedSurvey.id}/dashboard`}
                  className="btn-card-dashboard"
                  style={{ padding: '8px 14px', textDecoration: 'none' }}
                >
                  <i className="pi pi-chart-bar" />
                  <span>Full Dashboard</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
