import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ActivityTaskStore,
  type ActivityTask,
  type Employee,
  type EvidenceItem,
} from '../../stores/activityTaskStore';
import { AppDialog, AppButton } from '../../components';
import {
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Send,
  Check,
  Edit2,
  Mic,
  Camera,
  Video,
  FileText,
  FileSpreadsheet,
  Trash2,
  Play,
  Pause,
  Upload,
  AlertTriangle,
  XCircle,
  Lock,
} from 'lucide-react';
import SurveyStore from '../../stores/surveyStore';
import SurveyFillModal from '../../components/surveys/SurveyFillModal';
import MediaCaptureModal, {
  type CapturedMediaResult,
} from '../../components/media/MediaCaptureModal';

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
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Reviewer Decision States
  const [reviewFeedbackText, setReviewFeedbackText] = useState('');
  const [showReviewActionBox, setShowReviewActionBox] = useState(false);

  // Quick edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  // ── Evidence Execution States ──
  const [draftEvidence, setDraftEvidence] = useState<EvidenceItem[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Audio Playback & Live Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTargetReqId, setRecordingTargetReqId] = useState<
    string | null
  >(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live Camera (Photo & Video) Evidence Capture State
  const [isMediaCaptureOpen, setIsMediaCaptureOpen] = useState(false);
  const [mediaCaptureMode, setMediaCaptureMode] = useState<'photo' | 'video'>(
    'photo'
  );
  const [mediaCaptureReqId, setMediaCaptureReqId] = useState<string | null>(
    null
  );

  // Survey Answering Modal State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const surveys = useMemo(() => SurveyStore.getSurveys(), []);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description);
      setEditDueDate(task.dueDate);
      setShowReviewActionBox(false);
      setReviewFeedbackText('');
      setSubmissionNotes('');
      setValidationErrors([]);
      setIsRecordingAudio(false);
      setRecordingSeconds(0);
      setPlayingAudioId(null);
      setIsSurveyModalOpen(false);

      if (task.currentEvidenceDraft && task.currentEvidenceDraft.length > 0) {
        setDraftEvidence([...task.currentEvidenceDraft]);
      } else {
        setDraftEvidence([]);
      }
    }
  }, [task]);

  // Audio recording timer ticker
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
  const isCreator = currentUser.id === task.creatorId;
  const canEdit =
    (isAssignee ||
      isCreator ||
      currentUser.role === 'Center Head' ||
      currentUser.role === 'Advisor') &&
    task.status !== 'Completed';

  const evidenceRequirements = task.evidenceRequirements || [];
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

  const hasSurvey = Boolean(task.surveyId || task.surveyTitle);
  const linkedSurvey = task.surveyId
    ? SurveyStore.getSurveyById(task.surveyId) ||
      surveys.find(s => s.id === task.surveyId) ||
      null
    : null;

  // ── Handlers ──

  const handleSaveEdit = () => {
    if (!task) return;
    const updated: ActivityTask = {
      ...task,
      title: editTitle,
      description: editDesc,
      dueDate: editDueDate,
    };
    ActivityTaskStore.updateTask(updated);
    setIsEditing(false);
    setActionNotice('Task metadata updated successfully.');
    setTimeout(() => setActionNotice(null), 3000);
    onTaskUpdated();
  };

  // Audio Playback
  const handleTogglePlayAudio = (id: string, url?: string) => {
    if (playingAudioId === id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src =
          url || 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg';
        audioPlayerRef.current.play();
        setPlayingAudioId(id);
      }
    }
  };

  // Live Camera Photo & Video Handlers
  const handleOpenMediaCapture = (reqId: string, mode: 'photo' | 'video') => {
    setMediaCaptureReqId(reqId);
    setMediaCaptureMode(mode);
    setIsMediaCaptureOpen(true);
  };

  const handleMediaCaptured = (result: CapturedMediaResult) => {
    if (!mediaCaptureReqId) return;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: mediaCaptureReqId,
      type: mediaCaptureMode === 'photo' ? 'photo' : 'video',
      title: result.fileName.replace(/\.[^/.]+$/, ''),
      fileName: result.fileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      fileData: result.previewUrl,
      durationSeconds:
        result.duration || (mediaCaptureMode === 'video' ? 15 : undefined),
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      caption:
        mediaCaptureMode === 'photo'
          ? 'Live photo captured via system camera'
          : 'Live video evidence recorded via system camera',
    };

    setDraftEvidence(prev => [...prev, newItem]);
    setIsMediaCaptureOpen(false);
  };

  // Photo Upload via file input
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
        fileData: URL.createObjectURL(file),
        uploadedAt: `${dateStr} ${timeStr}`,
        uploadedBy: currentUser.id,
        uploaderName: currentUser.name,
        uploaderRole: currentUser.role,
        caption: 'Field photo uploaded from gallery',
      });
    }

    setDraftEvidence(prev => [...prev, ...newItems]);
    e.target.value = '';
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
    const dur = Math.max(recordingSeconds, 5);

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: recordingTargetReqId,
      type: 'voice',
      title: `Voice Memo (${dur}s)`,
      fileName: `field_voice_memo_${Date.now()}.m4a`,
      fileSize: `${Math.round(dur * 12)} KB`,
      mimeType: 'audio/mp4',
      durationSeconds: dur,
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      caption: `Field audio memo recorded by ${currentUser.name}`,
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
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr =
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      requirementId: reqId,
      type: 'document',
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: sizeStr,
      mimeType: file.type || 'application/pdf',
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
    };

    setDraftEvidence(prev => [...prev, newItem]);
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
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr =
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
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
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: sizeStr,
      mimeType: file.type || 'video/mp4',
      fileData: URL.createObjectURL(file),
      durationSeconds: 30,
      uploadedAt: `${dateStr} ${timeStr}`,
      uploadedBy: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
    };

    setDraftEvidence(prev => [...prev, newItem]);
    e.target.value = '';
  };

  // Text observation
  const handleTextObservationChange = (reqId: string, val: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setDraftEvidence(prev => {
      const filtered = prev.filter(e => e.requirementId !== reqId);
      if (!val.trim()) return filtered;
      return [
        ...filtered,
        {
          id: `ev-${Date.now()}`,
          requirementId: reqId,
          type: 'text',
          title: 'Field Qualitative Observation',
          fileName: 'observation_entry.txt',
          fileSize: `${val.length} bytes`,
          textResponse: val,
          uploadedAt: `${dateStr} ${timeStr}`,
          uploadedBy: currentUser.id,
          uploaderName: currentUser.name,
          uploaderRole: currentUser.role,
        },
      ];
    });
  };

  const handleRemoveDraftItem = (itemId: string) => {
    setDraftEvidence(prev => prev.filter(e => e.id !== itemId));
  };

  // Direct Submission for Review
  const handleSubmitDeliverablesForReview = () => {
    const errors: string[] = [];
    mandatoryRequirements.forEach(req => {
      const items = draftEvidence.filter(e => e.requirementId === req.id);
      if (req.type === 'photo' && items.length < (req.minCount || 1)) {
        errors.push(
          `Missing photo evidence: "${req.title}" (Requires at least ${req.minCount || 1} photo)`
        );
      } else if (
        req.type === 'text' &&
        !items.some(i => Boolean(i.textResponse?.trim()))
      ) {
        errors.push(`Missing field observation: "${req.title}"`);
      } else if (items.length === 0) {
        errors.push(`Missing mandatory evidence: "${req.title}"`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    const res = ActivityTaskStore.submitTaskWithEvidence(
      task.id,
      currentUser,
      draftEvidence,
      submissionNotes.trim() || undefined
    );
    setActionNotice(res.message);
    setSubmissionNotes('');
    setTimeout(() => setActionNotice(null), 4000);
    onTaskUpdated();
  };

  // Survey Questionnaire Success
  const handleSurveySuccess = () => {
    setIsSurveyModalOpen(false);
    const res = ActivityTaskStore.submitForReview(
      task.id,
      currentUser,
      'Field survey responses and evidence submitted successfully by surveyor.'
    );
    setActionNotice(
      res.message || 'Survey submitted! Task is now under supervisor review.'
    );
    setTimeout(() => setActionNotice(null), 4000);
    onTaskUpdated();
  };

  // Reviewer Decision Confirmation
  const handleConfirmReviewDecision = (
    decision: 'Approved' | 'Changes Requested'
  ) => {
    if (decision === 'Changes Requested' && !reviewFeedbackText.trim()) {
      setActionNotice(
        'Please write feedback comments explaining what changes are requested.'
      );
      return;
    }

    const res = ActivityTaskStore.reviewTaskSubmission(
      task.id,
      currentUser,
      decision,
      reviewFeedbackText.trim() || undefined
    );

    setActionNotice(res.message);
    setShowReviewActionBox(false);
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
      {/* Hidden Audio Player */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setPlayingAudioId(null)}
        className="hidden"
      />

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
                    (
                    {(emp.role as string) === 'Project Manager'
                      ? 'Advisor'
                      : emp.role}
                    )
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
              {(task.assigneeRole as string) === 'Project Manager'
                ? 'Advisor'
                : task.assigneeRole}
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
              {(task.creatorRole as string) === 'Project Manager'
                ? 'Advisor'
                : task.creatorRole}
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
              {((task.reviewerRole || task.creatorRole) as string) ===
              'Project Manager'
                ? 'Advisor'
                : task.reviewerRole || task.creatorRole}
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

        {/* Review Feedback Alert Banner (If Changes Requested) */}
        {task.status === 'Changes Requested' && task.reviewFeedback && (
          <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/90 text-xs text-rose-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Reviewer Feedback — Revisions Required</span>
            </div>
            <p className="pl-6 text-slate-800 m-0 leading-relaxed font-medium">
              "{task.reviewFeedback}"
            </p>
            <p className="pl-6 text-[11px] text-rose-700 m-0">
              Please update your deliverables or re-capture requested evidence
              below and resubmit for supervisor review.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CASE A: TASK IS A FIELD SURVEY
        ══════════════════════════════════════════════════════════════════ */}
        {hasSurvey ? (
          <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200/90 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                      Field Survey Assignment
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                      {task.surveyId || 'SURVEY'}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    {linkedSurvey?.title ||
                      task.surveyTitle ||
                      'Field Survey Questionnaire'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                    {linkedSurvey?.description ||
                      'Complete the structured field questions and capture required ground evidence (Live Camera Photo, Video, or Audio notes).'}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  🎯 Target: {linkedSurvey?.participantsRequired || 100}{' '}
                  Responses
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  📋 {linkedSurvey?.questions?.length || 0} Questions Configured
                </span>
              </div>
            </div>

            {/* Survey Status & Action */}
            <div className="pt-3 border-t border-blue-200/70 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {task.status === 'In Review'
                    ? 'Survey responses submitted — Under supervisor verification'
                    : task.status === 'Completed'
                      ? 'Survey responses verified & completed'
                      : 'Survey questionnaire ready to answer'}
                </span>
              </div>

              {canEdit &&
                task.status !== 'In Review' &&
                task.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => setIsSurveyModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Answer Survey Questionnaire →</span>
                  </button>
                )}
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              CASE B: STANDARD TASK (EVIDENCE & DELIVERABLES)
          ══════════════════════════════════════════════════════════════════ */
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Evidence &amp; Deliverables
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Attach required field evidence, live photos, recordings, or
                    documentation
                  </p>
                </div>
              </div>

              {mandatoryRequirements.length > 0 && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    satisfiedCount >= mandatoryRequirements.length
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {satisfiedCount}/{mandatoryRequirements.length} Satisfied
                </span>
              )}
            </div>

            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Please complete required evidence before submitting:
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Requirements List */}
            {evidenceRequirements.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">
                  Standard Activity Task
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  No mandatory evidence files are required. Complete your
                  deliverables and submit for supervisor review.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {evidenceRequirements.map(req => {
                  const attachedItems = draftEvidence.filter(
                    e => e.requirementId === req.id
                  );
                  const isPhoto = req.type === 'photo';
                  const isVoice = req.type === 'voice';
                  const isVideo = req.type === 'video';
                  const isDocument = req.type === 'document';
                  const isText = req.type === 'text';

                  return (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5 transition-all"
                    >
                      {/* Top Row: Title, badge, requirement flag */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {req.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                            {req.type}
                          </span>
                          {req.required && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              Required
                            </span>
                          )}
                        </div>

                        {attachedItems.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Attached ({attachedItems.length})</span>
                          </span>
                        )}
                      </div>

                      {req.description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed m-0">
                          {req.description}
                        </p>
                      )}

                      {/* Attached Items List */}
                      {attachedItems.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {attachedItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {item.type === 'photo' && (
                                  <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                                {item.type === 'video' && (
                                  <Video className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                )}
                                {item.type === 'voice' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTogglePlayAudio(
                                        item.id,
                                        item.fileData || item.storageRef
                                      )
                                    }
                                    className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer shrink-0"
                                  >
                                    {playingAudioId === item.id ? (
                                      <Pause className="w-3 h-3" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                                {item.type === 'document' && (
                                  <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                )}
                                {item.type === 'text' && (
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )}

                                <span className="font-semibold text-slate-800 truncate">
                                  {item.fileName || item.title}
                                </span>
                                {item.fileSize && (
                                  <span className="text-[10px] text-slate-400">
                                    • {item.fileSize}
                                  </span>
                                )}
                              </div>

                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftItem(item.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Capture & Upload Controls */}
                      {canEdit && (
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          {/* 📸 Photo: Live camera capture + Gallery upload */}
                          {isPhoto && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMediaCapture(req.id, 'photo')
                                }
                                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Capture live photo with system camera"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Capture Photo</span>
                              </button>

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
                            </>
                          )}

                          {/* 🎥 Video: Live video recording + Gallery upload */}
                          {isVideo && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMediaCapture(req.id, 'video')
                                }
                                className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-xs font-semibold hover:bg-sky-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Record live video with system camera"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Record Live Video</span>
                              </button>

                              <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                                <Upload className="w-3.5 h-3.5 text-sky-600" />
                                <span>Upload Video File</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={e => handleVideoUpload(req.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </>
                          )}

                          {/* 🎙️ Voice: Live mic recording + Audio file upload */}
                          {isVoice && (
                            <>
                              {isRecordingAudio &&
                              recordingTargetReqId === req.id ? (
                                <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg flex items-center gap-2.5 text-xs">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                                  <span className="font-bold text-rose-800">
                                    Recording... 0:
                                    {recordingSeconds < 10
                                      ? `0${recordingSeconds}`
                                      : recordingSeconds}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleStopAudioRecording}
                                    className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-xs hover:bg-rose-700 cursor-pointer"
                                  >
                                    Stop &amp; Save
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartAudioRecording(req.id)
                                    }
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Mic className="w-3.5 h-3.5" />
                                    <span>Record Voice Note</span>
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
                                          const file = files[0];
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
                                              title: file.name,
                                              fileName: file.name,
                                              fileSize: `${Math.round(file.size / 1024)} KB`,
                                              durationSeconds: 30,
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
                                </>
                              )}
                            </>
                          )}

                          {/* 📄 Document upload */}
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

                          {/* 📝 Text response */}
                          {isText && (
                            <textarea
                              rows={2}
                              value={attachedItems[0]?.textResponse || ''}
                              onChange={e =>
                                handleTextObservationChange(
                                  req.id,
                                  e.target.value
                                )
                              }
                              placeholder="Type qualitative observation or data summary..."
                              className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submission Action Box (Assignee) */}
            {canEdit &&
              task.status !== 'In Review' &&
              task.status !== 'Completed' && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Submission Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={submissionNotes}
                      onChange={e => setSubmissionNotes(e.target.value)}
                      placeholder="Add notes for your supervisor explaining the attached evidence..."
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitDeliverablesForReview}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {task.status === 'Changes Requested'
                          ? 'Resubmit Deliverables for Review'
                          : 'Submit Deliverables for Review'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            REVIEW & VERIFICATION GATE (SUPERVISOR / REVIEWER)
        ══════════════════════════════════════════════════════════════════ */}
        {task.status === 'In Review' && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <span className="text-xs sm:text-sm font-bold text-indigo-950">
                  Supervisor Review &amp; Verification Gate
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-800 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Review Pending
              </span>
            </div>

            {isAuthorizedReviewer ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-700 m-0 leading-relaxed">
                  As the designated supervisor (
                  {task.reviewerName || currentUser.name}), verify the attached
                  evidence and approve or return for revisions.
                </p>

                {showReviewActionBox ? (
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-indigo-200">
                    <label className="block text-xs font-semibold text-slate-800">
                      Feedback Comments (Mandatory for revisions)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewFeedbackText}
                      onChange={e => setReviewFeedbackText(e.target.value)}
                      placeholder="Explain what corrections or missing evidence the assignee must provide..."
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewActionBox(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmReviewDecision('Changes Requested')
                        }
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Confirm Revisions Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReviewActionBox(true)}
                      className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Request Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmReviewDecision('Approved')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-200"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Task Completion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600 m-0">
                This task has been submitted for review. Waiting for designated
                reviewer (<strong>{task.reviewerName || 'Supervisor'}</strong>)
                to approve or return.
              </p>
            )}
          </div>
        )}

        {/* Completed Task Notice */}
        {task.status === 'Completed' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Task has been verified and marked as Completed.</span>
          </div>
        )}
      </div>

      {/* Survey Answering Modal */}
      {isSurveyModalOpen && hasSurvey && linkedSurvey && (
        <SurveyFillModal
          survey={linkedSurvey}
          onClose={() => setIsSurveyModalOpen(false)}
          onSuccess={handleSurveySuccess}
        />
      )}

      {/* Live Media Capture Modal (Camera Photo & Video) */}
      <MediaCaptureModal
        isOpen={isMediaCaptureOpen}
        mode={mediaCaptureMode}
        title={
          mediaCaptureMode === 'photo'
            ? 'Task Evidence — Capture Photo with Camera'
            : 'Task Evidence — Record Video with Camera'
        }
        onClose={() => setIsMediaCaptureOpen(false)}
        onCapture={handleMediaCaptured}
      />
    </AppDialog>
  );
};

export default TaskDetailsModal;
