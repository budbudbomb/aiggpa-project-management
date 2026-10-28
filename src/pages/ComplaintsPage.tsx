import { useState, useMemo } from 'react';
import {
  Plus,
  MagnifyingGlass,
  ShieldWarning,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChatCircleDots,
  BuildingOffice,
  Calendar,
  Hourglass,
  ArrowBendUpRight,
} from '@phosphor-icons/react';
import { useAuthStore } from '../auth/store/authStore';
import { useStoreData } from '../lib/storeEvents';
import ComplaintStore from '../stores/complaintStore';
import type { Complaint } from '../stores/types';
import {
  complaintCategoryLabel,
  complaintStatusLabel,
  complaintStatusColor,
  roleLabel,
  formatDate,
  timeAgo,
  cn,
} from '../lib/utils/formatters';
import {
  AddComplaintModal,
  ComplaintDetailsModal,
  ReviewComplaintModal,
} from '../components/complaints';

export default function ComplaintsPage(): React.ReactElement {
  const version = useStoreData();
  const { user } = useAuthStore();

  const isCenterHead = useMemo(() => {
    const r = user?.role || '';
    return r === 'Center Head' || r === 'Super Admin';
  }, [user?.role]);

  const isAdvisor = useMemo(() => {
    return user?.role === 'Advisor';
  }, [user?.role]);

  const isSenior = isCenterHead || isAdvisor;
  const isTier3 = !isSenior;

  // Tab definitions
  type TabKey =
    | 'my_complaints'
    | 'pending_advisor'
    | 'action_items'
    | 'escalated_to_center_head'
    | 'resolved_closed'
    | 'all_grievances';

  const defaultTab = useMemo<TabKey>(() => {
    if (isCenterHead) return 'action_items';
    if (isAdvisor) return 'pending_advisor';
    return 'my_complaints';
  }, [isCenterHead, isAdvisor]);

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'escalated' | 'resolved' | 'rejected'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [reviewActionData, setReviewActionData] = useState<{
    complaint: Complaint | null;
    action: 'resolve' | 'reject' | 'forward' | null;
  }>({ complaint: null, action: null });

  // All complaints from store
  const allComplaints = useMemo<Complaint[]>(() => {
    void version;
    return ComplaintStore.getAll();
  }, [version]);

  // Active tab complaints
  const tabComplaints = useMemo<Complaint[]>(() => {
    if (isTier3 || activeTab === 'my_complaints') {
      return allComplaints.filter(
        c =>
          c.applicantId === user?.id ||
          (user?.name &&
            c.applicantName?.toLowerCase().includes(user.name.toLowerCase())) ||
          c.applicantRole?.toLowerCase() === user?.role?.toLowerCase()
      );
    }

    if (activeTab === 'pending_advisor') {
      return allComplaints.filter(c => c.status === 'pending');
    }

    if (activeTab === 'action_items') {
      return allComplaints.filter(
        c => c.status === 'pending' || c.status === 'escalated'
      );
    }

    if (activeTab === 'escalated_to_center_head') {
      return allComplaints.filter(
        c => c.status === 'escalated' || c.isEscalated
      );
    }

    if (activeTab === 'resolved_closed') {
      return allComplaints.filter(
        c => c.status === 'resolved' || c.status === 'rejected'
      );
    }

    if (activeTab === 'all_grievances') {
      return allComplaints;
    }

    return allComplaints;
  }, [activeTab, allComplaints, isTier3, user?.id, user?.name, user?.role]);

  // Filtered complaints
  const filteredComplaints = useMemo<Complaint[]>(() => {
    return tabComplaints.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTicket = c.ticketNumber.toLowerCase().includes(q);
        const inSubject = c.subject.toLowerCase().includes(q);
        const inApplicant = c.applicantName.toLowerCase().includes(q);
        const inDesc = c.description?.toLowerCase().includes(q) ?? false;
        if (!inTicket && !inSubject && !inApplicant && !inDesc) return false;
      }
      return true;
    });
  }, [tabComplaints, statusFilter, categoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const relevant = isTier3
      ? allComplaints.filter(
          c =>
            c.applicantId === user?.id ||
            (user?.name &&
              c.applicantName
                ?.toLowerCase()
                .includes(user.name.toLowerCase())) ||
            c.applicantRole?.toLowerCase() === user?.role?.toLowerCase()
        )
      : allComplaints;

    return {
      total: relevant.length,
      pending: relevant.filter(c => c.status === 'pending').length,
      escalated: relevant.filter(c => c.status === 'escalated' || c.isEscalated)
        .length,
      resolved: relevant.filter(c => c.status === 'resolved').length,
      rejected: relevant.filter(c => c.status === 'rejected').length,
    };
  }, [allComplaints, isTier3, user?.id, user?.name, user?.role]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <ShieldWarning size={26} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
                Grievance Redressal Desk
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {user?.role || 'User'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5">
              {isCenterHead &&
                'Top-Level Governance: Final review & resolution on grievances and advisor escalations.'}
              {isAdvisor &&
                'Advisory Management: Review grievances, resolve issues, or move to Center Head.'}
              {isTier3 &&
                'Execution Tier: File grievances & monitor review decisions from Advisor and Center Head.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Lodge New Grievance</span>
          </button>
        </div>
      </div>

      {isAdvisor && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <ShieldWarning size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Advisor Action Desk:</span>
            <p className="m-0 leading-relaxed text-amber-900">
              You have the authority to review and resolve grievances. If an
              issue requires institutional budget, policy approval, or cannot be
              resolved at your level, click{' '}
              <strong>&ldquo;Move to Center Head&rdquo;</strong> to escalate it
              immediately.
            </p>
          </div>
        </div>
      )}
      {/* Role-Aware Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-px overflow-x-auto">
        {/* Tier 3: My Grievances */}
        {isTier3 && (
          <button
            type="button"
            onClick={() => setActiveTab('my_complaints')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
              activeTab === 'my_complaints'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            )}
          >
            <ChatCircleDots
              size={18}
              weight={activeTab === 'my_complaints' ? 'fill' : 'regular'}
            />
            <span>My Grievances</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-bold',
                activeTab === 'my_complaints'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-200/70 text-slate-600'
              )}
            >
              {stats.total}
            </span>
          </button>
        )}

        {/* Advisor Tabs */}
        {isAdvisor && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('pending_advisor')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'pending_advisor'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <Hourglass
                size={18}
                weight={activeTab === 'pending_advisor' ? 'fill' : 'regular'}
              />
              <span>Pending Review</span>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('escalated_to_center_head')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'escalated_to_center_head'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <ArrowBendUpRight
                size={18}
                weight={
                  activeTab === 'escalated_to_center_head' ? 'bold' : 'regular'
                }
              />
              <span>Moved to Center Head</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                {stats.escalated}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resolved_closed')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'resolved_closed'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <CheckCircle
                size={18}
                weight={activeTab === 'resolved_closed' ? 'fill' : 'regular'}
              />
              <span>Resolved &amp; Closed</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all_grievances')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'all_grievances'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <BuildingOffice
                size={18}
                weight={activeTab === 'all_grievances' ? 'fill' : 'regular'}
              />
              <span>All Grievances</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/70 text-slate-600">
                {allComplaints.length}
              </span>
            </button>
          </>
        )}

        {/* Center Head Tabs */}
        {isCenterHead && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('action_items')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'action_items'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <Hourglass
                size={18}
                weight={activeTab === 'action_items' ? 'fill' : 'regular'}
              />
              <span>Action Items</span>
              {stats.pending + stats.escalated > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {stats.pending + stats.escalated}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('escalated_to_center_head')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'escalated_to_center_head'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <ArrowBendUpRight
                size={18}
                weight={
                  activeTab === 'escalated_to_center_head' ? 'bold' : 'regular'
                }
              />
              <span>⚡ Escalated by Advisors</span>
              {stats.escalated > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                  {stats.escalated} Urgent
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resolved_closed')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'resolved_closed'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <CheckCircle
                size={18}
                weight={activeTab === 'resolved_closed' ? 'fill' : 'regular'}
              />
              <span>Resolved &amp; Closed</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all_grievances')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2',
                activeTab === 'all_grievances'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              <BuildingOffice
                size={18}
                weight={activeTab === 'all_grievances' ? 'fill' : 'regular'}
              />
              <span>All State Grievances</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/70 text-slate-600">
                {allComplaints.length}
              </span>
            </button>
          </>
        )}
      </div>
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isTier3 ? 'My Filed Grievances' : 'Total Grievances'}</span>
            <Clock size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Review</span>
            <Hourglass size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
            <span>Moved to Center Head</span>
            <ArrowBendUpRight size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stats.escalated}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Resolved</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {stats.resolved}
          </p>
        </div>
      </div>
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ticket, subject, applicant or details..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 shrink-0 hidden sm:inline">
              Category:
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="field_travel">Field &amp; Travel Logistics</option>
              <option value="infrastructure">Device, SIM &amp; Portal</option>
              <option value="workload_tasks">Workload &amp; Assignments</option>
              <option value="stipend">Stipend &amp; Allowances</option>
              <option value="interpersonal">Interpersonal Grievance</option>
              <option value="other">Other Inquiry / Issue</option>
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            Status:
          </span>
          {(
            ['all', 'pending', 'escalated', 'resolved', 'rejected'] as const
          ).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer',
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              )}
            >
              {st === 'escalated' ? 'Moved to Center Head' : st}
            </button>
          ))}
        </div>
      </div>
      {/* Grievances List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShieldWarning size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 m-0">
            No Grievances Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto m-0">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No grievances matched your active filters.'
              : isTier3
                ? 'You have not submitted any grievances yet. Click below to lodge one.'
                : 'No grievances recorded in this view.'}
          </p>
          {isTier3 && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Lodge New Grievance</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredComplaints.map(c => {
            const isEsc = c.status === 'escalated' || c.isEscalated;
            const lastEsc =
              c.escalations && c.escalations.length > 0
                ? c.escalations[c.escalations.length - 1]
                : null;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {c.ticketNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${complaintStatusColor(
                        c.status
                      )}`}
                    >
                      {c.status === 'pending' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      )}
                      {complaintStatusLabel(c.status)}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200">
                      {complaintCategoryLabel(c.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={13} />
                    <span>{formatDate(c.appliedAt)}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span>{timeAgo(c.appliedAt)}</span>
                  </div>
                </div>

                {/* Subject & Description */}
                <div>
                  <h3
                    onClick={() => setSelectedComplaint(c)}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug m-0"
                  >
                    {c.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed m-0">
                    {c.description}
                  </p>
                </div>

                {/* Escalation Callout */}
                {isEsc && (
                  <div className="p-2.5 px-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ArrowBendUpRight
                        size={14}
                        weight="bold"
                        className="text-blue-700 shrink-0"
                      />
                      <span className="font-semibold text-blue-900">
                        Moved to Center Head by{' '}
                        {lastEsc?.forwardedBy || c.forwardedBy || 'Advisor'}:
                      </span>
                      <span className="italic text-blue-800 truncate max-w-xs sm:max-w-md">
                        &ldquo;
                        {lastEsc?.reason ||
                          c.forwardComment ||
                          'Unable to resolve at advisor level.'}
                        &rdquo;
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-200/70 px-2 py-0.5 rounded-full shrink-0">
                      Center Head Review
                    </span>
                  </div>
                )}

                {/* Review Feedback Response (Visible to Tier 3 and everyone) */}
                {c.status === 'resolved' && (
                  <div className="p-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                    <CheckCircle
                      size={15}
                      weight="fill"
                      className="text-emerald-600 shrink-0"
                    />
                    <span className="font-semibold">
                      Resolved by {c.reviewedBy} ({c.reviewerRole}):
                    </span>
                    <span className="text-emerald-800 italic truncate">
                      &ldquo;{c.reviewerComment}&rdquo;
                    </span>
                  </div>
                )}

                {c.status === 'rejected' && (
                  <div className="p-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-center gap-2">
                    <XCircle
                      size={15}
                      weight="fill"
                      className="text-rose-600 shrink-0"
                    />
                    <span className="font-semibold">
                      Rejected by {c.reviewedBy} ({c.reviewerRole}):
                    </span>
                    <span className="text-rose-800 italic truncate">
                      &ldquo;{c.reviewerComment}&rdquo;
                    </span>
                  </div>
                )}

                {/* Bottom Row: Applicant & Review Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="font-semibold">{c.applicantName}</span>
                    <span className="text-slate-400">
                      ({roleLabel(c.applicantRole)})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      Date: {c.incidentDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Advisor Actions on Pending */}
                    {isAdvisor && c.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setReviewActionData({
                              complaint: c,
                              action: 'forward',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          title="Move to Center Head if unable to resolve"
                        >
                          <ArrowBendUpRight size={13} weight="bold" />
                          <span>Move to Center Head</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReviewActionData({
                              complaint: c,
                              action: 'reject',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle size={13} weight="bold" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReviewActionData({
                              complaint: c,
                              action: 'resolve',
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <CheckCircle size={13} weight="bold" />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}

                    {/* Center Head Actions on Pending or Escalated */}
                    {isCenterHead &&
                      (c.status === 'pending' || c.status === 'escalated') && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setReviewActionData({
                                complaint: c,
                                action: 'reject',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle size={13} weight="bold" />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReviewActionData({
                                complaint: c,
                                action: 'resolve',
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <CheckCircle size={13} weight="bold" />
                            <span>Resolve</span>
                          </button>
                        </>
                      )}

                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(c)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    >
                      <Eye size={13} weight="bold" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Add Complaint Modal */}
      <AddComplaintModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
        }}
        recipientLabel={isAdvisor ? 'Center Head' : 'Advisor & Center Head'}
      />
      {/* Details Modal */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        canReview={isSenior}
        onOpenReview={(c, action) => {
          setReviewActionData({ complaint: c, action });
        }}
      />
      {/* Review & Resolution Modal */}
      <ReviewComplaintModal
        complaint={reviewActionData.complaint}
        action={reviewActionData.action}
        reviewerRole={user?.role}
        onClose={() => setReviewActionData({ complaint: null, action: null })}
        onSuccess={() => {
          setReviewActionData({ complaint: null, action: null });
        }}
      />
    </div>
  );
}
