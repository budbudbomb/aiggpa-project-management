import React, { useState, useMemo } from 'react';
import { MasterStore, type CenterMasterItem } from '../../stores/masterStore';
import { ActivityTaskStore } from '../../stores/activityTaskStore';
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
  TextAreaField,
  SelectField,
  FormActions,
  ErrorState,
} from '../../components';
import { Plus, Landmark, Edit2 } from 'lucide-react';

export default function CenterMasterPage(): React.ReactElement {
  const [centers, setCenters] = useState<CenterMasterItem[]>(() =>
    MasterStore.getCenters()
  );
  const employees = ActivityTaskStore.getEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formHeadId, setFormHeadId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setCenters([...MasterStore.getCenters()]);
  };

  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.isActive) ||
        (statusFilter === 'inactive' && !c.isActive);

      return matchSearch && matchStatus;
    });
  }, [centers, searchTerm, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormCode('');
    setFormName('');
    setFormHeadId(employees[0]?.id || '');
    setFormDesc('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CenterMasterItem) => {
    setEditingId(c.id);
    setFormCode(c.code);
    setFormName(c.name);
    setFormHeadId(c.headEmployeeId || '');
    setFormDesc(c.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formCode.trim()) {
      setFormError('Center code is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Center name is required.');
      return;
    }

    const headEmp = employees.find(e => e.id === formHeadId);

    MasterStore.saveCenter({
      id: editingId || undefined,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      headEmployeeId: formHeadId || null,
      headEmployeeName: headEmp?.name || undefined,
      description: formDesc.trim(),
      isActive: true,
    });

    showToast(
      editingId
        ? `Updated center "${formName}".`
        : `Created center "${formName}".`
    );
    refreshData();
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    MasterStore.toggleCenterActive(id);
    refreshData();
    showToast('Center status toggled.');
  };

  const employeeOptions = useMemo(() => {
    return employees.map(e => ({
      value: e.id,
      label: `${e.name} (${e.role} - ${e.designation})`,
    }));
  }, [employees]);

  const columns: ColumnDef<CenterMasterItem>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '110px',
      render: c => (
        <span className="font-semibold text-blue-900 font-mono text-xs">
          {c.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Center Name & Domain',
      render: c => (
        <div>
          <div className="font-medium text-slate-900">{c.name}</div>
          {c.description && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {c.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'headEmployee',
      header: 'Designated Center Head',
      render: c => (
        <div className="text-xs">
          {c.headEmployeeName ? (
            <span className="font-medium text-slate-800">
              {c.headEmployeeName}
            </span>
          ) : (
            <span className="text-slate-400 italic">Not Assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: c => (
        <StatusBadge
          status={c.isActive}
          onClick={() => handleToggleActive(c.id)}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      align: 'right',
      render: c => (
        <ActionIconButton
          icon={<Edit2 className="w-4 h-4" />}
          tooltip="Edit Center"
          onClick={() => openEditModal(c)}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      <PageHeader
        title="Research Centers & Departments"
        subtitle="Manage AIGGPA policy research centers, codes, leadership, and institutional domains"
        icon={<Landmark className="w-5 h-5" />}
        breadcrumbs={[
          { label: 'Master Data Management' },
          { label: 'Research Centers' },
        ]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Research Center
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search research centers..."
        totalCount={centers.length}
        filteredCount={filteredCenters.length}
        itemLabel="centers"
        filters={
          <div className="flex items-center gap-1.5 text-xs">
            <AppButton
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setStatusFilter('all')}
            >
              All
            </AppButton>
            <AppButton
              variant={statusFilter === 'active' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </AppButton>
            <AppButton
              variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive
            </AppButton>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filteredCenters}
        emptyMessage="No research centers found matching search criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Research Center' : 'Add Research Center'}
        subtitle="Manage center acronym, thematic description, and assigned head"
        maxWidth="md"
        footer={
          <FormActions
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            submitLabel={editingId ? 'Save Changes' : 'Create Center'}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorState message={formError} />

          <TextField
            label="Center Code / Acronym"
            required
            value={formCode}
            onChange={e => setFormCode(e.target.value)}
            placeholder="e.g. CETI, CHN, CHRT"
            helperText="Short uppercase code"
          />

          <TextField
            label="Center Full Name"
            required
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Centre for Economy, Trade & Innovation"
          />

          <SelectField
            label="Designated Center Head"
            options={employeeOptions}
            value={formHeadId}
            onChange={setFormHeadId}
            placeholder="Select Center Head..."
            helperText="Center head oversees project governance and task review escalations"
          />

          <TextAreaField
            label="Thematic Focus & Description"
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Key policy domains, research initiatives, evaluation scopes..."
            rows={3}
          />
        </form>
      </AppDialog>
    </PageContainer>
  );
}
