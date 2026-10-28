import React, { useState, useRef, useEffect } from 'react';
import type {
  ActivityTask,
  Employee,
  TaskStatus,
} from '../../stores/activityTaskStore';
import {
  Calendar,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  Clock,
  MoreVertical,
  PlayCircle,
  CheckCircle2,
  RotateCcw,
  GripVertical,
  FolderKanban,
  FileText,
  AlertTriangle,
  Flame,
  ArrowDown,
  ExternalLink,
  Users,
} from 'lucide-react';

interface TaskCardProps {
  task: ActivityTask;
  currentUser?: Employee;
  onOpenDetails: (task: ActivityTask) => void;
  onStatusChange: (task: ActivityTask, newStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, task: ActivityTask) => void;
  onOpenReadReceipts?: (task: ActivityTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onOpenDetails,
  onStatusChange,
  onDragStart,
  onOpenReadReceipts,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isOverdue =
    task.status !== 'Completed' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isDueToday =
    task.status !== 'Completed' &&
    task.dueDate &&
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  // Priority metadata
  const priorityConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    Critical: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <Flame className="w-3 h-3 text-rose-600" />,
    },
    High: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
    },
    Medium: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Clock className="w-3 h-3 text-blue-600" />,
    },
    Low: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <ArrowDown className="w-3 h-3 text-slate-500" />,
    },
  };

  const pConfig = priorityConfig[task.priority] || priorityConfig.Medium;

  // Permissions logic
  const isIntern = currentUser?.role === 'Intern';
  const isReviewer = Boolean(
    currentUser &&
    (currentUser.id === task.reviewerId ||
      currentUser.role === 'Advisor' ||
      currentUser.role === 'Center Head')
  );

  // Next quick-advance configuration
  const getQuickAction = () => {
    switch (task.status) {
      case 'To Do':
        return {
          label: 'Start Task',
          icon: <PlayCircle className="w-3 h-3" />,
          target: 'In Progress' as TaskStatus,
          className:
            'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
        };
      case 'In Progress':
        if (task.requiresReview) {
          return {
            label: 'Submit for Review',
            icon: <ShieldCheck className="w-3 h-3" />,
            target: 'In Review' as TaskStatus,
            className:
              'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
          };
        }
        return {
          label: 'Complete Task',
          icon: <CheckCircle2 className="w-3 h-3" />,
          target: 'Completed' as TaskStatus,
          className:
            'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
          disabled: isIntern,
          disabledTip: 'Interns cannot mark complete without supervisor review',
        };
      case 'In Review':
        if (isReviewer) {
          return {
            label: 'Approve & Complete',
            icon: <CheckCircle2 className="w-3 h-3" />,
            target: 'Completed' as TaskStatus,
            className:
              'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-2xs',
          };
        }
        return null;
      case 'Changes Requested':
        return {
          label: 'Start Revisions',
          icon: <RotateCcw className="w-3 h-3" />,
          target: 'In Progress' as TaskStatus,
          className:
            'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200',
        };
      default:
        return null;
    }
  };

  const quickAction = getQuickAction();

  // All 5 statuses for dropdown with permission checks
  const statusOptions: Array<{
    status: TaskStatus;
    label: string;
    allowed: boolean;
    reason?: string;
  }> = [
    { status: 'To Do', label: 'To Do', allowed: true },
    { status: 'In Progress', label: 'In Progress', allowed: true },
    {
      status: 'In Review',
      label: 'In Review',
      allowed: true,
      reason:
        isIntern && task.evidenceRequirements?.length > 0
          ? 'Requires evidence attachment'
          : undefined,
    },
    {
      status: 'Changes Requested',
      label: 'Needs Revision',
      allowed: !isIntern,
      reason: isIntern ? 'Only reviewers can request changes' : undefined,
    },
    {
      status: 'Completed',
      label: 'Completed',
      allowed: !isIntern && (!task.requiresReview || isReviewer),
      reason: isIntern
        ? 'Interns cannot close tasks'
        : task.requiresReview && !isReviewer
          ? 'Only designated reviewer can approve'
          : undefined,
    },
  ];

  return (
    <div
      draggable
      onDragStart={e => {
        setIsDragging(true);
        onDragStart(e, task);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onOpenDetails(task)}
      className={`group relative bg-white rounded-xl border p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing select-none flex flex-col gap-2.5 ${
        isDragging
          ? 'opacity-40 scale-95 ring-2 ring-blue-500 shadow-2xl border-blue-400 bg-blue-50/20'
          : 'border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-0.5'
      }`}
    >
      {/* ── Top Header Row: Grip, ID, Priority, Quick Menu ── */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {/* Subtle drag grip handle */}
          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />

          {/* Task ID Pill */}
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/70 shrink-0">
            {task.id}
          </span>

          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${pConfig.bg} ${pConfig.text} ${pConfig.border} shrink-0`}
          >
            {pConfig.icon}
            <span>{task.priority}</span>
          </span>

          {/* Special status highlight badges */}
          {task.status === 'Changes Requested' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>Needs Revision</span>
            </span>
          )}

          {task.status === 'In Review' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>In Review</span>
            </span>
          )}
        </div>

        {/* ── More Actions Dropdown Menu ── */}
        <div
          ref={menuRef}
          onClick={e => e.stopPropagation()}
          className="relative shrink-0"
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Task options"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-7 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Move Task To
              </div>

              {statusOptions.map(opt => (
                <button
                  key={opt.status}
                  type="button"
                  disabled={!opt.allowed || opt.status === task.status}
                  onClick={() => {
                    onStatusChange(task, opt.status);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center justify-between transition-colors ${
                    opt.status === task.status
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : !opt.allowed
                        ? 'opacity-40 text-slate-400 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                  title={opt.reason}
                >
                  <span>{opt.label}</span>
                  {opt.status === task.status && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenDetails(task);
                }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>Open Task Details</span>
              </button>

              {onOpenReadReceipts && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenReadReceipts(task);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>View Read Receipts</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Task Title & Project Name ── */}
      <div>
        <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>
        <div className="text-[11px] font-medium text-slate-500 mt-1 truncate flex items-center gap-1.5">
          <FolderKanban className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{task.projectName}</span>
        </div>
      </div>

      {/* ── Reviewer Feedback Banner (If Changes Requested) ── */}
      {task.status === 'Changes Requested' && task.reviewFeedback && (
        <div className="p-2.5 bg-rose-50/90 border border-rose-200/90 rounded-lg text-[11px] text-rose-900 leading-relaxed space-y-1">
          <div className="flex items-center gap-1 font-bold text-rose-800 text-[10px] uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Revision Feedback:</span>
          </div>
          <p className="line-clamp-2 italic text-rose-800">
            &ldquo;{task.reviewFeedback}&rdquo;
          </p>
        </div>
      )}

      {/* ── Badges Row: Review Gate, Evidence Req, Attachments, Survey ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {task.surveyId && (
          <span
            title="Field survey questionnaire linked to this task"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <FileText className="w-3 h-3 text-emerald-600" />
            <span>Field Survey</span>
          </span>
        )}

        {task.requiresReview && task.status !== 'Changes Requested' && (
          <span
            title={`Reviewed by: ${task.reviewerName || 'Supervisor'}`}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>Review Gate</span>
          </span>
        )}

        {task.evidenceRequirements && task.evidenceRequirements.length > 0 && (
          <span
            title={`${task.evidenceRequirements.length} evidence requirements configured`}
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
          >
            <Paperclip className="w-3 h-3 text-slate-500" />
            <span>
              {task.evidenceRequirements.length} Req
              {task.evidenceRequirements.length > 1 ? 's' : ''}
            </span>
          </span>
        )}

        {task.attachments.length > 0 && (
          <span
            title={`${task.attachments.length} attachment(s)`}
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded"
          >
            <Paperclip className="w-3 h-3" />
            <span>{task.attachments.length}</span>
          </span>
        )}

        {task.labels.slice(0, 2).map((label, idx) => (
          <span
            key={idx}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200/60"
          >
            #{label}
          </span>
        ))}
      </div>

      {/* ── Quick Advance One-Click Button (Flow Accelerator) ── */}
      {quickAction && (
        <div
          onClick={e => e.stopPropagation()}
          className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2"
        >
          <span className="text-[10px] font-medium text-slate-400">
            Quick Stage:
          </span>
          <button
            type="button"
            disabled={quickAction.disabled}
            onClick={() => onStatusChange(task, quickAction.target)}
            title={quickAction.disabledTip}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
              quickAction.disabled
                ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                : quickAction.className
            }`}
          >
            {quickAction.icon}
            <span>{quickAction.label}</span>
          </button>
        </div>
      )}

      {/* ── Bottom Row: Assignee Info & Due Date ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {/* Assignee Avatar & Name */}
        <div
          onClick={e => {
            if (onOpenReadReceipts) {
              e.stopPropagation();
              onOpenReadReceipts(task);
            }
          }}
          className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          title={`Assignee: ${task.assigneeName} (${task.assigneeRole}) — Click to view read receipts`}
        >
          <div
            className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-2xs ring-1 ring-white"
            style={{
              backgroundColor:
                task.assigneeRole === 'Intern'
                  ? '#475569'
                  : task.assigneeRole === 'Fellow'
                    ? '#0284c7'
                    : '#1d4ed8',
            }}
          >
            {task.assigneeName.charAt(0)}
          </div>
          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[105px]">
            {task.assigneeName}
          </span>
        </div>

        {/* Due Date Indicator with Overdue & Due Today Accents */}
        <div className="flex items-center gap-1 shrink-0">
          <Calendar
            className={`w-3 h-3 ${
              isOverdue
                ? 'text-rose-600'
                : isDueToday
                  ? 'text-amber-600'
                  : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOverdue
                ? 'text-rose-700 bg-rose-50 border border-rose-200'
                : isDueToday
                  ? 'text-amber-800 bg-amber-50 border border-amber-200'
                  : 'text-slate-500'
            }`}
          >
            {isOverdue ? 'Overdue' : isDueToday ? 'Today' : task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
