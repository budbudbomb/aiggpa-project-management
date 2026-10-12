import { useEffect, useMemo, useRef, useState } from 'react';
import complaintsCss from '../styles/complaints.css?inline';
import complaintsInlineCss from '../styles/complaints-inline.css?inline';
import { usePageStyles } from '../lib/usePageStyles';
import { useStoreData } from '../lib/storeEvents';
import ComplaintStore from '../stores/complaintStore';
import { MasterStore } from '../stores/masterStore';
import { useAuthStore } from '../auth/store/authStore';
import type { Complaint } from '../stores/types';
import { PageContainer, PageHeader, AppButton } from '../components';
import {
  Plus,
  LifeBuoy,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Play,
  Paperclip,
  Calendar,
  Eye,
  Check,
  X,
  ArrowUpRight,
  Shield,
  MessageSquare,
  Users,
} from 'lucide-react';

function formatDate(dStr?: string): string {
  if (!dStr) return '';
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dStr;
  }
}

function getCategoryName(cat?: string): string {
  const masterCat = MasterStore.getGrievanceCategories().find(
    c => c.code === cat || c.name === cat || c.id === cat
  );
  if (masterCat) return masterCat.name || masterCat.label || '';

  const map: Record<string, string> = {
    stipend: 'Stipend & Disbursal Delay',
    field_travel: 'Field Travel & Conveyance',
    infrastructure: 'Hardware & Infrastructure',
    workload_tasks: 'Workload & Task Allocation',
    interpersonal: 'Interpersonal & Behavioral',
    other: 'General Issue',
  };
  return (cat && map[cat]) || cat || '';
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

interface AttachedMedia {
  name: string;
  duration?: number;
}

type ReviewAction = 'resolve' | 'reject' | 'forward';

export default function ComplaintsPage(): React.ReactElement {
  usePageStyles(complaintsCss);
  usePageStyles(complaintsInlineCss);
  const version = useStoreData();

  // ── State ──
  const [activeTab, setActiveTab] = useState<
    'my_complaints' | 'review_interns'
  >('my_complaints');
  const [currentStatusFilter, setCurrentStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const grievanceCategories = useMemo(() => {
    void version;
    return MasterStore.getGrievanceCategories();
  }, [version]);

  // Add complaint form
  const [addCategory, setAddCategory] = useState(
    grievanceCategories[0]?.code || 'GC-001'
  );
  const [addIncidentDate, setAddIncidentDate] = useState(todayIso);
  const [addSubject, setAddSubject] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [attachedVoice, setAttachedVoice] = useState<AttachedMedia | null>(
    null
  );
  const [attachedVideo, setAttachedVideo] = useState<AttachedMedia | null>(
    null
  );
  const [attachedDoc, setAttachedDoc] = useState<AttachedMedia | null>(null);

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Review modal
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>('resolve');
  const [reviewComment, setReviewComment] = useState('');

  // Hidden native file inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const all: Complaint[] = useMemo(() => {
    void version;
    return ComplaintStore.getAll();
  }, [version]);
  const detailsComplaint = detailsId ? ComplaintStore.getById(detailsId) : null;
  const reviewComplaint = reviewId ? ComplaintStore.getById(reviewId) : null;

  useEffect(() => {
    document.title = 'AIGGPA - Complaint Management';
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!addOpen && !detailsOpen && !reviewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAddOpen(false);
        setDetailsOpen(false);
        setReviewOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [addOpen, detailsOpen, reviewOpen]);

  // ── Counts & KPIs ──
  const internList = all.filter(c => c.applicantRole === 'intern');
  const tabCounts = {
    my: all.filter(c => c.applicantRole === 'fellow').length,
    interns: internList.length,
    internPending: internList.filter(c => c.status === 'pending').length,
  };

  const sourceList: Complaint[] = useMemo(() => {
    void all;
    return activeTab === 'my_complaints'
      ? ComplaintStore.getMyComplaints()
      : ComplaintStore.getInternComplaints();
  }, [all, activeTab]);

  const kpis = {
    total: sourceList.length,
    pending: sourceList.filter(c => c.status === 'pending').length,
    resolved: sourceList.filter(c => c.status === 'resolved').length,
    rejected: sourceList.filter(c => c.status === 'rejected').length,
  };

  const filtered = sourceList.filter(c => {
    const matchesStatus =
      currentStatusFilter === 'all' || c.status === currentStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      c.subject.toLowerCase().includes(q) ||
      c.ticketNumber.toLowerCase().includes(q) ||
      (c.applicantName && c.applicantName.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  // ── Handlers ──
  function switchTab(tab: 'my_complaints' | 'review_interns') {
    setActiveTab(tab);
    setCurrentStatusFilter('all');
  }

  function openAddModal() {
    setAddCategory('infrastructure');
    setAddIncidentDate(todayIso());
    setAddSubject('');
    setAddDesc('');
    setAttachedVoice(null);
    setAttachedVideo(null);
    setAttachedDoc(null);
    setAddOpen(true);
  }

  function toggleRecording() {
    if (!isRecording) {
      setIsRecording(true);
      setRecSecs(0);
      recordingTimer.current = setInterval(() => setRecSecs(s => s + 1), 1000);
    } else {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setAttachedVoice({
        name: `Voice_Note_${Date.now().toString().slice(-4)}.m4a`,
        duration: recSecs || 12,
      });
      setRecSecs(0);
    }
  }

  function submitAddForm(e: React.FormEvent) {
    e.preventDefault();
    const subject = addSubject.trim();
    const description = addDesc.trim();

    if (!subject || subject.length < 5) {
      alert('Subject must be at least 5 characters.');
      return;
    }
    if (!description || description.length < 10) {
      alert('Please provide sufficient description details.');
      return;
    }

    const catItem = grievanceCategories.find(
      c =>
        c.code === addCategory || c.name === addCategory || c.id === addCategory
    );
    const applicant = useAuthStore.getState().user;

    ComplaintStore.addComplaint({
      applicantId: applicant?.id || undefined,
      applicantName: applicant?.name || undefined,
      applicantRole: applicant?.role || undefined,
      category: addCategory,
      categoryLabel: catItem?.name || getCategoryName(addCategory),
      priority:
        catItem?.defaultPriority ||
        (addCategory === 'infrastructure' || addCategory === 'stipend'
          ? 'urgent'
          : 'high'),
      incidentDate: addIncidentDate,
      subject,
      description,
      documentName: attachedDoc?.name || null,
      voiceNoteName: attachedVoice?.name || null,
      voiceNoteDuration: attachedVoice?.duration || null,
    });

    setAddOpen(false);
    setActiveTab('my_complaints');
    setCurrentStatusFilter('all');
  }

  function openReviewModal(id: string, action: ReviewAction) {
    setReviewId(id);
    setReviewAction(action);
    setReviewComment('');
    setReviewOpen(true);
  }

  function submitReview() {
    const comment = reviewComment.trim();
    if (!comment) {
      alert('Please enter a remark or comment before proceeding.');
      return;
    }
    if (reviewAction === 'resolve') {
      ComplaintStore.updateStatus(reviewId!, 'resolved', comment);
    } else if (reviewAction === 'reject') {
      ComplaintStore.updateStatus(reviewId!, 'rejected', comment);
    } else {
      ComplaintStore.forwardComplaint(reviewId!, comment);
    }
    setReviewOpen(false);
  }

  const reviewMeta = (() => {
    if (reviewAction === 'resolve') {
      return {
        title: `Resolve Complaint: ${reviewComplaint?.ticketNumber ?? ''}`,
        btn: 'Confirm Resolution',
        bg: '#059669',
        placeholder:
          'Provide resolution notes, instructions given to intern, or action taken...',
      };
    }
    if (reviewAction === 'reject') {
      return {
        title: `Reject Complaint: ${reviewComplaint?.ticketNumber ?? ''}`,
        btn: 'Confirm Rejection',
        bg: '#e11d48',
        placeholder:
          'State valid grounds for rejection according to program guidelines...',
      };
    }
    return {
      title: `Forward Complaint to PC: ${reviewComplaint?.ticketNumber ?? ''}`,
      btn: 'Forward to Coordinator',
      bg: '#4338ca',
      placeholder:
        'Explain why this requires Program Coordinator escalation...',
    };
  })();

  return (
    <PageContainer>
      {/* ── Title Header Strip with + Complaint button ── */}
      <PageHeader
        title="Complaint & Grievance Management"
        subtitle="Manage personal grievances to Program Coordinator and review field complaints submitted by team members"
        icon={<LifeBuoy className="w-5 h-5" />}
        breadcrumbs={[{ label: 'Helpdesk & Support' }, { label: 'Grievances' }]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Lodge Complaint
          </AppButton>
        }
      />

      {/* ── Segmented Tab Switcher (Removed per user request) ── */}
      <div className="cmp-tab-switcher-box" style={{ display: 'none' }}>
        <button
          type="button"
          className={`cmp-tab-btn${activeTab === 'my_complaints' ? ' active' : ''}`}
          id="tabBtnMy"
          onClick={() => switchTab('my_complaints')}
        >
          <i className="pi pi-comments" style={{ fontSize: 15 }} />
          <span>My Complaints</span>
          <span className="cmp-tab-badge" id="countBadgeMy">
            {tabCounts.my}
          </span>
        </button>
        <button
          type="button"
          className={`cmp-tab-btn${activeTab === 'review_interns' ? ' active' : ''}`}
          id="tabBtnInterns"
          onClick={() => switchTab('review_interns')}
        >
          <i className="pi pi-users" style={{ fontSize: 15 }} />
          <span>Review Intern Complaints</span>
          <span className="cmp-tab-badge" id="countBadgeInterns">
            {tabCounts.interns}
          </span>
          <span
            className="cmp-alert-dot"
            id="internPendingDot"
            style={{
              display: tabCounts.internPending > 0 ? 'inline-block' : 'none',
            }}
          />
        </button>
      </div>

      {/* ── 4 KPI Metric Cards ── */}
      <div className="cmp-kpi-grid">
        <div className="cmp-kpi-card kpi-card-total">
          <div className="cmp-kpi-top">
            <span className="cmp-kpi-label">TOTAL COMPLAINTS</span>
            <div className="cmp-kpi-icon-wrap kpi-icon-total">
              <i className="pi pi-inbox" />
            </div>
          </div>
          <div className="cmp-kpi-val" id="kpiTotal">
            {kpis.total}
          </div>
          <p className="cmp-kpi-sub">In selected view</p>
        </div>

        <div className="cmp-kpi-card kpi-card-pending">
          <div className="cmp-kpi-top">
            <span className="cmp-kpi-label">PENDING</span>
            <div className="cmp-kpi-icon-wrap kpi-icon-pending">
              <i className="pi pi-clock" />
            </div>
          </div>
          <div
            className="cmp-kpi-val"
            style={{ color: '#d97706' }}
            id="kpiPending"
          >
            {kpis.pending}
          </div>
          <p className="cmp-kpi-sub">Awaiting resolution</p>
        </div>

        <div className="cmp-kpi-card kpi-card-resolved">
          <div className="cmp-kpi-top">
            <span className="cmp-kpi-label">RESOLVED</span>
            <div className="cmp-kpi-icon-wrap kpi-icon-resolved">
              <i className="pi pi-check-circle" />
            </div>
          </div>
          <div
            className="cmp-kpi-val"
            style={{ color: '#059669' }}
            id="kpiResolved"
          >
            {kpis.resolved}
          </div>
          <p className="cmp-kpi-sub">Successfully addressed</p>
        </div>

        <div className="cmp-kpi-card kpi-card-rejected">
          <div className="cmp-kpi-top">
            <span className="cmp-kpi-label">REJECTED</span>
            <div className="cmp-kpi-icon-wrap kpi-icon-rejected">
              <i className="pi pi-times-circle" />
            </div>
          </div>
          <div
            className="cmp-kpi-val"
            style={{ color: '#e11d48' }}
            id="kpiRejected"
          >
            {kpis.rejected}
          </div>
          <p className="cmp-kpi-sub">Declined after audit</p>
        </div>
      </div>

      {/* ── Status Filter Pills & Search ── */}
      <div className="cmp-filter-strip">
        <div className="cmp-filter-pills">
          {['all', 'pending', 'resolved', 'rejected'].map(status => (
            <button
              key={status}
              type="button"
              className={`cmp-pill-btn${currentStatusFilter === status ? ' active' : ''}`}
              data-status={status}
              onClick={() => setCurrentStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="cmp-search-box">
          <i className="pi pi-search" />
          <input
            type="text"
            id="cmpSearchInput"
            placeholder="Search by ticket, subject, or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Complaints Cards Grid ── */}
      <div className="cmp-cards-grid" id="cmpCardsContainer">
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
              <i className="pi pi-inbox" />
            </div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: 6,
              }}
            >
              No complaints found
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                maxWidth: 400,
                margin: '0 auto 16px',
              }}
            >
              {searchQuery
                ? `No complaints match your search "${searchQuery}".`
                : 'No active grievance tickets in this view.'}
            </p>
            {activeTab === 'my_complaints' && (
              <button
                type="button"
                className="btn-file-complaint-main"
                onClick={openAddModal}
              >
                <i className="pi pi-plus" />
                <span>File a Complaint</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map(c => {
            let statusClass = 'status-pending';
            let statusLabel = 'Pending';
            let statusIcon = 'pi-clock';

            if (c.status === 'resolved') {
              statusClass = 'status-resolved';
              statusLabel = 'Resolved';
              statusIcon = 'pi-check-circle';
            } else if (c.status === 'rejected') {
              statusClass = 'status-rejected';
              statusLabel = 'Rejected';
              statusIcon = 'pi-times-circle';
            }

            let priorityClass = 'priority-medium';
            if (c.priority === 'urgent') priorityClass = 'priority-urgent';
            else if (c.priority === 'high') priorityClass = 'priority-high';
            else if (c.priority === 'low') priorityClass = 'priority-low';

            return (
              <div className="cmp-card" key={c.id} data-id={c.id}>
                <div>
                  <div className="cmp-card-top">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span className="cmp-ticket-pill">{c.ticketNumber}</span>
                      <span className={`cmp-priority-badge ${priorityClass}`}>
                        {c.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <span className={`cmp-status-badge ${statusClass}`}>
                      <i
                        className={`pi ${statusIcon}`}
                        style={{ fontSize: 11 }}
                      />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <div className="cmp-card-applicant">
                    <span className="cmp-applicant-name">
                      {c.applicantName}
                    </span>
                    <span className="cmp-applicant-role">
                      {c.applicantRole}
                    </span>
                    {c.assignedLocation && (
                      <span className="cmp-applicant-loc">
                        • {c.assignedLocation}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#4338ca',
                        background: '#eef2ff',
                        padding: '2px 7px',
                        borderRadius: 4,
                      }}
                    >
                      {getCategoryName(c.category)}
                    </span>
                    <h3 className="cmp-card-title">{c.subject}</h3>
                    <p className="cmp-card-desc">{c.description}</p>
                  </div>

                  {c.voiceNoteName && (
                    <div
                      className="cmp-audio-pill"
                      onClick={() =>
                        alert(`Playing voice note: ${c.voiceNoteName}`)
                      }
                    >
                      <div className="cmp-audio-icon">
                        <i className="pi pi-play" />
                      </div>
                      <span>{c.voiceNoteName}</span>
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                        ({c.voiceNoteDuration || 15}s)
                      </span>
                    </div>
                  )}

                  {c.documentName && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.75rem',
                        color: '#2563eb',
                        fontWeight: 700,
                        marginTop: 8,
                      }}
                    >
                      <i className="pi pi-paperclip" />
                      <span>{c.documentName}</span>
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <i className="pi pi-calendar" />
                    <span>Submitted on {formatDate(c.appliedAt)}</span>
                  </div>
                </div>

                <div className="cmp-card-footer">
                  <button
                    type="button"
                    className="btn-cmp-details"
                    data-action="details"
                    data-id={c.id}
                    onClick={() => {
                      setDetailsId(c.id);
                      setDetailsOpen(true);
                    }}
                  >
                    <i className="pi pi-eye" />
                    <span>Details</span>
                  </button>

                  {activeTab === 'review_interns' && c.status === 'pending' && (
                    <div className="cmp-action-group">
                      <button
                        type="button"
                        className="btn-cmp-resolve"
                        data-action="resolve"
                        data-id={c.id}
                        title="Resolve Complaint"
                        onClick={() => openReviewModal(c.id, 'resolve')}
                      >
                        <i className="pi pi-check" />
                        <span>Resolve</span>
                      </button>
                      <button
                        type="button"
                        className="btn-cmp-reject"
                        data-action="reject"
                        data-id={c.id}
                        title="Reject Complaint"
                        onClick={() => openReviewModal(c.id, 'reject')}
                      >
                        <i className="pi pi-times" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        className="btn-cmp-forward"
                        data-action="forward"
                        data-id={c.id}
                        title="Forward to PC"
                        onClick={() => openReviewModal(c.id, 'forward')}
                      >
                        <i className="pi pi-arrow-up-right" />
                        <span>Forward</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL 1: ADD COMPLAINT ── */}
      <div
        className="survey-modal-backdrop"
        id="addComplaintModal"
        style={{ display: addOpen ? 'flex' : 'none' }}
        onClick={e => {
          if (e.target === e.currentTarget) setAddOpen(false);
        }}
      >
        <div className="modal-submit-complaint-box">
          <div className="modal-sub-header">
            <div className="modal-sub-header-left">
              <div className="modal-shield-icon-wrap">
                <i className="pi pi-shield" />
              </div>
              <div className="modal-sub-title-group">
                <h2>Submit New Complaint</h2>
                <p>
                  Will be submitted for review to:{' '}
                  <strong>Program Coordinator (PC)</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              className="modal-close-x-btn"
              id="closeAddModalBtn"
              title="Close"
              onClick={() => setAddOpen(false)}
            >
              <i className="pi pi-times" />
            </button>
          </div>

          <form id="addComplaintForm" onSubmit={submitAddForm}>
            <div className="modal-form-body">
              {/* Row 1: Category & Date of Incident */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="modal-form-label">
                    Complaint Category <span className="req">*</span>
                  </label>
                  <select
                    id="addCmpCategory"
                    className="modal-input"
                    style={{ cursor: 'pointer' }}
                    value={addCategory}
                    onChange={e => setAddCategory(e.target.value)}
                  >
                    {grievanceCategories.map(c => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.slaHours}h SLA)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="modal-form-label">
                    Date of Incident / Occurrence
                  </label>
                  <input
                    type="date"
                    id="addCmpIncidentDate"
                    className="modal-input"
                    value={addIncidentDate}
                    onChange={e => setAddIncidentDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Subject */}
              <div style={{ marginBottom: 14 }}>
                <label className="modal-form-label">
                  Subject / Short Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="addCmpSubject"
                  className="modal-input"
                  placeholder="e.g., Delay in village travel expense reimbursement"
                  value={addSubject}
                  onChange={e => setAddSubject(e.target.value)}
                />
              </div>

              {/* Row 3: Detailed Description */}
              <div style={{ marginBottom: 16 }}>
                <label className="modal-form-label">
                  Detailed Description <span className="req">*</span>
                </label>
                <textarea
                  id="addCmpDesc"
                  className="modal-input"
                  rows={3}
                  style={{ resize: 'none' }}
                  placeholder="Describe the issue in detail, including specific locations, personnel involved, and any prior communication..."
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                />
              </div>

              {/* Row 4: Media Evidence */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span className="modal-form-label" style={{ margin: 0 }}>
                    Media Evidence &amp; Supporting Documents
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Optional
                  </span>
                </div>

                <input
                  type="file"
                  ref={audioInputRef}
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={() => {
                    const file = audioInputRef.current?.files?.[0];
                    if (file)
                      setAttachedVoice({ name: file.name, duration: 15 });
                  }}
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={() => {
                    const file = videoInputRef.current?.files?.[0];
                    if (file) setAttachedVideo({ name: file.name });
                  }}
                />
                <input
                  type="file"
                  ref={docInputRef}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={() => {
                    const file = docInputRef.current?.files?.[0];
                    if (file) setAttachedDoc({ name: file.name });
                  }}
                />

                <div className="modal-media-evidence-wrap">
                  <div className="modal-media-grid-3">
                    {/* 1. Voice Note */}
                    <div
                      className="modal-media-btn-card"
                      id="btnRecordVoiceNote"
                      onClick={toggleRecording}
                    >
                      <div
                        className="modal-media-circle circle-purple"
                        id="voiceNoteCircle"
                        style={
                          isRecording
                            ? { background: '#e11d48', color: '#ffffff' }
                            : undefined
                        }
                      >
                        <i className="pi pi-microphone" id="voiceIcon" />
                      </div>
                      <span className="modal-media-title">Voice Note</span>
                      <span
                        className="modal-media-sub"
                        id="voiceNoteStatusText"
                      >
                        {isRecording ? (
                          <span style={{ color: '#e11d48', fontWeight: 800 }}>
                            Recording ({recSecs}s)... Click to stop
                          </span>
                        ) : (
                          <>
                            Record &bull;{' '}
                            <a
                              id="btnUploadAudioLink"
                              onClick={e => {
                                e.stopPropagation();
                                audioInputRef.current?.click();
                              }}
                            >
                              Upload
                            </a>
                          </>
                        )}
                      </span>
                    </div>

                    {/* 2. Video Note */}
                    <div
                      className="modal-media-btn-card"
                      id="btnVideoNote"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <div
                        className="modal-media-circle circle-cyan"
                        id="videoNoteCircle"
                      >
                        <i className="pi pi-video" />
                      </div>
                      <span className="modal-media-title">Video Note</span>
                      <span
                        className="modal-media-sub"
                        id="videoNoteStatusText"
                      >
                        Camera /{' '}
                        <a
                          id="btnUploadVideoLink"
                          onClick={e => {
                            e.stopPropagation();
                            videoInputRef.current?.click();
                          }}
                        >
                          Upload
                        </a>
                      </span>
                    </div>

                    {/* 3. Document */}
                    <div
                      className="modal-media-btn-card"
                      id="btnDocNote"
                      onClick={() => docInputRef.current?.click()}
                    >
                      <div
                        className="modal-media-circle circle-slate"
                        id="docNoteCircle"
                      >
                        <i className="pi pi-paperclip" />
                      </div>
                      <span className="modal-media-title">Document</span>
                      <span className="modal-media-sub" id="docNoteStatusText">
                        PDF / Photo
                      </span>
                    </div>
                  </div>

                  {/* Attachment indicator tags row */}
                  <div
                    id="attachedMediaPillsRow"
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}
                  >
                    {attachedVoice && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#f3e8ff',
                          color: '#7e22ce',
                          border: '1px solid #e9d5ff',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <i className="pi pi-microphone" />
                        <span>
                          {attachedVoice.name} ({attachedVoice.duration}s)
                        </span>
                        <i
                          className="pi pi-times"
                          style={{ cursor: 'pointer', fontSize: 10 }}
                          onClick={() => setAttachedVoice(null)}
                        />
                      </span>
                    )}
                    {attachedVideo && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#e0f2fe',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <i className="pi pi-video" />
                        <span>{attachedVideo.name}</span>
                        <i
                          className="pi pi-times"
                          style={{ cursor: 'pointer', fontSize: 10 }}
                          onClick={() => setAttachedVideo(null)}
                        />
                      </span>
                    )}
                    {attachedDoc && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <i className="pi pi-file" />
                        <span>{attachedDoc.name}</span>
                        <i
                          className="pi pi-times"
                          style={{ cursor: 'pointer', fontSize: 10 }}
                          onClick={() => setAttachedDoc(null)}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-sub-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                id="btnCancelAddModal"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit-main"
                id="btnConfirmSubmitComplaint"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── MODAL 2: COMPLAINT DETAILS ── */}
      <div
        className="survey-modal-backdrop"
        id="complaintDetailsModal"
        style={{ display: detailsOpen && detailsComplaint ? 'flex' : 'none' }}
        onClick={e => {
          if (e.target === e.currentTarget) setDetailsOpen(false);
        }}
      >
        <div className="survey-modal-box" style={{ maxWidth: 660 }}>
          <div
            className="survey-modal-header"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            <button
              type="button"
              className="survey-modal-close"
              id="closeDetailsBtn"
              onClick={() => setDetailsOpen(false)}
            >
              <i className="pi pi-times" />
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                className="cmp-ticket-pill"
                id="detTicketNum"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                {detailsComplaint?.ticketNumber}
              </span>
              <span
                className={`cmp-status-badge ${
                  detailsComplaint?.status === 'resolved'
                    ? 'status-resolved'
                    : detailsComplaint?.status === 'rejected'
                      ? 'status-rejected'
                      : 'status-pending'
                }`}
                id="detStatus"
              >
                {(detailsComplaint?.status || 'pending').toUpperCase()}
              </span>
              <span
                className={`cmp-priority-badge priority-${detailsComplaint?.priority || 'medium'}`}
                id="detPriority"
              >
                {(detailsComplaint?.priority || 'MEDIUM').toUpperCase()}
              </span>
            </div>
            <h2
              id="detSubject"
              style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3 }}
            >
              {detailsComplaint?.subject}
            </h2>
          </div>

          <div className="survey-modal-body" style={{ padding: '22px 24px' }}>
            {/* Applicant Details Grid */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                fontSize: '0.78rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Filed By:
                </span>
                <div
                  style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}
                  id="detApplicant"
                >
                  {detailsComplaint?.applicantName} (
                  {detailsComplaint?.applicantRole})
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Assigned Location:
                </span>
                <div
                  style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}
                  id="detLocation"
                >
                  {detailsComplaint?.assignedLocation || 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Category:
                </span>
                <div
                  style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}
                  id="detCategory"
                >
                  {detailsComplaint
                    ? getCategoryName(detailsComplaint.category)
                    : ''}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  Incident Date:
                </span>
                <div
                  style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}
                  id="detIncidentDate"
                >
                  {detailsComplaint
                    ? formatDate(
                        detailsComplaint.incidentDate ||
                          detailsComplaint.appliedAt
                      )
                    : ''}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Description &amp; Incident Notes
              </h4>
              <p
                id="detDescription"
                style={{
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  lineHeight: 1.6,
                  background: '#ffffff',
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {detailsComplaint?.description}
              </p>
            </div>

            {/* Review Section (if resolved or rejected) */}
            {detailsComplaint &&
              (detailsComplaint.reviewedBy || detailsComplaint.isEscalated) && (
                <div id="detReviewSection" style={{ marginTop: 18 }}>
                  <h4
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#059669',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Supervisory Resolution &amp; Remarks
                  </h4>
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: '#166534',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                      id="detReviewerInfo"
                    >
                      {detailsComplaint.reviewedBy
                        ? `${detailsComplaint.reviewedBy} (${detailsComplaint.reviewerRole || 'Supervisor'}) • ${formatDate(detailsComplaint.reviewedAt)}`
                        : `Forwarded to Program Coordinator (${detailsComplaint.forwardedBy || 'Supervisor'})`}
                    </div>
                    <p
                      id="detReviewerComment"
                      style={{
                        fontSize: '0.82rem',
                        color: '#14532d',
                        lineHeight: 1.5,
                      }}
                    >
                      {detailsComplaint.reviewedBy
                        ? detailsComplaint.reviewerComment ||
                          'No remarks provided.'
                        : detailsComplaint.forwardComment ||
                          'Escalated for higher administrative intervention.'}
                    </p>
                  </div>
                </div>
              )}
          </div>

          <div className="survey-modal-footer">
            <button
              type="button"
              className="btn-cs-secondary"
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL 3: REVIEW ACTION (Resolve / Reject / Forward) ── */}
      <div
        className="survey-modal-backdrop"
        id="reviewComplaintModal"
        style={{ display: reviewOpen && reviewComplaint ? 'flex' : 'none' }}
        onClick={e => {
          if (e.target === e.currentTarget) setReviewOpen(false);
        }}
      >
        <div className="survey-modal-box" style={{ maxWidth: 540 }}>
          <div
            className="survey-modal-header"
            style={{ background: '#0f172a' }}
          >
            <button
              type="button"
              className="survey-modal-close"
              id="closeReviewBtn"
              onClick={() => setReviewOpen(false)}
            >
              <i className="pi pi-times" />
            </button>
            <h2
              id="reviewActionTitle"
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            >
              {reviewMeta.title}
            </h2>
          </div>

          <div className="survey-modal-body" style={{ padding: '20px 24px' }}>
            <label className="cs-form-label">
              Review Remarks / Action Notes <span className="req">*</span>
            </label>
            <textarea
              id="reviewActionComment"
              className="cs-input"
              rows={4}
              placeholder={reviewMeta.placeholder}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
            />
          </div>

          <div className="survey-modal-footer">
            <button
              type="button"
              className="btn-cs-secondary"
              onClick={() => setReviewOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-file-complaint-main"
              id="btnSubmitReview"
              style={{
                borderRadius: 10,
                padding: '9px 20px',
                background: reviewMeta.bg,
              }}
              onClick={submitReview}
            >
              {reviewMeta.btn}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
