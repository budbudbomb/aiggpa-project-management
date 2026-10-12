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
} from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  onTaskCreated: (taskId: string) => void;
  onOpenRelationshipsModal: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTaskCreated,
  onOpenRelationshipsModal,
}) => {
  const projects = projectStore.getProjects();
  const eligibleAssignees = ActivityTaskStore.getEligibleAssignees(currentUser);
  const allEmployees = ActivityTaskStore.getEmployees();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'PRJ-01');
  const [activityId, setActivityId] = useState('');
  const [assigneeId, setAssigneeId] = useState(eligibleAssignees[0]?.id || '');
  const [reviewerId, setReviewerId] = useState(currentUser.id);
  const [priority, setPriority] = useState<TaskPriority>('Medium');

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
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      {
        id: `cl-${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false,
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
    }
    if (!assigneeId) {
      newErrors.assignee = 'Assignee is required';
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

    const created = ActivityTaskStore.createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      projectName: assignedProject.name,
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
      labels: labels.length > 0 ? labels : ['General'],
      attachments,
      checklist,
      comments: [],
      evidenceRequirements,
      currentEvidenceDraft: [],
      submissions: [],
    });

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            label="Project / Scheme"
            required
            options={projectOptions}
            value={projectId}
            onChange={val => {
              setProjectId(val);
              setActivityId('');
            }}
          />

          <SelectField
            label="Activity / Milestone (WBS)"
            options={activityOptions}
            value={activityId}
            onChange={setActivityId}
            helperText="Link task to project milestone WBS"
          />
        </div>

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
            label="Assignee (Eligible Subordinates)"
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
            helperText="⭐ Indicates team member allocated on Project Roster"
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

        {/* Checklist */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Checklist / Key Subtasks ({checklist.length})
          </label>
          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-slate-800">{item.text}</span>
                <ActionIconButton
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  tooltip="Remove item"
                  variant="danger"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                />
              </div>
            ))}
          </div>

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
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddChecklistItem}
            >
              Add
            </AppButton>
          </div>
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
    </AppDialog>
  );
};

export default CreateTaskModal;
