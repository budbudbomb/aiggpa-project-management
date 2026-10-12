import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Flag, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import {
  MasterStore,
  type MilestoneMasterItem,
} from '../../stores/masterStore';
import {
  PageContainer,
  PageHeader,
  TableToolbar,
  DataTable,
  type ColumnDef,
  AppButton,
  StatusBadge,
  ActionIconButton,
  AppDialog,
  TextField,
  SelectField,
  FormActions,
  ErrorState,
} from '../../components';

export const MilestoneMasterPage: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneMasterItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyTypeFilter, setSurveyTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneMasterItem | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sequence, setSequence] = useState<number>(1);
  const [surveyType, setSurveyType] = useState<MilestoneMasterItem['surveyType']>('All');
  const [targetDaysOffset, setTargetDaysOffset] = useState<number>(7);
  const [isRequired, setIsRequired] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = () => {
    setMilestones(MasterStore.getMilestones(true));
  };

  useEffect(() => {
    loadData();
    const handleStoreChange = () => loadData();
    window.addEventListener('aiggpa_master_store_updated', handleStoreChange);
    return () => {
      window.removeEventListener('aiggpa_master_store_updated', handleStoreChange);
    };
  }, []);

  const openCreateModal = () => {
    setEditingMilestone(null);
    const nextSeq = milestones.length > 0 ? Math.max(...milestones.map(m => m.sequence)) + 1 : 1;
    setCode(`MS-${String(nextSeq).padStart(3, '0')}`);
    setName('');
    setDescription('');
    setSequence(nextSeq);
    setSurveyType('All');
    setTargetDaysOffset(7);
    setIsRequired(true);
    setIsActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MilestoneMasterItem) => {
    setEditingMilestone(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description || '');
    setSequence(item.sequence);
    setSurveyType(item.surveyType || 'All');
    setTargetDaysOffset(item.targetDaysOffset || 0);
    setIsRequired(item.isRequired);
    setIsActive(item.isActive);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleToggleActive = (item: MilestoneMasterItem) => {
    MasterStore.toggleMilestoneActive(item.id);
    loadData();
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMessage('Milestone code and name are mandatory.');
      return;
    }

    try {
      MasterStore.saveMilestone({
        id: editingMilestone ? editingMilestone.id : `ms_${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        sequence: Number(sequence) || 1,
        surveyType,
        targetDaysOffset: Number(targetDaysOffset) || 0,
        isRequired,
        isActive,
      });

      loadData();
      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to save milestone. Please try again.');
      }
    }
  };

  const filteredMilestones = milestones
    .filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType =
        surveyTypeFilter === 'All' || item.surveyType === 'All' || item.surveyType === surveyTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => a.sequence - b.sequence);

  const columns: ColumnDef<MilestoneMasterItem>[] = [
    {
      key: 'sequence',
      header: 'Seq',
      width: '65px',
      render: row => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
          {row.sequence}
        </span>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      width: '100px',
      render: row => (
        <span className="font-mono text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Milestone Definition',
      render: row => (
        <div>
          <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            {row.name}
          </div>
          {row.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'surveyType',
      header: 'Survey Scope',
      width: '130px',
      render: row => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {row.surveyType || 'All'}
        </span>
      ),
    },
    {
      key: 'targetDaysOffset',
      header: 'Target Offset',
      width: '120px',
      render: row => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          +{row.targetDaysOffset} days
        </span>
      ),
    },
    {
      key: 'isRequired',
      header: 'Requirement',
      width: '110px',
      render: row => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            row.isRequired
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          {row.isRequired ? 'Mandatory' : 'Optional'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      width: '100px',
      render: row => (
        <StatusBadge
          status={row.isActive ? 'Active' : 'Inactive'}
          variant={row.isActive ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      render: row => (
        <div className="flex items-center gap-1">
          <ActionIconButton
            icon={Edit3}
            title="Edit Milestone"
            onClick={() => openEditModal(row)}
            className="text-slate-600 hover:text-blue-600"
          />
          <ActionIconButton
            icon={row.isActive ? XCircle : CheckCircle2}
            title={row.isActive ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggleActive(row)}
            className={row.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Survey Milestone Master"
        description="Standardize research survey lifecycles, operational progress checkpoints, and delivery milestones."
        breadcrumbs={[
          { label: 'Master Data', path: '/masters/employees' },
          { label: 'Milestone Master' },
        ]}
        actions={
          <AppButton
            variant="primary"
            icon={Plus}
            onClick={openCreateModal}
          >
            Add Milestone
          </AppButton>
        }
      />

      <div className="space-y-4">
        <TableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search milestones by name, code, or description..."
        />

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <DataTable
            data={filteredMilestones}
            columns={columns}
            keyExtractor={item => item.id}
            emptyMessage="No survey milestones configured yet. Click 'Add Milestone' to create one."
          />
        </div>
      </div>

      {/* Create / Edit Milestone Dialog */}
      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMilestone ? 'Edit Survey Milestone' : 'Define Survey Milestone'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMessage && (
            <ErrorState
              title="Validation Error"
              message={errorMessage}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Milestone Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. MS-001"
              required
            />
            <TextField
              label="Sequence Order"
              type="number"
              value={sequence.toString()}
              onChange={e => setSequence(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <TextField
            label="Milestone Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Pilot Dry Run & Questionnaire Validation"
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description & Deliverable Criteria
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what must be accomplished to satisfy this milestone..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Applicable Survey Scope"
              value={surveyType || 'All'}
              onChange={e => setSurveyType(e.target.value as MilestoneMasterItem['surveyType'])}
              options={[
                { value: 'All', label: 'All Survey Types' },
                { value: 'Baseline', label: 'Baseline Surveys' },
                { value: 'Mid-Term', label: 'Mid-Term Evaluation' },
                { value: 'End-Line', label: 'End-Line Surveys' },
                { value: 'Periodic', label: 'Periodic Impact Tracking' },
                { value: 'Ad-Hoc', label: 'Ad-Hoc Quick Studies' },
              ]}
            />

            <TextField
              label="Target Offset (Days from Start)"
              type="number"
              value={targetDaysOffset.toString()}
              onChange={e => setTargetDaysOffset(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 14"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <SelectField
              label="Requirement Level"
              value={isRequired ? 'true' : 'false'}
              onChange={e => setIsRequired(e.target.value === 'true')}
              options={[
                { value: 'true', label: 'Mandatory Milestone' },
                { value: 'false', label: 'Optional Checkpoint' },
              ]}
            />

            <SelectField
              label="Active Status"
              value={isActive ? 'true' : 'false'}
              onChange={e => setIsActive(e.target.value === 'true')}
              options={[
                { value: 'true', label: 'Active (Available for Surveys)' },
                { value: 'false', label: 'Inactive (Archived)' },
              ]}
            />
          </div>

          <div className="pt-2">
            <FormActions
              onCancel={() => setIsModalOpen(false)}
              submitLabel={editingMilestone ? 'Update Milestone' : 'Create Milestone'}
            />
          </div>
        </form>
      </AppDialog>
    </PageContainer>
  );
};

export default MilestoneMasterPage;
