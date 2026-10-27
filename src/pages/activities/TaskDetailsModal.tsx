import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ActivityTaskStore,
  type ActivityTask,
  type Employee,
  type TaskStatus,
  type EvidenceRequirement,
  type EvidenceItem,
  type EvidenceType,
} from '../../stores/activityTaskStore';
import { AppDialog, AppButton } from '../../components';
import {
  CheckCircle2,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  Send,
  Check,
  CornerDownRight,
  Edit2,
  RefreshCw,
  AlertCircle,
  Clock,
  Mic,
  MicOff,
  Camera,
  Video,
  FileText,
  FileSpreadsheet,
  Paperclip,
  Trash2,
  Play,
  Pause,
  Upload,
  Save,
  Eye,
  Sliders,
  History,
  AlertTriangle,
  XCircle,
  Lock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import SurveyStore from '../../stores/surveyStore';
import type { SubtaskType } from '../../stores/types';
import SubtaskMeetingDetailsModal, {
  type MeetingDetailsData,
} from './SubtaskMeetingDetailsModal';

interface TaskDetailsModalProps {
  task: ActivityTask | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  onTaskUpdated: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  currentUser,
  onTaskUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'comments' | 'timeline'
  >('overview');

  const [commentText, setCommentText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Reviewer Decision States
  const [reviewDecision, setReviewDecision] = useState<
    'Approved' | 'Changes Requested' | 'Rejected' | null
  >(null);
  const [reviewFeedbackText, setReviewFeedbackText] = useState('');
  const [showReviewActionBox, setShowReviewActionBox] = useState(false);

  // Quick edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  // ── Evidence Execution States (For Assignee / Intern) ──
  const [draftEvidence, setDraftEvidence] = useState<EvidenceItem[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Subtask creation state inside TaskDetailsModal
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [subtaskType, setSubtaskType] = useState<SubtaskType>('standard');
  const [subtaskSurveyId, setSubtaskSurveyId] = useState('');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetailsData>({
    meetingUrl: '',
    meetingDuration: '45 mins',
    meetingDescription: '',
  });

  const surveys = useMemo(() => SurveyStore.getSurveys(), []);

  // Audio Recorder Simulation State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTargetReqId, setRecordingTargetReqId] = useState<
    string | null
  >(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description);
      setEditDueDate(task.dueDate);
      setShowReviewActionBox(false);
      setReviewDecision(null);
      setReviewFeedbackText('');
      setShowSubmitConfirm(false);
      setSubmissionNotes('');
      setValidationErrors([]);
      setIsRecordingAudio(false);
      setRecordingSeconds(0);
      setPlayingAudioId(null);

      // Load draft evidence or initialized currentEvidenceDraft
      if (task.currentEvidenceDraft && task.currentEvidenceDraft.length > 0) {
        setDraftEvidence([...task.currentEvidenceDraft]);
      } else {
        setDraftEvidence([]);
      }
    }
  }, [task]);

  // Audio timer ticker
  useEffect(() => {
    if (isRecordingAudio) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingAudio]);

  if (!isOpen || !task) return null;

  const canView = ActivityTaskStore.canUserViewTask(currentUser, task);
  if (!canView) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 border border-rose-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            You do not have authorization to view this task ({task.id}) or its
            evidence attachments under the organizational reporting policy.
          </p>
          <div className="pt-2">
            <AppButton variant="outline" size="sm" onClick={onClose}>
              Close
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  const reportingChain = ActivityTaskStore.getReportingChain(
    task.assigneeId
  ).reverse();

  const isOverdue =
    task.status !== 'Completed' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isAuthorizedReviewer = ActivityTaskStore.isReviewerForTask(
    currentUser,
    task
  );
  const isAssignee = currentUser.id === task.assigneeId;
  const isSelfReviewAttempt = currentUser.id === task.assigneeId;

  const totalChecklist = task.checklist.length;
  const completedChecklist = task.checklist.filter(c => c.completed).length;

  const evidenceRequirements = task.evidenceRequirements || [];
  const submissions = task.submissions || [];
  const latestSubmission =
    submissions.length > 0 ? submissions[submissions.length - 1] : null;

  // Compute completed evidence count
  const mandatoryRequirements = evidenceRequirements.filter(r => r.required);
  const satisfiedCount = mandatoryRequirements.filter(req => {
    const items = draftEvidence.filter(e => e.requirementId === req.id);
    if (req.type === 'photo') {
      return items.length >= (req.minCount || 1);
    }
    if (req.type === 'text') {
      return items.some(i => Boolean(i.textResponse?.trim()));
    }
    return items.length > 0;
  }).length;

  // ── Handlers ──

  const handleToggleChecklist = (checklistId: string) => {
    ActivityTaskStore.toggleChecklistItem(task.id, checklistId, currentUser);
    onTaskUpdated();
  };

  const handleAddSubtask = () => {
    if (!task) return;
    if (subtaskType === 'survey') {
      if (!subtaskSurveyId) return;
      const surveyMatch = surveys.find(s => s.id === subtaskSurveyId);
      const title = surveyMatch ? surveyMatch.name : 'Survey Subtask';
      ActivityTaskStore.addChecklistItem(
        task.id,
        {
          text: title,
          type: 'survey',
          surveyId: subtaskSurveyId,
        },
        currentUser
      );
      setSubtaskSurveyId('');
      onTaskUpdated();
      return;
    }

    if (subtaskType === 'meeting') {
      if (!newSubtaskText.trim()) return;
      ActivityTaskStore.addChecklistItem(
        task.id,
        {
          text: newSubtaskText.trim(),
          type: 'meeting',
          meetingUrl: meetingDetails.meetingUrl,
          meetingDuration: meetingDetails.meetingDuration,
          meetingDescription: meetingDetails.meetingDescription,
        },
        currentUser
      );
      setNewSubtaskText('');
      setMeetingDetails({
        meetingUrl: '',
        meetingDuration: '45 mins',
        meetingDescription: '',
      });
      onTaskUpdated();
      return;
    }

    if (!newSubtaskText.trim()) return;
    ActivityTaskStore.addChecklistItem(
      task.id,
      {
        text: newSubtaskText.trim(),
        type: 'standard',
      },
      currentUser
    );
    setNewSubtaskText('');
    onTaskUpdated();
  };

  const handleDeleteSubtask = (checklistId: string) => {
    if (!task) return;
    ActivityTaskStore.deleteChecklistItem(task.id, checklistId, currentUser);
    onTaskUpdated();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    const res = ActivityTaskStore.transitionStatus(
      task.id,
      newStatus,
      currentUser
    );
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
    onTaskUpdated();
  };

  const handleSaveEdit = () => {
    const updated = {
      ...task,
      title: editTitle.trim() || task.title,
      description: editDesc.trim(),
      dueDate: editDueDate || task.dueDate,
    };
    ActivityTaskStore.updateTask(updated);
    setIsEditing(false);
    setActionNotice('Task details updated.');
    setTimeout(() => setActionNotice(null), 3000);
    onTaskUpdated();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    ActivityTaskStore.addComment(task.id, commentText.trim(), currentUser);
    setCommentText('');
    onTaskUpdated();
  };

  // ── Evidence Draft Handlers (Intern / Assignee) ──

  const handleSaveEvidenceDraft = () => {
    const res = ActivityTaskStore.saveEvidenceDraft(
      task.id,
      currentUser,
      draftEvidence
    );
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 3000);
    onTaskUpdated();
  };

  // Photo Upload Simulation / Real file reader
  const handlePhotoUpload = (
    reqId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: EvidenceItem[] = [];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr =
        sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      newItems.push({
        id: `ev-${Date.now()}-${i}`,
        requirementId: reqId,
        type: 'photo',
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: sizeStr,
        mimeType: file.type || 'image/jpeg',
        uploadedAt: `${dateStr} ${timeStr}`,
        uploadedBy: currentUser.id,
        uploaderName: currentUser.name,
        uploaderRole: currentUser.role,
        caption: 'Field photo captured by assignee',
      });
    }

    setDraftEvidence(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  // Quick simulated photo capture
  const handleSimulatePhotoCapture = (req: EvidenceRequirement) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const photoNumber =
      draftEvidence.filter(e => e.requirementId === req.id).length + 1;

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: req.id,
      type: 'photo',
      title: `${req.title} #${photoNumber}`,
      fileName: `field_capture_geotagged_0${photoNumber}.jpg`,
      fileSize: '1.9 MB',
      mimeType: 'image/jpeg',
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      caption: `Geotagged ground photo #${photoNumber} captured at field location.`,
    };

    setDraftEvidence(prev => [...prev, newItem]);
  };

  // Audio Recording Toggle
  const handleStartAudioRecording = (reqId: string) => {
    setRecordingTargetReqId(reqId);
    setIsRecordingAudio(true);
    setRecordingSeconds(0);
  };

  const handleStopAudioRecording = () => {
    if (!recordingTargetReqId) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const duration = Math.max(recordingSeconds, 15);

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: recordingTargetReqId,
      type: 'voice',
      title: `Voice Memo (${duration}s)`,
      fileName: `field_audio_memo_${Date.now().toString().slice(-4)}.m4a`,
      fileSize: `${Math.round(duration * 16)} KB`,
      mimeType: 'audio/mp4',
      durationSeconds: duration,
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      caption: `Voice observation recording (${duration} seconds duration).`,
    };

    setDraftEvidence(prev => [
      ...prev.filter(e => e.requirementId !== recordingTargetReqId),
      newItem,
    ]);
    setIsRecordingAudio(false);
    setRecordingTargetReqId(null);
  };

  // Document Upload
  const handleDocumentUpload = (
    reqId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr =
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: reqId,
      type: 'document',
      title: file.name,
      fileName: file.name,
      fileSize: sizeStr,
      mimeType: file.type || 'application/pdf',
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
    };

    setDraftEvidence(prev => [
      ...prev.filter(e => e.requirementId !== reqId),
      newItem,
    ]);
    e.target.value = '';
  };

  // Video Upload
  const handleVideoUpload = (
    reqId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: reqId,
      type: 'video',
      title: file.name,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      mimeType: file.type || 'video/mp4',
      durationSeconds: 45,
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
    };

    setDraftEvidence(prev => [
      ...prev.filter(e => e.requirementId !== reqId),
      newItem,
    ]);
    e.target.value = '';
  };

  // Text observation change
  const handleTextObservationChange = (reqId: string, text: string) => {
    setDraftEvidence(prev => {
      const filtered = prev.filter(e => e.requirementId !== reqId);
      if (!text.trim()) return filtered;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return [
        ...filtered,
        {
          id: `ev-${reqId}`,
          requirementId: reqId,
          type: 'text',
          title: 'Written Observation',
          textResponse: text,
          uploadedAt: `${dateStr} ${timeStr}`,
          uploadedBy: currentUser.id,
          uploaderName: currentUser.name,
          uploaderRole: currentUser.role,
        },
      ];
    });
  };

  const handleRemoveEvidenceItem = (itemId: string) => {
    setDraftEvidence(prev => prev.filter(e => e.id !== itemId));
  };

  // Validate before submission
  const handleValidateAndOpenSubmit = () => {
    const val = ActivityTaskStore.validateEvidenceRequirements(
      evidenceRequirements,
      draftEvidence
    );
    if (!val.valid) {
      setValidationErrors(val.errors);
      return;
    }
    setValidationErrors([]);
    setShowSubmitConfirm(true);
  };

  // Confirm formal submission
  const handleConfirmSubmitForReview = () => {
    const res = ActivityTaskStore.submitTaskWithEvidence(
      task.id,
      currentUser,
      draftEvidence,
      submissionNotes
    );
    if (!res.success) {
      setValidationErrors(res.errors || [res.message]);
      setShowSubmitConfirm(false);
      return;
    }
    setActionNotice(res.message);
    setShowSubmitConfirm(false);
    setSubmissionNotes('');
    setTimeout(() => setActionNotice(null), 4000);
    onTaskUpdated();
  };

  // ── Reviewer Actions ──

  const handleOpenReviewAction = (
    decision: 'Approved' | 'Changes Requested' | 'Rejected'
  ) => {
    setReviewDecision(decision);
    setReviewFeedbackText('');
    setShowReviewActionBox(true);
  };

  const handleConfirmReviewDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDecision) return;

    if (
      (reviewDecision === 'Changes Requested' ||
        reviewDecision === 'Rejected') &&
      !reviewFeedbackText.trim()
    ) {
      setActionNotice(
        'Feedback comments are mandatory when requesting changes or rejecting.'
      );
      return;
    }

    const res = ActivityTaskStore.reviewTaskSubmission(
      task.id,
      currentUser,
      reviewDecision,
      reviewFeedbackText.trim() || undefined
    );

    setActionNotice(res.message);
    setShowReviewActionBox(false);
    setReviewDecision(null);
    setReviewFeedbackText('');
    setTimeout(() => setActionNotice(null), 4000);
    onTaskUpdated();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {task.id}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            {task.priority} Priority
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              task.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : task.status === 'In Review'
                  ? 'bg-indigo-100 text-indigo-800'
                  : task.status === 'Changes Requested'
                    ? 'bg-rose-100 text-rose-800'
                    : task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
            }`}
          >
            ● {task.status}
          </span>

          {isAuthorizedReviewer && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>
          )}
        </div>
      }
      footer={
        <AppButton variant="outline" size="sm" onClick={onClose}>
          Close Details
        </AppButton>
      }
    >
      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Modal Main Body */}
      <div className="space-y-4">
        {/* Reporting Hierarchy Path */}
        <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Organizational Governance &amp; Reporting Chain
          </span>
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-700">
            {reportingChain.map((emp, idx) => (
              <React.Fragment key={emp.id}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                    emp.id === task.assigneeId
                      ? 'bg-blue-100 text-blue-800 font-bold'
                      : emp.id === task.creatorId
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600'
                  }`}
                >
                  <span>{emp.name}</span>
                  <span className="text-[10px] text-slate-500">
                    ({emp.role})
                  </span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Title & Context */}
        {isEditing ? (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-blue-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="text-slate-400">📁</span>
              <span className="text-blue-700 font-semibold">
                {task.projectName}
              </span>
              <span>•</span>
              <span>ID: {task.projectId}</span>
              {task.activityName && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                    Milestone: {task.activityName}
                  </span>
                </>
              )}
            </div>
            {task.description && (
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 m-0">
                {task.description}
              </p>
            )}
          </div>
        )}

        {/* Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Assigned To
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
              {task.assigneeName}
            </span>
            <span className="text-[10px] text-slate-500">
              {task.assigneeRole}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Author / Creator
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
              {task.creatorName}
            </span>
            <span className="text-[10px] text-slate-500">
              {task.creatorRole}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Designated Reviewer
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
              {task.reviewerName || task.creatorName}
            </span>
            <span className="text-[10px] text-slate-500">
              {task.reviewerRole || task.creatorRole}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Due Date
            </span>
            <span
              className={`text-xs font-bold mt-0.5 block ${
                isOverdue ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {task.dueDate}
            </span>
            <span className="text-[10px] text-slate-500">
              {isOverdue ? '⚠️ Overdue' : `Target: ${task.dueDate}`}
            </span>
          </div>
        </div>

        {/* ── Linked Field Survey & Assignment Mode Banner ── */}
        {task.surveyId && (
          <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200/90 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-950">
                    Linked Survey:
                  </span>
                  <span className="font-semibold text-blue-800">
                    {task.surveyTitle || task.surveyId}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                    {task.surveyId}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full">
                {task.assignmentMode === 'Group'
                  ? 'Group Task'
                  : 'Individual Task'}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-3 pl-7">
              <span>
                Mode: <strong>{task.assignmentMode || 'Individual'}</strong>
              </span>
              {task.groupName && (
                <span>
                  Group Name: <strong>{task.groupName}</strong>
                </span>
              )}
              {task.memberIds && task.memberIds.length > 0 && (
                <span>
                  Team Members: <strong>{task.memberIds.length}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Review Feedback Alert Banner (If Changes Requested) ── */}
        {task.status === 'Changes Requested' && task.reviewFeedback && (
          <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/90 text-xs text-rose-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Reviewer Feedback — Action Required</span>
            </div>
            <p className="pl-6 text-slate-800 m-0 leading-relaxed font-medium">
              "{task.reviewFeedback}"
            </p>
            <p className="pl-6 text-[11px] text-rose-700 m-0">
              Please update your deliverables or attach missing evidence below
              and resubmit for verification.
            </p>
          </div>
        )}

        {/* ── Tabs Navigation Bar ── */}
        <div className="border-b border-slate-200 flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist &amp; Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Evidence &amp; Deliverables</span>
            {evidenceRequirements.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  task.status === 'In Review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {evidenceRequirements.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Discussion</span>
            {task.comments.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                {task.comments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
              {task.timeline.length}
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & CHECKLIST
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pt-1">
            {/* Checklist & Typed Subtasks */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Checklist &amp; Subtasks</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {completedChecklist}/{totalChecklist} Completed (
                  {totalChecklist > 0
                    ? Math.round((completedChecklist / totalChecklist) * 100)
                    : 0}
                  %)
                </span>
              </div>

              {totalChecklist > 0 ? (
                <div className="space-y-2">
                  {task.checklist.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200/80 text-xs transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 mt-0.5 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.type === 'survey' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                              📋 Survey
                            </span>
                          ) : item.type === 'meeting' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0 flex items-center gap-1">
                              <Video className="w-3 h-3 text-blue-600" />
                              Meeting ({item.meetingDuration || '45 mins'})
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              📌 Standard
                            </span>
                          )}

                          <span
                            onClick={() => handleToggleChecklist(item.id)}
                            className={`cursor-pointer font-semibold ${
                              item.completed
                                ? 'line-through text-slate-400 font-medium'
                                : 'text-slate-800'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>

                        {/* Meeting Description or Agenda */}
                        {item.meetingDescription && (
                          <p className="text-[11px] text-slate-500 mt-1 pl-0.5 leading-relaxed bg-white/70 p-1.5 rounded border border-slate-200/60">
                            {item.meetingDescription}
                          </p>
                        )}
                      </div>

                      {/* 1-Click Join Meeting Link if meeting URL exists */}
                      {item.meetingUrl && (
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                          title="Open meeting in new tab"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Remove subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No subtasks added yet.
                </p>
              )}

              {/* Add Subtask Quick Section inside modal */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Add Subtask:
                  </span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 gap-1">
                    <button
                      type="button"
                      onClick={() => setSubtaskType('standard')}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                        subtaskType === 'standard'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📌 Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubtaskType('survey')}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                        subtaskType === 'survey'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📋 Survey
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubtaskType('meeting')}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                        subtaskType === 'meeting'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📅 Meeting
                    </button>
                  </div>
                </div>

                {subtaskType === 'survey' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={subtaskSurveyId}
                      onChange={e => setSubtaskSurveyId(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium cursor-pointer"
                    >
                      <option value="">-- Select a Survey --</option>
                      {surveys.map(s => (
                        <option key={s.id} value={s.id}>
                          📋 {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!subtaskSurveyId}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={handleAddSubtask}
                    >
                      Add Survey
                    </AppButton>
                  </div>
                ) : subtaskType === 'meeting' ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Meeting title (e.g. Governance Sync)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMeetingModalOpen(true)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                        meetingDetails.meetingUrl ||
                        meetingDetails.meetingDescription
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                      title="Configure meeting URL, duration, agenda"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>
                        {meetingDetails.meetingUrl ||
                        meetingDetails.meetingDescription
                          ? 'Meeting Configured ✓'
                          : 'Meeting Details'}
                      </span>
                    </button>
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!newSubtaskText.trim()}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={handleAddSubtask}
                    >
                      Add
                    </AppButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Add subtask or milestone..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium"
                    />
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!newSubtaskText.trim()}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={handleAddSubtask}
                    >
                      Add
                    </AppButton>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Shift Panel (Permitted Transitions) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Workflow Status Transitions
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    'To Do',
                    'In Progress',
                    'In Review',
                    'Changes Requested',
                    'Completed',
                  ] as TaskStatus[]
                ).map(st => {
                  const isCurrent = task.status === st;
                  const isInternDisallowed =
                    currentUser.role === 'Intern' &&
                    (st === 'Completed' || st === 'Changes Requested');

                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isCurrent || isInternDisallowed}
                      onClick={() => handleStatusChange(st)}
                      title={
                        isInternDisallowed
                          ? 'Interns cannot mark tasks completed directly. Submit required evidence for review.'
                          : ''
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs cursor-default'
                          : isInternDisallowed
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
              {currentUser.role === 'Intern' && (
                <span className="text-[11px] text-slate-500 italic block">
                  * Interns can update tasks to "In Progress". Formal completion
                  requires supervisor review sign-off.
                </span>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: EVIDENCE COLLECTION & SUBMISSIONS (CRITICAL ENGINE)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'evidence' && (
          <div className="space-y-4 pt-1">
            {/* ── Reviewer Action Bar (When in Review) ── */}
            {task.status === 'In Review' && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">
                        Deliverables Submitted for Review
                      </span>
                      <span className="text-[11px] text-indigo-800">
                        Submitted by {task.assigneeName} on{' '}
                        {task.submittedAt || 'Recent'}
                      </span>
                    </div>
                  </div>

                  {isAuthorizedReviewer && (
                    <div className="flex items-center gap-2">
                      {isSelfReviewAttempt ? (
                        <div className="text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                          Self-approval prohibited
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenReviewAction('Approved')}
                            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve &amp; Mark Completed</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenReviewAction('Changes Requested')
                            }
                            className="px-3.5 py-1.5 bg-white text-rose-700 border border-rose-300 rounded-lg text-xs font-bold hover:bg-rose-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Request Corrections</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReviewAction('Rejected')}
                            className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Review Feedback Decision Form Modal-in-place */}
                {showReviewActionBox && (
                  <form
                    onSubmit={handleConfirmReviewDecision}
                    className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs space-y-2.5 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {reviewDecision === 'Approved'
                          ? '✅ Confirm Approval & Complete Task'
                          : reviewDecision === 'Changes Requested'
                            ? '⚠️ Specify Required Corrections'
                            : '🛑 Formal Submission Rejection'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReviewActionBox(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {reviewDecision === 'Approved'
                          ? 'Approval Comments (Optional):'
                          : 'Mandatory Reviewer Feedback for Assignee:'}
                      </label>
                      <textarea
                        rows={3}
                        value={reviewFeedbackText}
                        onChange={e => setReviewFeedbackText(e.target.value)}
                        placeholder={
                          reviewDecision === 'Approved'
                            ? 'e.g., Deliverables and evidence verified. Task successfully closed.'
                            : 'e.g., Missing 2nd solar panel photo and the audio memo was inaudible. Please re-upload...'
                        }
                        required={reviewDecision !== 'Approved'}
                        className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewActionBox(false)}
                        className="px-3 py-1 text-xs bg-white border rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs cursor-pointer ${
                          reviewDecision === 'Approved'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        Confirm {reviewDecision}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Validation Error Banner (When Submit Fails) */}
            {validationErrors.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Cannot Submit: Mandatory Evidence Missing</span>
                </div>
                <ul className="text-xs text-rose-900 space-y-1 pl-5 list-disc m-0">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress Header for Evidence */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Evidence Checklist:
                </span>
                <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                  {satisfiedCount} of {mandatoryRequirements.length} Mandatory
                  Requirements Satisfied
                </span>
              </div>

              {isAssignee &&
                task.status !== 'In Review' &&
                task.status !== 'Completed' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEvidenceDraft}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5 text-blue-600" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleValidateAndOpenSubmit}
                      className="px-3.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  </div>
                )}
            </div>

            {/* ── Requirements List & Interactive Upload Controls ── */}
            <div className="space-y-3">
              {evidenceRequirements.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No specific evidence requirements configured for this task.
                </div>
              ) : (
                evidenceRequirements.map(req => {
                  const attachedItems = draftEvidence.filter(
                    e => e.requirementId === req.id
                  );
                  const isPhoto = req.type === 'photo';
                  const isVoice = req.type === 'voice';
                  const isVideo = req.type === 'video';
                  const isDocument = req.type === 'document';
                  const isText = req.type === 'text';

                  const minPhotos = req.minCount || 1;
                  const isRequirementSatisfied = isPhoto
                    ? attachedItems.length >= minPhotos
                    : isText
                      ? attachedItems.some(i => Boolean(i.textResponse?.trim()))
                      : attachedItems.length > 0;

                  const canEdit =
                    isAssignee &&
                    task.status !== 'In Review' &&
                    task.status !== 'Completed';

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isRequirementSatisfied
                          ? 'bg-white border-emerald-200 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Requirement Header */}
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {isVoice && (
                              <Mic className="w-4 h-4 text-blue-600" />
                            )}
                            {isPhoto && (
                              <Camera className="w-4 h-4 text-emerald-600" />
                            )}
                            {isVideo && (
                              <Video className="w-4 h-4 text-rose-600" />
                            )}
                            {isDocument && (
                              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                            )}
                            {isText && (
                              <FileText className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 m-0">
                                {req.title}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                  req.required
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {req.required
                                  ? isPhoto && req.minCount
                                    ? `Mandatory (${attachedItems.length}/${req.minCount})`
                                    : 'Mandatory'
                                  : 'Optional'}
                              </span>
                              {isRequirementSatisfied ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  <span>Requirement Met</span>
                                </span>
                              ) : req.required ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Missing</span>
                                </span>
                              ) : null}
                            </div>
                            {req.instructions && (
                              <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-relaxed">
                                {req.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attached Items Display */}
                      {attachedItems.length > 0 && (
                        <div className="pt-3 space-y-2">
                          {isPhoto && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {attachedItems.map(item => (
                                <div
                                  key={item.id}
                                  className="relative group bg-slate-50 rounded-lg border border-slate-200 p-2 text-center"
                                >
                                  <div className="w-full h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 overflow-hidden mb-1.5">
                                    <Camera className="w-6 h-6 text-slate-400" />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                                    {item.fileName || item.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    {item.fileSize}
                                  </span>
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveEvidenceItem(item.id)
                                      }
                                      className="absolute top-1 right-1 p-1 bg-white/90 text-rose-600 rounded-md shadow-xs hover:bg-rose-50 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {isVoice && (
                            <div className="space-y-2">
                              {attachedItems.map(item => {
                                const isPlaying = playingAudioId === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPlayingAudioId(
                                            isPlaying ? null : item.id
                                          )
                                        }
                                        className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer shrink-0 shadow-xs"
                                      >
                                        {isPlaying ? (
                                          <Pause className="w-4 h-4" />
                                        ) : (
                                          <Play className="w-4 h-4 ml-0.5" />
                                        )}
                                      </button>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-blue-950">
                                            {item.title || 'Voice Memo'}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                                            {item.durationSeconds || 45}s
                                          </span>
                                          {isPlaying && (
                                            <span className="text-[10px] text-blue-600 animate-pulse font-semibold">
                                              Playing audio stream...
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                          Uploaded {item.uploadedAt} by{' '}
                                          {item.uploaderName}
                                        </span>
                                      </div>
                                    </div>

                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveEvidenceItem(item.id)
                                        }
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                        title="Delete voice note"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {isDocument && (
                            <div className="space-y-1.5">
                              {attachedItems.map(item => (
                                <div
                                  key={item.id}
                                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                                    <div>
                                      <span className="font-bold text-slate-800 block">
                                        {item.fileName || item.title}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.fileSize} • Uploaded{' '}
                                        {item.uploadedAt}
                                      </span>
                                    </div>
                                  </div>

                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveEvidenceItem(item.id)
                                      }
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {isVideo && (
                            <div className="space-y-1.5">
                              {attachedItems.map(item => (
                                <div
                                  key={item.id}
                                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Video className="w-4 h-4 text-rose-600" />
                                    <div>
                                      <span className="font-bold text-slate-800 block">
                                        {item.fileName || item.title}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.fileSize} • Duration{' '}
                                        {item.durationSeconds || 45}s
                                      </span>
                                    </div>
                                  </div>

                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveEvidenceItem(item.id)
                                      }
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {isText && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                              <p className="text-slate-800 m-0 leading-relaxed font-medium">
                                {attachedItems[0].textResponse}
                              </p>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                Recorded by {attachedItems[0].uploaderName} •{' '}
                                {attachedItems[0].uploadedAt}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Capture / Upload Controls (Assignee Edit Mode) */}
                      {canEdit && (
                        <div className="pt-3">
                          {isPhoto && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs">
                                <Upload className="w-3.5 h-3.5 text-blue-600" />
                                <span>Upload Photos</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={e => handlePhotoUpload(req.id, e)}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleSimulatePhotoCapture(req)}
                                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>
                                  Capture Photo #{attachedItems.length + 1}
                                </span>
                              </button>
                            </div>
                          )}

                          {isVoice && (
                            <div className="space-y-2">
                              {isRecordingAudio &&
                              recordingTargetReqId === req.id ? (
                                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                                    <span className="font-bold text-rose-800">
                                      Recording Live Voice Memo...
                                    </span>
                                    <span className="font-mono font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                                      0:
                                      {recordingSeconds < 10
                                        ? `0${recordingSeconds}`
                                        : recordingSeconds}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleStopAudioRecording}
                                    className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
                                  >
                                    Stop &amp; Save Recording
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartAudioRecording(req.id)
                                    }
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <Mic className="w-3.5 h-3.5" />
                                    <span>
                                      {attachedItems.length > 0
                                        ? 'Re-record Voice Memo'
                                        : 'Record Audio Note'}
                                    </span>
                                  </button>

                                  <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs">
                                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Upload Audio File</span>
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      onChange={e => {
                                        const files = e.target.files;
                                        if (files && files[0]) {
                                          const now = new Date();
                                          const dateStr = now
                                            .toISOString()
                                            .split('T')[0];
                                          const timeStr =
                                            now.toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            });
                                          setDraftEvidence(prev => [
                                            ...prev.filter(
                                              x => x.requirementId !== req.id
                                            ),
                                            {
                                              id: `ev-${Date.now()}`,
                                              requirementId: req.id,
                                              type: 'voice',
                                              title: files[0].name,
                                              fileName: files[0].name,
                                              fileSize: `${Math.round(files[0].size / 1024)} KB`,
                                              durationSeconds: 60,
                                              uploadedAt: `${dateStr} ${timeStr}`,
                                              uploadedBy: currentUser.id,
                                              uploaderName: currentUser.name,
                                              uploaderRole: currentUser.role,
                                            },
                                          ]);
                                        }
                                        e.target.value = '';
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {isDocument && (
                            <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                              <Upload className="w-3.5 h-3.5 text-amber-600" />
                              <span>Attach Document / Dataset</span>
                              <input
                                type="file"
                                accept=".pdf,.docx,.xlsx,.csv"
                                onChange={e => handleDocumentUpload(req.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}

                          {isVideo && (
                            <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                              <Upload className="w-3.5 h-3.5 text-rose-600" />
                              <span>Upload Video File</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={e => handleVideoUpload(req.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}

                          {isText && (
                            <textarea
                              rows={3}
                              value={attachedItems[0]?.textResponse || ''}
                              onChange={e =>
                                handleTextObservationChange(
                                  req.id,
                                  e.target.value
                                )
                              }
                              placeholder="Enter field observation, survey reflections, or data analysis summary..."
                              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Submission Confirmation Drawer (Assignee) ── */}
            {showSubmitConfirm && (
              <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-950">
                      Confirm Formal Deliverable Submission
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-blue-900 m-0">
                  All mandatory evidence requirements have been verified.
                  Submitting will freeze these deliverables into a formal
                  submission version and notify designated reviewer{' '}
                  <strong>{task.reviewerName}</strong>.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Deliverable Remarks / Summary Note (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={submissionNotes}
                    onChange={e => setSubmissionNotes(e.target.value)}
                    placeholder="Provide a brief note for the reviewer regarding completed deliverables..."
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-3 py-1.5 text-xs bg-white border rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmitForReview}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    Submit Deliverables
                  </button>
                </div>
              </div>
            )}

            {/* ── Submissions History Log (Immutable Versioned Records) ── */}
            {submissions.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Submission Version History ({submissions.length})</span>
                </span>

                <div className="space-y-2.5">
                  {submissions.map(sub => (
                    <div
                      key={sub.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            Version {sub.version}
                          </span>
                          <span className="text-slate-500">
                            Submitted by <strong>{sub.submitterName}</strong> (
                            {sub.submitterRole})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'Changes Requested'
                                ? 'bg-rose-100 text-rose-800'
                                : sub.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          ● {sub.status}
                        </span>
                      </div>

                      {sub.notes && (
                        <p className="text-slate-700 m-0 bg-white p-2 rounded-lg border border-slate-100 italic">
                          "{sub.notes}"
                        </p>
                      )}

                      {/* Evidence snapshot summary */}
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-600">
                          Evidence Attached ({sub.evidence.length} items):
                        </span>
                        {sub.evidence.map(ev => (
                          <span
                            key={ev.id}
                            className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-[10px] text-slate-700"
                          >
                            {ev.type.toUpperCase()}: {ev.title || ev.fileName}
                          </span>
                        ))}
                      </div>

                      {sub.reviewerFeedback && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
                          <span className="font-bold">
                            Reviewer Feedback ({sub.reviewerName}):
                          </span>{' '}
                          {sub.reviewerFeedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: COMMENTS & DISCUSSION
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'comments' && (
          <div className="pt-1 space-y-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {task.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No discussions logged yet. Leave the first remark below.
                </p>
              ) : (
                task.comments.map(c => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">
                        {c.authorName}{' '}
                        <span className="font-normal text-slate-500">
                          ({c.authorRole})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.createdAt}
                      </span>
                    </div>
                    <p className="text-slate-700 m-0 leading-normal">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Type update remarks or guidance note..."
                className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 h-9 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: AUDIT TIMELINE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'timeline' && (
          <div className="pt-1 space-y-2 max-h-64 overflow-y-auto">
            {task.timeline.map(tm => (
              <div
                key={tm.id}
                className="flex items-start gap-2.5 text-xs p-2 rounded-lg hover:bg-slate-50"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {tm.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tm.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 m-0">
                    <span className="font-semibold text-slate-700">
                      {tm.actorName} ({tm.actorRole}):
                    </span>{' '}
                    {tm.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubtaskMeetingDetailsModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        initialData={meetingDetails}
        onSave={data => setMeetingDetails(data)}
      />
    </AppDialog>
  );
};

export default TaskDetailsModal;
