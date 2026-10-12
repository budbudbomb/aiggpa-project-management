import React from 'react';
import type {
  ActivityTask,
  Employee,
  TaskStatus,
} from '../../stores/activityTaskStore';
import {
  Calendar,
  CheckSquare,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface TaskCardProps {
  task: ActivityTask;
  currentUser?: Employee;
  onOpenDetails: (task: ActivityTask) => void;
  onStatusChange: (task: ActivityTask, newStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, task: ActivityTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onOpenDetails,
  onStatusChange,
  onDragStart,
}) => {
  const isOverdue =
    task.status !== 'Completed' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const totalChecklist = task.checklist.length;
  const completedChecklist = task.checklist.filter(c => c.completed).length;

  const priorityStyles: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Critical: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    High: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    Medium: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    Low: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
    },
  };

  const pStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task)}
      onClick={() => onOpenDetails(task)}
      className="group bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer select-none relative flex flex-col gap-3"
    >
      {/* Top row: ID, Priority, Status Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {task.id}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
          >
            {task.priority}
          </span>

          {task.status === 'Changes Requested' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>Needs Revision</span>
            </span>
          )}

          {task.status === 'In Review' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>In Review</span>
            </span>
          )}
        </div>

        {/* Quick status change dropdown */}
        <div onClick={e => e.stopPropagation()} className="flex items-center">
          <select
            value={task.status}
            onChange={e => onStatusChange(task, e.target.value as TaskStatus)}
            className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option
              value="In Review"
              disabled={
                currentUser?.role === 'Intern' &&
                task.status !== 'In Review' &&
                task.evidenceRequirements?.length > 0
              }
            >
              In Review{' '}
              {currentUser?.role === 'Intern' && task.status !== 'In Review'
                ? '(Attach Evidence)'
                : ''}
            </option>
            <option
              value="Changes Requested"
              disabled={currentUser?.role === 'Intern'}
            >
              Changes Requested{' '}
              {currentUser?.role === 'Intern' ? '(Reviewer Only)' : ''}
            </option>
            <option value="Completed" disabled={currentUser?.role === 'Intern'}>
              Completed{' '}
              {currentUser?.role === 'Intern' ? '(Requires Review)' : ''}
            </option>
          </select>
        </div>
      </div>

      {/* Task Title & Project */}
      <div>
        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>
        <div className="text-[11px] font-medium text-slate-500 mt-1 truncate flex items-center gap-1">
          <span className="text-slate-400">📁</span>
          <span>{task.projectName}</span>
        </div>
      </div>

      {/* Review feedback alert banner if changes requested */}
      {task.status === 'Changes Requested' && task.reviewFeedback && (
        <div className="p-2 bg-rose-50/80 border border-rose-200/80 rounded-lg text-[11px] text-rose-800 line-clamp-2 leading-relaxed">
          <span className="font-semibold">Reviewer: </span>
          {task.reviewFeedback}
        </div>
      )}

      {/* Checklist bar if present */}
      {totalChecklist > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>Checklist</span>
            </span>
            <span>
              {completedChecklist}/{totalChecklist}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completedChecklist === totalChecklist
                  ? 'bg-emerald-500'
                  : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.round((completedChecklist / totalChecklist) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tags / Labels & Review Badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {task.requiresReview && task.status !== 'Changes Requested' && (
          <span
            title={`Reviewed by: ${task.reviewerName || 'Supervisor'}`}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"
          >
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>Review Gate</span>
          </span>
        )}

        {task.labels.slice(0, 2).map((label, idx) => (
          <span
            key={idx}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
          >
            #{label}
          </span>
        ))}

        {task.attachments.length > 0 && (
          <span
            title={`${task.attachments.length} attachment(s)`}
            className="inline-flex items-center gap-0.5 text-[10px] text-slate-400"
          >
            <Paperclip className="w-3 h-3" />
            <span>{task.attachments.length}</span>
          </span>
        )}

        {task.evidenceRequirements && task.evidenceRequirements.length > 0 && (
          <span
            title={`${task.evidenceRequirements.length} evidence requirements configured`}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
          >
            <span>
              📎 {task.evidenceRequirements.length} Req
              {task.evidenceRequirements.length > 1 ? 's' : ''}
            </span>
          </span>
        )}
      </div>

      {/* Bottom row: Assignee Avatar + Due date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {/* Assignee */}
        <div
          className="flex items-center gap-1.5 min-w-0"
          title={`Assignee: ${task.assigneeName} (${task.assigneeRole})`}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{
              backgroundColor:
                task.assigneeRole === 'Intern' ? '#64748b' : '#2563eb',
            }}
          >
            {task.assigneeName.charAt(0)}
          </div>
          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]">
            {task.assigneeName}
          </span>
        </div>

        {/* Due Date & Overdue */}
        <div className="flex items-center gap-1 shrink-0">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span
            className={`text-[11px] font-semibold ${
              isOverdue
                ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200'
                : 'text-slate-500'
            }`}
          >
            {isOverdue && '⚠️ '}
            {task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
