import React, { useState, useEffect } from 'react';
import { Plus, Edit3, LifeBuoy, Clock } from 'lucide-react';
import {
  MasterStore,
  type GrievanceCategoryItem,
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

export const GrievanceCategoryMasterPage: React.FC = () => {
  const [categories, setCategories] = useState<GrievanceCategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<GrievanceCategoryItem | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [slaHours, setSlaHours] = useState<number>(48);
  const [defaultPriority, setDefaultPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent' | 'Low' | 'Medium' | 'High' | 'Urgent'
  >('medium');
  const [targetRole, setTargetRole] = useState('Center Head');
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = () => {
    setCategories(MasterStore.getGrievanceCategories(true));
  };

  useEffect(() => {
    loadData();
    const handleStoreChange = () => loadData();
    window.addEventListener('aiggpa_master_store_updated', handleStoreChange);
    return () =>
      window.removeEventListener(
        'aiggpa_master_store_updated',
        handleStoreChange
      );
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCode(`GC-${String(categories.length + 1).padStart(3, '0')}`);
    setName('');
    setSlaHours(48);
    setDefaultPriority('medium');
    setTargetRole('Center Head');
    setIsActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: GrievanceCategoryItem) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name || cat.label || '');
    setSlaHours(cat.slaHours || 48);
    setDefaultPriority(cat.defaultPriority || 'medium');
    setTargetRole(cat.targetRole || 'Center Head');
    setIsActive(cat.isActive);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMessage('Category code and title/name are mandatory.');
      return;
    }

    try {
      MasterStore.saveGrievanceCategory({
        id: editingCategory ? editingCategory.id : `gc_${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        label: name.trim(),
        slaHours: Number(slaHours) || 48,
        defaultPriority,
        targetRole,
        isActive,
      });

      loadData();
      setIsModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving category';
      setErrorMessage(msg);
    }
  };

  const filteredCategories = categories.filter(
    c =>
      (c.name || c.label || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<GrievanceCategoryItem>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '120px',
      render: cat => (
        <span className="font-mono font-semibold text-blue-900 text-xs">
          {cat.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Category Name',
      render: cat => (
        <span className="font-medium text-slate-900">
          {cat.name || cat.label}
        </span>
      ),
    },
    {
      key: 'slaHours',
      header: 'Resolution SLA',
      width: '140px',
      render: cat => (
        <span className="inline-flex items-center gap-1 text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          <Clock className="w-3 h-3 text-slate-500" />
          {cat.slaHours || 48}h
        </span>
      ),
    },
    {
      key: 'defaultPriority',
      header: 'Default Priority',
      width: '140px',
      render: cat => <StatusBadge status={cat.defaultPriority} />,
    },
    {
      key: 'targetRole',
      header: 'Designated Resolver',
      render: cat => (
        <span className="text-xs text-slate-600 font-medium">
          {cat.targetRole || 'Center Head'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      width: '120px',
      render: cat => (
        <StatusBadge
          status={cat.isActive}
          onClick={() => {
            MasterStore.toggleGrievanceCategoryActive(cat.id);
            loadData();
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      align: 'right',
      render: cat => (
        <ActionIconButton
          icon={<Edit3 className="w-4 h-4" />}
          tooltip="Edit Category"
          onClick={() => openEditModal(cat)}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Grievance Category Master"
        subtitle="Resolution SLAs, escalation targets, and triage priorities for AIGGPA complaints & helpdesk"
        icon={<LifeBuoy className="w-5 h-5" />}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Grievance Category
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by grievance category or code..."
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
        itemLabel="categories"
      />

      <DataTable
        columns={columns}
        data={filteredCategories}
        emptyMessage="No grievance categories found matching search criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory ? 'Edit Grievance Category' : 'Add Grievance Category'
        }
        subtitle="Set standard escalation policy and expected turnaround time"
        maxWidth="md"
        footer={
          <FormActions
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            submitLabel={editingCategory ? 'Save Changes' : 'Create Category'}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorState message={errorMessage} />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Category Code"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. GC-001"
            />
            <TextField
              label="Resolution SLA (Hours)"
              type="number"
              min={1}
              required
              value={slaHours}
              onChange={e => setSlaHours(parseInt(e.target.value, 10) || 48)}
              helperText="Maximum allowed hours"
            />
          </div>

          <TextField
            label="Category Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Field Travel & Conveyance Allowance"
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Default Triage Priority"
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent Priority' },
              ]}
              value={String(defaultPriority).toLowerCase()}
              onChange={val =>
                setDefaultPriority(val as 'low' | 'medium' | 'high' | 'urgent')
              }
            />
            <SelectField
              label="Designated Resolver Role"
              options={[
                { value: 'Center Head', label: 'Center Head' },
                { value: 'Advisor', label: 'Advisor' },
              ]}
              value={targetRole}
              onChange={setTargetRole}
            />
          </div>
        </form>
      </AppDialog>
    </PageContainer>
  );
};

export default GrievanceCategoryMasterPage;
