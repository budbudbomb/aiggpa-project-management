import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../shared/components/panels';
import {
  ActivityTaskStore,
  type ActivityTask,
  type Employee,
  type TaskStatus,
} from '../stores/activityTaskStore';
import projectStore from '../stores/projectStore';
import { useAuthStore } from '../auth/store/authStore';
import { useStoreData } from '../lib/storeEvents';
import TaskCard from './activities/TaskCard';
import CreateTaskModal from './activities/CreateTaskModal';
import TaskDetailsModal from './activities/TaskDetailsModal';
import RelationshipsModal from './activities/RelationshipsModal';
import { PageContainer, AppButton } from '../components';
import {
  Plus,
  Search,
  Kanban,
  List,
  RotateCcw,
  Users,
  CheckSquare,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export default function ActivitiesPage(): React.ReactElement {
  const version = useStoreData();
  const { user: authUser } = useAuthStore();

  // Active user strictly from the authenticated session
  const currentUser: Employee = useMemo(() => {
    void version;
    if (authUser?.id) {
      const match = ActivityTaskStore.getEmployeeById(authUser.id);
      if (match) return match;
    }
    return ActivityTaskStore.getActiveUser();
  }, [authUser, version]);

  // Modals state
  const [searchParams, setSearchParams] = useSearchParams();
  const [preselectedSurveyId, setPreselectedSurveyId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ActivityTask | null>(null);

  // Consume surveyId parameter when navigated from Survey Studio
  useEffect(() => {
    const surveyIdParam = searchParams.get('surveyId');
    if (surveyIdParam) {
      setPreselectedSurveyId(surveyIdParam);
      setIsCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // View mode: Kanban vs List
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Toast feedback notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    document.title = 'AIGGPA - Activities & Tasks';
  }, []);

  const employees = useMemo(() => {
    void version;
    return ActivityTaskStore.getEmployees();
  }, [version]);

  const projects = useMemo(() => {
    void version;
    return projectStore.getProjects();
  }, [version]);

  const reviewQueueCount = useMemo(() => {
    void version;
    return ActivityTaskStore.getAwaitingMyReview(currentUser).length;
  }, [currentUser, version]);

  // Visible tasks filtered by current user's role and reporting hierarchy
  const visibleTasks = useMemo(() => {
    void version;
    return ActivityTaskStore.getVisibleTasksForUser(currentUser);
  }, [currentUser, version]);

  // Filtered tasks by search and filter bar
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter(task => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        const matchesProject = task.projectName.toLowerCase().includes(q);
        const matchesAssignee = task.assigneeName.toLowerCase().includes(q);
        const matchesCreator = task.creatorName.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesId &&
          !matchesProject &&
          !matchesAssignee &&
          !matchesCreator
        ) {
          return false;
        }
      }

      // 2. Project
      if (selectedProject && task.projectId !== selectedProject) {
        return false;
      }

      // 3. Assignee
      if (selectedAssignee && task.assigneeId !== selectedAssignee) {
        return false;
      }

      // 4. Creator
      if (selectedCreator && task.creatorId !== selectedCreator) {
        return false;
      }

      // 5. Priority
      if (selectedPriority && task.priority !== selectedPriority) {
        return false;
      }

      // 6. Status
      if (selectedStatus && task.status !== selectedStatus) {
        return false;
      }

      // 7. Date Filter
      if (selectedDateFilter) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDateFilter === 'overdue') {
          if (
            task.status === 'Completed' ||
            !task.dueDate ||
            task.dueDate >= todayStr
          ) {
            return false;
          }
        } else if (selectedDateFilter === 'today') {
          if (task.dueDate !== todayStr) return false;
        } else if (selectedDateFilter === 'week') {
          const sevenDaysLater = new Date(Date.now() + 7 * 86400000)
            .toISOString()
            .split('T')[0];
          if (
            !task.dueDate ||
            task.dueDate < todayStr ||
            task.dueDate > sevenDaysLater
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    visibleTasks,
    searchQuery,
    selectedProject,
    selectedAssignee,
    selectedCreator,
    selectedPriority,
    selectedStatus,
    selectedDateFilter,
  ]);

  // KPI counts computed from visible tasks
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = visibleTasks.length;
    const todo = visibleTasks.filter(t => t.status === 'To Do').length;
    const inProgress = visibleTasks.filter(
      t => t.status === 'In Progress'
    ).length;
    const inReview = visibleTasks.filter(t => t.status === 'In Review').length;
    const changesRequested = visibleTasks.filter(
      t => t.status === 'Changes Requested'
    ).length;
    const completed = visibleTasks.filter(t => t.status === 'Completed').length;
    const overdue = visibleTasks.filter(
      t => t.status !== 'Completed' && t.dueDate && t.dueDate < today
    ).length;

    return {
      total,
      todo,
      inProgress,
      inReview,
      changesRequested,
      completed,
      overdue,
    };
  }, [visibleTasks]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProject('');
    setSelectedAssignee('');
    setSelectedCreator('');
    setSelectedPriority('');
    setSelectedStatus('');
    setSelectedDateFilter('');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedProject ||
    selectedAssignee ||
    selectedCreator ||
    selectedPriority ||
    selectedStatus ||
    selectedDateFilter
  );

  // Drag and Drop handlers
  const handleDragStart = (_e: React.DragEvent, task: ActivityTask) => {
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTaskId) return;

    const res = ActivityTaskStore.transitionStatus(
      draggedTaskId,
      targetStatus,
      currentUser
    );
    showToast(res.message);
    setDraggedTaskId(null);
  };

  const handleCardStatusChange = (
    task: ActivityTask,
    newStatus: TaskStatus
  ) => {
    const res = ActivityTaskStore.transitionStatus(
      task.id,
      newStatus,
      currentUser
    );
    showToast(res.message);
  };

  // 5-Column Kanban structure
  const kanbanColumns: Array<{
    status: TaskStatus;
    title: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
  }> = [
    {
      status: 'To Do',
      title: 'To Do',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-700',
    },
    {
      status: 'In Progress',
      title: 'In Progress',
      dotColor: 'bg-blue-500',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
    },
    {
      status: 'In Review',
      title: 'In Review',
      dotColor: 'bg-indigo-500',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-700',
    },
    {
      status: 'Changes Requested',
      title: 'Needs Revision',
      dotColor: 'bg-rose-500',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
    },
    {
      status: 'Completed',
      title: 'Completed',
      dotColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
    },
  ];

  const canCreate = ActivityTaskStore.canCreateTasks(currentUser.role);
  const supervisor = currentUser.reportsTo
    ? ActivityTaskStore.getEmployeeById(currentUser.reportsTo)
    : null;

  return (
    <PageContainer>
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Activities & Tasks"
        subtitle="Manage hierarchy-governed task assignments, review gates, and field deliverables"
        breadcrumbs={[
          { label: 'Project Governance' },
          { label: 'Activities & Tasks' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {currentUser.role !== 'Intern' && (
              <AppButton
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-3.5 h-3.5 text-blue-600" />}
                onClick={() => setIsRelationshipsOpen(true)}
                title="View and configure organizational reporting hierarchy"
              >
                Org Hierarchy
              </AppButton>
            )}

            {canCreate ? (
              <AppButton
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setPreselectedSurveyId(null);
                  setIsCreateOpen(true);
                }}
              >
                Create Task
              </AppButton>
            ) : (
              <div
                title="Interns can view and execute assigned tasks, but cannot assign new tasks."
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Execution Mode (Creation Restricted)</span>
              </div>
            )}
          </div>
        }
      />

      {/* ── Active Session Context Banner ── */}
      <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
            style={{ backgroundColor: currentUser.avatarColor || '#1d4ed8' }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {currentUser.role}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {currentUser.designation} • {currentUser.department}
              {supervisor && (
                <span className="ml-2 text-slate-600 font-medium">
                  (Reports to: {supervisor.name} — {supervisor.role})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informative Perspective Scope Hint */}
        <div className="text-right text-[11px] text-slate-500 hidden sm:block">
          {currentUser.role === 'Center Head' &&
            'Scope: Full Center Governance • All 17 Personnel'}
          {currentUser.role === 'Project Manager' &&
            'Scope: Digital Infrastructure Projects & Subordinate Fellows'}
          {currentUser.role === 'Research Analyst' &&
            'Scope: Quantitative Research Stream & Subordinate Fellows'}
          {currentUser.role === 'Fellow' &&
            'Scope: Assigned Policy Studies & Assigned Interns'}
          {currentUser.role === 'Intern' &&
            'Scope: Personal Assigned Field Tasks Only'}
        </div>
      </div>

      {/* ── Review Urgent Alert Callout Banner ── */}
      {reviewQueueCount > 0 && currentUser.role !== 'Intern' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Action Required:</strong> You have{' '}
              <strong>{reviewQueueCount} task(s)</strong> awaiting your formal
              review and approval.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStatus('In Review')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            Filter In Review ({reviewQueueCount})
          </button>
        </div>
      )}

      {/* ── Summary KPI Metric Cards (7 Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Tasks
          </div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">
            {kpis.total}
          </div>
          <div className="text-[10px] text-slate-400">Visible to role</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            To Do
          </div>
          <div className="text-lg font-bold text-slate-700 mt-0.5">
            {kpis.todo}
          </div>
          <div className="text-[10px] text-slate-400">Queued for work</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-lg font-bold text-blue-600 mt-0.5">
            {kpis.inProgress}
          </div>
          <div className="text-[10px] text-slate-400">Work in flight</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            In Review
          </div>
          <div className="text-lg font-bold text-indigo-600 mt-0.5">
            {kpis.inReview}
          </div>
          <div className="text-[10px] text-indigo-700/80">
            Awaiting approval
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Needs Revision
          </div>
          <div className="text-lg font-bold text-rose-600 mt-0.5">
            {kpis.changesRequested}
          </div>
          <div className="text-[10px] text-rose-700/80">Changes requested</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">
            {kpis.completed}
          </div>
          <div className="text-[10px] text-emerald-700/80">Closed & signed</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Overdue
          </div>
          <div className="text-lg font-bold text-rose-600 mt-0.5">
            {kpis.overdue}
          </div>
          <div className="text-[10px] text-rose-700/80">Past due date</div>
        </div>
      </div>

      {/* ── Search, View Switcher & Filter Controls Bar ── */}
      <div className="mt-3 bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2.5">
        {/* Intern Quick-Filter Tabs */}
        {currentUser.role === 'Intern' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Execution Views:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('');
                setSelectedDateFilter('');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                !selectedStatus && !selectedDateFilter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All My Tasks ({kpis.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('In Progress');
                setSelectedDateFilter('');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'In Progress'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              In Progress ({kpis.inProgress})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('Changes Requested');
                setSelectedDateFilter('');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'Changes Requested'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Changes Requested ({kpis.changesRequested})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('In Review');
                setSelectedDateFilter('');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'In Review'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Under Review ({kpis.inReview})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('Completed');
                setSelectedDateFilter('');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Completed ({kpis.completed})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('');
                setSelectedDateFilter('overdue');
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedDateFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50/50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Overdue ({kpis.overdue})
            </button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by task title, assignee, or ID (e.g. TSK-01)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* View switcher: Kanban vs List */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div
          className={`grid gap-2 pt-2 border-t border-slate-100 ${
            currentUser.role === 'Intern'
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
          }`}
        >
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name.substring(0, 30)}...
              </option>
            ))}
          </select>

          {currentUser.role !== 'Intern' && (
            <>
              <select
                value={selectedAssignee}
                onChange={e => setSelectedAssignee(e.target.value)}
                className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="">All Assignees</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>

              <select
                value={selectedCreator}
                onChange={e => setSelectedCreator(e.target.value)}
                className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="">All Creators</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>
            </>
          )}

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={selectedDateFilter}
            onChange={e => setSelectedDateFilter(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="">All Due Dates</option>
            <option value="overdue">Overdue Only</option>
            <option value="today">Due Today</option>
            <option value="week">Due This Week</option>
          </select>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 1: 5-COLUMN KANBAN BOARD
      ══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mt-4 items-start">
          {kanbanColumns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            const isOver = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={e => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.status)}
                className={`bg-slate-100/70 rounded-2xl p-3 border transition-all min-h-[500px] flex flex-col ${
                  isOver
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}
                    />
                    <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
                      {col.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-3">
                      <span className="text-[11px] text-slate-400">
                        Drop tasks here to mark as {col.title}
                      </span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUser={currentUser}
                        onOpenDetails={t => setSelectedTask(t)}
                        onStatusChange={handleCardStatusChange}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 2: LIST / TABLE VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No matching tasks found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting filters or author a new task.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-24">Task ID</th>
                    <th className="py-3 px-4">Title &amp; Project</th>
                    <th className="py-3 px-4 w-40">Assignee</th>
                    <th className="py-3 px-4 w-36">Creator</th>
                    <th className="py-3 px-4 w-28">Priority</th>
                    <th className="py-3 px-4 w-32">Due Date</th>
                    <th className="py-3 px-4 w-36">Status</th>
                    <th className="py-3 px-4 w-28">Checklist</th>
                    <th className="py-3 px-4 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map(t => {
                    const isOverdue =
                      t.status !== 'Completed' &&
                      t.dueDate &&
                      new Date(t.dueDate) <
                        new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className="hover:bg-slate-50/70 cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-blue-600">
                          {t.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 line-clamp-1">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {t.projectName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">
                            {t.assigneeName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t.assigneeRole}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">
                            {t.creatorName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t.creatorRole}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-700'
                                : t.priority === 'High'
                                  ? 'bg-amber-50 text-amber-700'
                                  : t.priority === 'Medium'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-600'
                            }
                          >
                            {isOverdue && '⚠️ '}
                            {t.dueDate}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'In Review'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : t.status === 'Changes Requested'
                                    ? 'bg-rose-100 text-rose-800'
                                    : t.status === 'In Progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {t.checklist.filter(c => c.completed).length}/
                              {t.checklist.length}
                            </span>
                            {t.checklist.some(c => c.type === 'meeting') && (
                              <span
                                className="px-1 py-0.2 bg-blue-50 text-blue-700 rounded text-[9px] font-bold border border-blue-200/60"
                                title="Contains meeting subtasks"
                              >
                                📅
                              </span>
                            )}
                            {t.checklist.some(c => c.type === 'survey') && (
                              <span
                                className="px-1 py-0.2 bg-amber-50 text-amber-800 rounded text-[9px] font-bold border border-amber-200/60"
                                title="Contains survey subtasks"
                              >
                                📋
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {canCreate && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setPreselectedSurveyId(null);
          }}
          currentUser={currentUser}
          preselectedSurveyId={preselectedSurveyId}
          onTaskCreated={taskId => {
            showToast(`Task ${taskId} created successfully.`);
            setPreselectedSurveyId(null);
          }}
          onOpenRelationshipsModal={() => {
            setIsCreateOpen(false);
            setIsRelationshipsOpen(true);
          }}
        />
      )}

      <TaskDetailsModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        currentUser={currentUser}
        onTaskUpdated={() => {
          if (selectedTask) {
            const fresh = ActivityTaskStore.getTaskById(selectedTask.id);
            if (fresh) setSelectedTask(fresh);
          }
        }}
      />

      <RelationshipsModal
        isOpen={isRelationshipsOpen}
        onClose={() => setIsRelationshipsOpen(false)}
        currentUser={currentUser}
      />
    </PageContainer>
  );
}
