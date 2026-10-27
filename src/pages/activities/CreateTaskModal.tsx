import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityTaskStore,
  type Employee,
  type TaskPriority,
  type TaskChecklistItem,
  type EvidenceRequirement,
  type EvidenceType,
} from '../../stores/activityTaskStore';
import projectStore from '../../stores/projectStore';
import { MasterStore } from '../../stores/masterStore';
import {
  AppDialog,
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  AppButton,
  FormActions,
  ActionIconButton,
  ErrorState,
} from '../../components';
import {
  Plus,
  Trash2,
  Mic,
  Camera,
  Video,
  FileText,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  Users,
  AlertCircle,
} from 'lucide-react';
import SurveyStore from '../../stores/surveyStore';
import type { AdminSurvey, SubtaskType } from '../../stores/types';
import SubtaskMeetingDetailsModal, {
  type MeetingDetailsData,
} from './SubtaskMeetingDetailsModal';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  onTaskCreated: (taskId: string) => void;
  onOpenRelationshipsModal: () => void;
  preselectedSurveyId?: string | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTaskCreated,
  onOpenRelationshipsModal,
  preselectedSurveyId,
}) => {
  const projects = projectStore.getProjects();
  const eligibleAssignees = ActivityTaskStore.getEligibleAssignees(currentUser);
  const allEmployees = ActivityTaskStore.getEmployees();
  const surveys = SurveyStore.getSurveys();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'PRJ-01');
  const [activityId, setActivityId] = useState('');
  const [assigneeId, setAssigneeId] = useState(eligibleAssignees[0]?.id || '');
  const [reviewerId, setReviewerId] = useState(currentUser.id);
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  // Linked Survey State
  const [linkedSurveyId, setLinkedSurveyId] = useState<string>('');
  const [surveyError, setSurveyError] = useState<string | null>(null);

  // Assignment Mode State: Individual vs Group
  const [assignmentMode, setAssignmentMode] = useState<'Individual' | 'Group'>(
    'Individual'
  );
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const activities = MasterStore.getActivities(projectId);
  const projectAllocations = MasterStore.getProjectAllocations(projectId);
  const allocatedEmpIds = useMemo(
    () => new Set(projectAllocations.map(a => a.employeeId)),
    [projectAllocations]
  );

  // Eligible reviewers (cannot be the assignee)
  const eligibleReviewers = useMemo(
    () =>
      allEmployees.filter(
        e =>
          e.role === 'Center Head' ||
          e.role === 'Project Manager' ||
          e.role === 'Research Analyst' ||
          e.id === currentUser.reportsTo ||
          e.id === currentUser.id
      ),
    [allEmployees, currentUser]
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextWeekStr);
  const [requiresReview, setRequiresReview] = useState(true);
  const [labelsInput, setLabelsInput] = useState('');
  const [attachmentsInput, setAttachmentsInput] = useState('');

  // Selected survey computed object
  const selectedSurvey: AdminSurvey | null = useMemo(() => {
    if (!linkedSurveyId) return null;
    return surveys.find(s => s.id === linkedSurveyId) || null;
  }, [linkedSurveyId, surveys]);

  // Synchronize when modal opens or preselectedSurveyId changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedSurveyId) {
        const found = surveys.find(s => s.id === preselectedSurveyId);
        if (found) {
          setLinkedSurveyId(found.id);
          setSurveyError(null);
          setTitle(`Field Survey: ${found.title}`);
          if (found.projectId) {
            setProjectId(found.projectId);
          }
          // Pre-populate standard survey evidence pack
          applyEvidencePreset('survey');
        } else {
          setLinkedSurveyId('');
          setSurveyError(
            `Specified Survey ID "${preselectedSurveyId}" was not found.`
          );
        }
      } else {
        setLinkedSurveyId('');
        setSurveyError(null);
      }
    }
  }, [isOpen, preselectedSurveyId]);

  // When selectedSurvey changes and has a project, enforce lock
  useEffect(() => {
    if (selectedSurvey?.projectId) {
      setProjectId(selectedSurvey.projectId);
    }
  }, [selectedSurvey]);

  // Checklist
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([
    {
      id: 'cl-1',
      text: 'Initial briefing and methodology orientation',
      completed: false,
    },
    {
      id: 'cl-2',
      text: 'Field data verification and evidence collection',
      completed: false,
    },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [subtaskType, setSubtaskType] = useState<SubtaskType>('standard');
  const [subtaskSurveyId, setSubtaskSurveyId] = useState('');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetailsData>({
    meetingUrl: '',
    meetingDuration: '45 mins',
    meetingDescription: '',
  });

  // Configurable Evidence Requirements
  const [evidenceRequirements, setEvidenceRequirements] = useState<
    EvidenceRequirement[]
  >([
    {
      id: 'req-init-1',
      type: 'photo',
      title: 'Geotagged Fieldwork Photographs',
      description:
        'High-resolution photographs of field activities and respondent interaction.',
      required: true,
      minCount: 2,
      instructions:
        'Capture at least 2 clear field photos with visible location landmarks.',
    },
    {
      id: 'req-init-2',
      type: 'voice',
      title: 'Voice Note / Audio Briefing',
      description:
        '30-90 second voice memo summarizing key observations and findings.',
      required: true,
      maxDurationSeconds: 120,
      instructions: 'Record voice note immediately after completing fieldwork.',
    },
    {
      id: 'req-init-3',
      type: 'text',
      title: 'Written Field Report / Observations',
      description:
        'Written qualitative notes on findings, bottlenecks, and local context.',
      required: true,
      instructions:
        'Detail all key field observations before final submission.',
    },
  ]);

  // Add custom requirement state
  const [showAddCustomReq, setShowAddCustomReq] = useState(false);
  const [customReqType, setCustomReqType] = useState<EvidenceType>('photo');
  const [customReqTitle, setCustomReqTitle] = useState('');
  const [customReqRequired, setCustomReqRequired] = useState(true);
  const [customReqMinCount, setCustomReqMinCount] = useState<number>(1);
  const [customReqInstructions, setCustomReqInstructions] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eligibleAssignees.length > 0 && !assigneeId) {
      setAssigneeId(eligibleAssignees[0].id);
    }
  }, [eligibleAssignees, assigneeId]);

  // Apply predefined evidence preset
  const applyEvidencePreset = (
    preset: 'field' | 'survey' | 'audit' | 'analysis' | 'clear'
  ) => {
    switch (preset) {
      case 'field':
        setEvidenceRequirements([
          {
            id: `req-${Date.now()}-1`,
            type: 'photo',
            title: 'Geotagged Field Photographs (Min 2)',
            required: true,
            minCount: 2,
            instructions:
              'Capture at least 2 clear field photos with GPS timestamp.',
          },
          {
            id: `req-${Date.now()}-2`,
            type: 'voice',
            title: 'Field Observation Audio Memo',
            required: true,
            maxDurationSeconds: 120,
            instructions:
              'Record 30-90 second voice memo summarizing respondent feedback.',
          },
          {
            id: `req-${Date.now()}-3`,
            type: 'text',
            title: 'Written Observation Summary',
            required: true,
            instructions: 'Provide qualitative notes and field challenges.',
          },
        ]);
        break;
      case 'survey':
        setEvidenceRequirements([
          {
            id: `req-${Date.now()}-1`,
            type: 'photo',
            title: 'Household Interview Photographs (Min 3)',
            required: true,
            minCount: 3,
            instructions:
              'Photograph enumerator and respondent with tablet questionnaire visible.',
          },
          {
            id: `req-${Date.now()}-2`,
            type: 'voice',
            title: 'Respondent Audio Feedback Clip',
            required: true,
            instructions:
              'Audio recording of community member sharing experience.',
          },
          {
            id: `req-${Date.now()}-3`,
            type: 'document',
            title: 'Survey Response Export (CSV/Excel)',
            required: true,
            acceptedFileTypes: ['.csv', '.xlsx'],
            instructions: 'Export completed response matrix from tablet.',
          },
          {
            id: `req-${Date.now()}-4`,
            type: 'text',
            title: 'Enumerator Fieldwork Log',
            required: true,
            instructions:
              'Detail interview coverage, refusal rate, and skip logic remarks.',
          },
        ]);
        break;
      case 'audit':
        setEvidenceRequirements([
          {
            id: `req-${Date.now()}-1`,
            type: 'photo',
            title: 'Facility Infrastructure & Equipment Photos (Min 2)',
            required: true,
            minCount: 2,
            instructions:
              'Take clear photos of facility exterior and critical equipment.',
          },
          {
            id: `req-${Date.now()}-2`,
            type: 'voice',
            title: 'Facility Staff / Doctor Audio Interview',
            required: true,
            instructions:
              'Record short conversation with on-duty staff on operational bottlenecks.',
          },
          {
            id: `req-${Date.now()}-3`,
            type: 'text',
            title: 'Infrastructure Functional Log',
            required: true,
            instructions:
              'List equipment make, serial numbers, and functional status.',
          },
        ]);
        break;
      case 'analysis':
        setEvidenceRequirements([
          {
            id: `req-${Date.now()}-1`,
            type: 'document',
            title: 'Draft Report / Working Paper Document',
            required: true,
            acceptedFileTypes: ['.pdf', '.docx'],
            instructions: 'Upload verified draft paper with citations.',
          },
          {
            id: `req-${Date.now()}-2`,
            type: 'text',
            title: 'Executive Analytical Summary',
            required: true,
            instructions:
              'Highlight key statistical takeaways and policy recommendations.',
          },
        ]);
        break;
      case 'clear':
        setEvidenceRequirements([]);
        break;
    }
  };

  const handleAddCustomRequirement = () => {
    if (!customReqTitle.trim()) return;
    const newReq: EvidenceRequirement = {
      id: `req-${Date.now()}`,
      type: customReqType,
      title: customReqTitle.trim(),
      required: customReqRequired,
      minCount: customReqType === 'photo' ? customReqMinCount || 1 : undefined,
      instructions: customReqInstructions.trim() || undefined,
    };
    setEvidenceRequirements(prev => [...prev, newReq]);
    setCustomReqTitle('');
    setCustomReqInstructions('');
    setShowAddCustomReq(false);
  };

  const handleRemoveEvidenceReq = (id: string) => {
    setEvidenceRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleAddChecklistItem = () => {
    if (subtaskType === 'survey') {
      if (!subtaskSurveyId) return;
      const surveyMatch = surveys.find(s => s.id === subtaskSurveyId);
      const title = surveyMatch ? surveyMatch.name : 'Survey Subtask';
      setChecklist(prev => [
        ...prev,
        {
          id: `cl-${Date.now()}`,
          text: title,
          completed: false,
          type: 'survey',
          surveyId: subtaskSurveyId,
        },
      ]);
      setSubtaskSurveyId('');
      return;
    }

    if (subtaskType === 'meeting') {
      if (!newChecklistText.trim()) return;
      setChecklist(prev => [
        ...prev,
        {
          id: `cl-${Date.now()}`,
          text: newChecklistText.trim(),
          completed: false,
          type: 'meeting',
          meetingUrl: meetingDetails.meetingUrl,
          meetingDuration: meetingDetails.meetingDuration,
          meetingDescription: meetingDetails.meetingDescription,
        },
      ]);
      setNewChecklistText('');
      setMeetingDetails({
        meetingUrl: '',
        meetingDuration: '45 mins',
        meetingDescription: '',
      });
      return;
    }

    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      {
        id: `cl-${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false,
        type: 'standard',
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!projectId) {
      newErrors.project = 'Project is required';
    } else if (
      selectedSurvey?.projectId &&
      projectId !== selectedSurvey.projectId
    ) {
      newErrors.project = `Project must match the linked survey's project (${selectedSurvey.projectName || selectedSurvey.projectId})`;
    }

    if (assignmentMode === 'Group' && !groupName.trim()) {
      newErrors.groupName =
        'Group / Field Team Name is required for group tasks';
    }

    if (!assigneeId) {
      newErrors.assignee =
        assignmentMode === 'Group'
          ? 'Designated Team Lead is required'
          : 'Assignee is required';
    }
    if (requiresReview && !reviewerId) {
      newErrors.reviewer = 'Designated reviewer is required';
    }
    if (requiresReview && reviewerId === assigneeId) {
      newErrors.reviewer = 'Assignee cannot be their own designated reviewer';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignedEmployee = allEmployees.find(e => e.id === assigneeId);
    const assignedProject = projects.find(p => p.id === projectId);
    const assignedReviewer = allEmployees.find(e => e.id === reviewerId);
    const linkedActivity = activities.find(a => a.id === activityId);

    if (!assignedEmployee || !assignedProject || !assignedReviewer) {
      setErrors({ form: 'Invalid reference selected' });
      return;
    }

    const labels = labelsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const attachments = attachmentsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const groupMembers =
      assignmentMode === 'Group'
        ? Array.from(new Set([assigneeId, ...selectedMemberIds]))
        : undefined;

    const created = ActivityTaskStore.createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      projectName: assignedProject.name,
      surveyId: linkedSurveyId || undefined,
      surveyTitle: selectedSurvey ? selectedSurvey.title : undefined,
      assignmentMode,
      groupName: assignmentMode === 'Group' ? groupName.trim() : undefined,
      memberIds: groupMembers,
      activityId: activityId || undefined,
      activityName: linkedActivity ? linkedActivity.name : undefined,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      assigneeId,
      assigneeName: assignedEmployee.name,
      assigneeRole: assignedEmployee.role,
      reviewerId: assignedReviewer.id,
      reviewerName: assignedReviewer.name,
      reviewerRole: assignedReviewer.role,
      priority,
      status: 'To Do',
      startDate,
      dueDate,
      requiresReview,
      reviewStatus: null,
      reviewFeedback: null,
      labels:
        labels.length > 0
          ? labels
          : linkedSurveyId
            ? ['Field Survey']
            : ['General'],
      attachments,
      checklist,
      comments: [],
      evidenceRequirements,
      currentEvidenceDraft: [],
      submissions: [],
    });

    if (linkedSurveyId) {
      SurveyStore.updateSurvey(linkedSurveyId, { isAllocatedAsTask: true });
    }

    onTaskCreated(created.id);
    onClose();
  };

  // If user is Intern, restrict creation
  if (currentUser.role === 'Intern') {
    return (
      <AppDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Task Creation Restricted"
        subtitle="Organizational Hierarchy Policy"
        maxWidth="md"
        footer={
          <AppButton variant="primary" onClick={onClose}>
            Understood
          </AppButton>
        }
      >
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Interns do not create tasks</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed m-0">
            In accordance with AIGGPA ERP hierarchy guidelines, interns are
            responsible for executing assigned tasks, completing fieldwork,
            capturing mandatory evidence (photos, voice notes, documents), and
            submitting deliverables for supervisor verification.
          </p>
          <p className="text-xs text-slate-600 m-0">
            New tasks must be created and assigned by your supervising Fellow or
            Project Manager.
          </p>
        </div>
      </AppDialog>
    );
  }

  const projectOptions = useMemo(
    () => projects.map(p => ({ value: p.id, label: p.name })),
    [projects]
  );

  const activityOptions = useMemo(
    () => [
      { value: '', label: '-- General / Unlinked Milestone --' },
      ...activities.map(a => ({
        value: a.id,
        label: `[${a.code}] ${a.name}`,
      })),
    ],
    [activities]
  );

  const assigneeOptions = useMemo(
    () =>
      eligibleAssignees.map(e => {
        const isRoster = allocatedEmpIds.has(e.id);
        return {
          value: e.id,
          label: `${isRoster ? '⭐ [Project Roster] ' : ''}${e.name} — ${e.role} (${e.designation})`,
        };
      }),
    [eligibleAssignees, allocatedEmpIds]
  );

  const reviewerOptions = useMemo(
    () =>
      eligibleReviewers.map(r => ({
        value: r.id,
        label: `${r.name} — ${r.role} ${r.id === currentUser.id ? '(You)' : ''} ${r.id === assigneeId ? '(Assignee cannot review)' : ''}`,
        disabled: r.id === assigneeId,
      })),
    [eligibleReviewers, currentUser, assigneeId]
  );

  const getEvidenceIcon = (type: EvidenceType) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-blue-600" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-emerald-600" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-600" />;
      case 'document':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />;
      case 'text':
      default:
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Activity / Task"
      subtitle={`Logged in as ${currentUser.name} (${currentUser.role})`}
      maxWidth="3xl"
      footer={
        <FormActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel="Create & Publish Task"
          submitDisabled={eligibleAssignees.length === 0}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && <ErrorState message={errors.form} />}

        <TextField
          label="Task Title"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Conduct Block Health Facility Surveys in Ujjain Urban PHCs"
          errorMessage={errors.title}
        />

        <TextAreaField
          label="Description & Expected Deliverables"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Provide background, field procedures, and expected deliverables for the assigned employee..."
          rows={3}
        />

        {/* ── Section B: Linked Field Survey ── */}
        {surveyError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{surveyError}</span>
            </div>
            <AppButton
              variant="ghost"
              size="xs"
              onClick={() => setSurveyError(null)}
            >
              Dismiss
            </AppButton>
          </div>
        )}

        {selectedSurvey ? (
          <div className="p-3 bg-blue-50/70 border border-blue-200/90 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-950 block">
                    Linked Field Survey
                  </span>
                  <span className="text-[11px] text-blue-800 font-semibold">
                    {selectedSurvey.title}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {selectedSurvey.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLinkedSurveyId('');
                    setSurveyError(null);
                  }}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold px-1.5 py-0.5 rounded hover:bg-white transition-colors"
                >
                  Unlink
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2 rounded-lg border border-blue-100">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Survey Project
                </span>
                <span className="text-slate-800 font-bold truncate block">
                  {selectedSurvey.projectName ||
                    selectedSurvey.projectId ||
                    'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Target Response
                </span>
                <span className="text-slate-800 font-bold block">
                  {selectedSurvey.participantsRequired || 100} respondents
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Survey Dates
                </span>
                <span className="text-slate-800 font-bold block truncate">
                  {selectedSurvey.startDate || '—'} &rarr;{' '}
                  {selectedSurvey.endDate || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Questionnaire
                </span>
                <span className="text-slate-800 font-bold block">
                  {selectedSurvey.questions?.length || 0} Questions
                </span>
              </div>
            </div>
          </div>
        ) : (
          <SelectField
            label="Link to Field Survey (Optional)"
            options={[
              { value: '', label: '-- No Survey (Ordinary Task) --' },
              ...surveys.map(s => ({
                value: s.id,
                label: `[${s.id}] ${s.title}${s.projectId ? ` (${s.projectId})` : ''}`,
              })),
            ]}
            value={linkedSurveyId}
            onChange={val => {
              setLinkedSurveyId(val);
              setSurveyError(null);
              const s = surveys.find(item => item.id === val);
              if (s?.projectId) {
                setProjectId(s.projectId);
              }
            }}
            helperText="Optionally link this task to a field survey to monitor field team execution"
          />
        )}

        {/* ── Section C: Project Association ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <SelectField
              label="Project / Scheme"
              required
              options={projectOptions}
              value={projectId}
              onChange={val => {
                if (!selectedSurvey?.projectId) {
                  setProjectId(val);
                  setActivityId('');
                }
              }}
              disabled={Boolean(selectedSurvey?.projectId)}
              errorMessage={errors.project}
              helperText={
                selectedSurvey?.projectId
                  ? `🔒 Locked to survey project (${selectedSurvey.projectName || selectedSurvey.projectId})`
                  : undefined
              }
            />
          </div>

          <SelectField
            label="Activity / Milestone (WBS)"
            options={activityOptions}
            value={activityId}
            onChange={setActivityId}
            helperText="Link task to project milestone WBS"
          />
        </div>

        {/* ── Section D: Assignment Mode & Team Selection ── */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            Task Assignment Mode *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setAssignmentMode('Individual')}
              className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                assignmentMode === 'Individual'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Individual Task</span>
            </button>
            <button
              type="button"
              onClick={() => setAssignmentMode('Group')}
              className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                assignmentMode === 'Group'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group Task (Team Unit)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            {assignmentMode === 'Individual'
              ? 'Creates an independent task assigned to a single team member.'
              : 'Creates one canonical task assigned to a team unit where the designated Lead submits deliverables on behalf of the group.'}
          </p>
        </div>

        {assignmentMode === 'Group' && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <TextField
              label="Group / Field Team Name"
              required
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g., Ujjain Block Field Enumeration Team Alpha"
              errorMessage={errors.groupName}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Include Group Members (From Subordinates)
              </label>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 max-h-36 overflow-y-auto space-y-1.5">
                {eligibleAssignees.map(emp => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedMemberIds.includes(emp.id) ||
                        emp.id === assigneeId
                      }
                      disabled={emp.id === assigneeId}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMemberIds(prev => [...prev, emp.id]);
                        } else {
                          setSelectedMemberIds(prev =>
                            prev.filter(id => id !== emp.id)
                          );
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">
                      {emp.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({emp.role} — {emp.designation})
                    </span>
                    {emp.id === assigneeId && (
                      <span className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        Designated Lead
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {eligibleAssignees.length === 0 ? (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
            <span>No reporting subordinates assigned yet.</span>
            <AppButton
              variant="outline"
              size="xs"
              onClick={() => {
                onClose();
                onOpenRelationshipsModal();
              }}
            >
              Configure Hierarchy
            </AppButton>
          </div>
        ) : (
          <SelectField
            label={
              assignmentMode === 'Group'
                ? 'Designated Team Lead (Primary Submitter) *'
                : 'Assignee (Eligible Subordinates) *'
            }
            required
            options={assigneeOptions}
            value={assigneeId}
            onChange={val => {
              setAssigneeId(val);
              if (reviewerId === val) {
                const fallback = eligibleReviewers.find(r => r.id !== val);
                if (fallback) setReviewerId(fallback.id);
              }
            }}
            errorMessage={errors.assignee}
            helperText={
              assignmentMode === 'Group'
                ? 'The Team Lead is accountable for submitting deliverables and evidence for verification'
                : '⭐ Indicates team member allocated on Project Roster'
            }
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Review Gate & Approval
            </label>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <CheckboxField
                label="Requires Supervisor Review"
                description="Task cannot be completed without formal sign-off"
                checked={requiresReview}
                onChange={setRequiresReview}
              />
            </div>
          </div>

          {requiresReview && (
            <SelectField
              label="Designated Reviewer"
              required
              options={reviewerOptions}
              value={reviewerId}
              onChange={setReviewerId}
              errorMessage={errors.reviewer}
              helperText="Assignee cannot review own work"
            />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            EVIDENCE CONFIGURATION PANEL (TASK-SPECIFIC MANDATORY EVIDENCE)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-slate-50/90 rounded-xl border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-slate-900 m-0">
                  Mandatory Submission Evidence Requirements (
                  {evidenceRequirements.length})
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                Configure which evidence types the intern must attach before
                work can be submitted.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Presets:
              </span>
              <button
                type="button"
                onClick={() => applyEvidencePreset('field')}
                className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                📍 Field Visit
              </button>
              <button
                type="button"
                onClick={() => applyEvidencePreset('survey')}
                className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                📋 Survey
              </button>
              <button
                type="button"
                onClick={() => applyEvidencePreset('audit')}
                className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                🏥 Audit
              </button>
              <button
                type="button"
                onClick={() => applyEvidencePreset('analysis')}
                className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                📑 Report
              </button>
            </div>
          </div>

          {/* Evidence requirements list */}
          <div className="space-y-2">
            {evidenceRequirements.length === 0 ? (
              <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No evidence requirements configured. Click below to add
                mandatory requirements.
              </div>
            ) : (
              evidenceRequirements.map((req, idx) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between gap-3 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs text-xs"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getEvidenceIcon(req.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">
                          {req.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            req.required
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.required
                            ? req.type === 'photo' && req.minCount
                              ? `Required (Min ${req.minCount})`
                              : 'Mandatory'
                            : 'Optional'}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {req.type}
                        </span>
                      </div>
                      {req.instructions && (
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5 truncate">
                          {req.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <ActionIconButton
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    tooltip="Remove requirement"
                    variant="danger"
                    onClick={() => handleRemoveEvidenceReq(req.id)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Add custom requirement toggle / form */}
          {showAddCustomReq ? (
            <div className="p-3 bg-white rounded-lg border border-blue-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Add Custom Evidence Requirement
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCustomReq(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Evidence Type
                  </label>
                  <select
                    value={customReqType}
                    onChange={e =>
                      setCustomReqType(e.target.value as EvidenceType)
                    }
                    className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="photo">📷 Photograph / Image</option>
                    <option value="voice">
                      🎙️ Voice Note / Audio Recording
                    </option>
                    <option value="video">🎥 Video Recording</option>
                    <option value="document">
                      📄 Document / Dataset Attachment
                    </option>
                    <option value="text">
                      📝 Written Report / Field Notes
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Requirement Title
                  </label>
                  <input
                    type="text"
                    value={customReqTitle}
                    onChange={e => setCustomReqTitle(e.target.value)}
                    placeholder="e.g., Geotagged water sample testing kit photo"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customReqType === 'photo' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Minimum Photos Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={customReqMinCount}
                      onChange={e =>
                        setCustomReqMinCount(Number(e.target.value) || 1)
                      }
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Capture Instructions for Submitter
                  </label>
                  <input
                    type="text"
                    value={customReqInstructions}
                    onChange={e => setCustomReqInstructions(e.target.value)}
                    placeholder="e.g., Must photograph front gate and meter in daylight"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customReqRequired}
                    onChange={e => setCustomReqRequired(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                  />
                  <span>Mandatory (Blocks submission if missing)</span>
                </label>

                <AppButton
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={handleAddCustomRequirement}
                  disabled={!customReqTitle.trim()}
                >
                  Save Requirement
                </AppButton>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCustomReq(true)}
              className="w-full py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Evidence Requirement</span>
            </button>
          )}
        </div>

        <SelectField
          label="Priority Level"
          options={[
            { value: 'Low', label: 'Low Priority' },
            { value: 'Medium', label: 'Medium Priority' },
            { value: 'High', label: 'High Priority' },
            {
              value: 'Critical',
              label: 'Critical Priority (Immediate Attention)',
            },
          ]}
          value={priority}
          onChange={val => setPriority(val as TaskPriority)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <TextField
            label="Due Date"
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            errorMessage={errors.dueDate}
          />
        </div>

        {/* Checklist & Key Subtasks */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Checklist / Key Subtasks ({checklist.length})
            </label>
            {/* Subtask Type Selector Pills */}
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

          {/* Subtask items list */}
          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>

                {item.type === 'survey' ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                    📋 Survey
                  </span>
                ) : item.type === 'meeting' ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0 flex items-center gap-1">
                    <Video className="w-3 h-3 text-blue-600" />
                    Meeting ({item.meetingDuration || '45m'})
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    📌 Standard
                  </span>
                )}

                <span className="flex-1 text-slate-800 font-medium truncate">
                  {item.text}
                </span>

                {item.meetingUrl && (
                  <span
                    className="text-[10px] text-blue-600 truncate max-w-[120px] font-medium"
                    title={item.meetingUrl}
                  >
                    🔗 Link attached
                  </span>
                )}

                <ActionIconButton
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  tooltip="Remove item"
                  variant="danger"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                />
              </div>
            ))}
          </div>

          {/* Dynamic Input Control based on selected subtask type */}
          {subtaskType === 'survey' ? (
            <div className="flex items-center gap-2">
              <select
                value={subtaskSurveyId}
                onChange={e => setSubtaskSurveyId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium cursor-pointer"
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
                onClick={handleAddChecklistItem}
              >
                Add Survey Subtask
              </AppButton>
            </div>
          ) : subtaskType === 'meeting' ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <TextField
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Meeting title (e.g. Weekly Governance Sync)..."
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  meetingDetails.meetingUrl || meetingDetails.meetingDescription
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
                disabled={!newChecklistText.trim()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddChecklistItem}
              >
                Add
              </AppButton>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <TextField
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Type checklist milestone..."
                className="flex-1"
              />
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={!newChecklistText.trim()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddChecklistItem}
              >
                Add
              </AppButton>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Labels / Tags"
            value={labelsInput}
            onChange={e => setLabelsInput(e.target.value)}
            placeholder="Fieldwork, Health, Ujjain"
            helperText="Comma-separated tags"
          />
          <TextField
            label="Reference Attachments"
            value={attachmentsInput}
            onChange={e => setAttachmentsInput(e.target.value)}
            placeholder="Route_Map.pdf, Sample_Format.xlsx"
            helperText="Document filenames"
          />
        </div>
      </form>

      <SubtaskMeetingDetailsModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        initialData={meetingDetails}
        onSave={data => setMeetingDetails(data)}
      />
    </AppDialog>
  );
};

export default CreateTaskModal;
