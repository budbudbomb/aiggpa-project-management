import React, { useState } from 'react';
import { Eye, Clock, Check, X, AlignLeft } from 'lucide-react';
import ActivityTaskStore, {
  type ActivityTask,
  type TaskAssigneeReadStatus,
} from '@/stores/activityTaskStore';

interface TaskReadReceiptsModalProps {
  task: ActivityTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: ActivityTask) => void;
}

const AVATAR_COLORS = [
  '#2563eb',
  '#0284c7',
  '#16a34a',
  '#d97706',
  '#475569',
  '#0d9488',
  '#4338ca',
];

function getInitials(name: string): string {
  if (!name) return 'AI';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TaskReadReceiptsModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskReadReceiptsModalProps): React.ReactElement | null {
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  if (!isOpen || !task) return null;

  const rawAssignees: TaskAssigneeReadStatus[] =
    task.assignees && task.assignees.length > 0
      ? task.assignees
      : [
          {
            id: task.assigneeId,
            name: task.assigneeName,
            role: task.assigneeRole,
            read: task.status === 'Completed' || task.status === 'In Review',
            readAt: task.status === 'Completed' ? 'Today, 10:45 AM' : null,
          },
        ];

  const assigneesWithIdx = rawAssignees.map((a, idx) => ({
    ...a,
    originalIndex: idx,
  }));

  const readCount = rawAssignees.filter(a => a.read).length;
  const totalCount = rawAssignees.length;
  const unreadCount = totalCount - readCount;

  const filteredAssignees = assigneesWithIdx.filter(a => {
    if (filter === 'read') return a.read;
    if (filter === 'unread') return !a.read;
    return true;
  });

  const handleToggleStatus = (memberIdx: number) => {
    const updated = ActivityTaskStore.toggleAssigneeReadStatus(
      task.id,
      memberIdx
    );
    if (updated && onTaskUpdated) {
      onTaskUpdated(updated);
    }
  };

  return (
    <div
      id="modalReadReceipts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[580px] rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2
              id="mrrTaskTitle"
              className="text-base font-extrabold text-slate-900 leading-tight"
            >
              {task.id}: {task.title}
            </h2>
            <p id="mrrTaskSubtitle" className="text-xs text-slate-500 mt-0.5">
              Project: {task.projectName} · Due: {task.dueDate} · Priority:{' '}
              {task.priority}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Task Deliverables / Description Box */}
          <div
            id="mrrTaskDescBox"
            className="bg-slate-50 border border-slate-200 rounded-lg p-3"
          >
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Task Description / Deliverables</span>
            </div>
            <div
              id="mrrTaskDesc"
              className="text-xs text-slate-700 leading-relaxed"
            >
              {task.description ||
                'No specific deliverable instructions provided.'}
            </div>
          </div>

          {/* 2-Stat Summary Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div
              id="mrrCardRead"
              onClick={() => setFilter('read')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                filter === 'read'
                  ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
              }`}
              title="Click to view read members"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👁️</span>
                <span className="text-xs font-bold text-emerald-800">
                  Read by Members
                </span>
              </div>
              <span
                id="mrrStatRead"
                className="text-lg font-extrabold text-emerald-800"
              >
                {readCount}
              </span>
            </div>

            <div
              id="mrrCardUnread"
              onClick={() => setFilter('unread')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                filter === 'unread'
                  ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
              }`}
              title="Click to view unread members"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <span className="text-xs font-bold text-amber-800">
                  Unread / Pending
                </span>
              </div>
              <span
                id="mrrStatUnread"
                className="text-lg font-extrabold text-amber-800"
              >
                {unreadCount}
              </span>
            </div>
          </div>

          {/* Members List Header & Filter Tabs */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Assigned Team (
              <span id="mrrTotalAssignedCount">{totalCount}</span> Members)
            </div>
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                id="mrrFilterBtnAll"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                id="mrrFilterBtnRead"
                onClick={() => setFilter('read')}
                className={`px-3 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  filter === 'read'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Read
              </button>
              <button
                type="button"
                id="mrrFilterBtnUnread"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Scrollable Members List */}
          <div
            id="mrrMembersList"
            className="space-y-2 max-h-[260px] overflow-y-auto pr-1"
          >
            {filteredAssignees.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No{' '}
                {filter === 'read'
                  ? 'read'
                  : filter === 'unread'
                    ? 'unread'
                    : 'assigned'}{' '}
                members found.
              </div>
            ) : (
              filteredAssignees.map(a => {
                const initials = getInitials(a.name);
                const color =
                  AVATAR_COLORS[a.originalIndex % AVATAR_COLORS.length];
                const isRead = !!a.read;

                return (
                  <div
                    key={a.originalIndex}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isRead
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-amber-50/30 border-amber-200'
                    }`}
                  >
                    {/* Member Avatar & Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {a.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {a.role || 'Assigned Member'}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Read Status Badge */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(a.originalIndex)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        isRead
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Click to toggle Read / Unread status"
                    >
                      {isRead ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Read · {a.readAt || 'Earlier'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>⏳ Unread</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
