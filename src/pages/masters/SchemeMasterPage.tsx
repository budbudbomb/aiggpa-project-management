import React, { useState, useMemo } from 'react';
import { MasterStore, type SchemeMasterItem } from '../../stores/masterStore';
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
import { Plus, FileText, Edit2 } from 'lucide-react';

export default function SchemeMasterPage(): React.ReactElement {
  const [schemes, setSchemes] = useState<SchemeMasterItem[]>(() =>
    MasterStore.getSchemes()
  );
  const financialYears = MasterStore.getFinancialYears(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [fyFilter, setFyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formFyId, setFormFyId] = useState(financialYears[0]?.id || 'FY-26-27');
  const [formAgency, setFormAgency] = useState('Planning Department, GoMP');
  const [formBudget, setFormBudget] = useState('50000000');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setSchemes([...MasterStore.getSchemes()]);
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.sponsoringAgency.toLowerCase().includes(q);

      const matchFy = fyFilter === 'all' || s.financialYearId === fyFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.isActive) ||
        (statusFilter === 'inactive' && !s.isActive);

      return matchSearch && matchFy && matchStatus;
    });
  }, [schemes, searchTerm, fyFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormCode(`${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormFyId(financialYears[0]?.id || 'FY-26-27');
    setFormAgency('Planning Department, GoMP');
    setFormBudget('25000000');
    setFormDesc('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: SchemeMasterItem) => {
    setEditingId(s.id);
    setFormCode(s.code);
    setFormName(s.name);
    setFormFyId(s.financialYearId);
    setFormAgency(s.sponsoringAgency);
    setFormBudget(String(s.budgetSanctioned));
    setFormDesc(s.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formCode.trim()) {
      setFormError('Scheme code is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Scheme name is required.');
      return;
    }

    const fy = financialYears.find(f => f.id === formFyId) || financialYears[0];
    const budgetNum = parseFloat(formBudget) || 0;

    MasterStore.saveScheme({
      id: editingId || undefined,
      code: formCode.trim(),
      name: formName.trim(),
      financialYearId: formFyId,
      financialYearCode: fy ? fy.code : '2026-2027',
      sponsoringAgency: formAgency.trim(),
      budgetSanctioned: budgetNum,
      description: formDesc.trim(),
      isActive: true,
    });

    showToast(
      editingId
        ? `Updated scheme "${formName}".`
        : `Created scheme "${formName}".`
    );
    refreshData();
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    MasterStore.toggleSchemeActive(id);
    refreshData();
    showToast('Scheme active state updated.');
  };

  const fyOptions = useMemo(() => {
    return financialYears.map(f => ({
      value: f.id,
      label: `${f.code} ${f.isCurrentActive ? '(Current Active)' : ''}`,
    }));
  }, [financialYears]);

  const columns: ColumnDef<SchemeMasterItem>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '110px',
      render: s => (
        <span className="font-semibold text-blue-900 font-mono text-xs">
          {s.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Scheme Name & Scope',
      render: s => (
        <div>
          <div className="font-medium text-slate-900">{s.name}</div>
          {s.description && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {s.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'agency',
      header: 'Sponsoring Department',
      render: s => (
        <span className="text-xs text-slate-700 font-medium">
          {s.sponsoringAgency}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Sanctioned Outlay',
      render: s => (
        <span className="font-mono text-xs text-slate-900 font-semibold">
          ₹{(s.budgetSanctioned || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'fy',
      header: 'Fiscal Year',
      render: s => (
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {s.financialYearCode || s.financialYearId}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: s => (
        <StatusBadge
          status={s.isActive}
          onClick={() => handleToggleActive(s.id)}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      align: 'right',
      render: s => (
        <ActionIconButton
          icon={<Edit2 className="w-4 h-4" />}
          tooltip="Edit Scheme"
          onClick={() => openEditModal(s)}
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
        title="Government Schemes Master"
        subtitle="Maintain official MP state policy schemes, sponsoring administrative departments, and sanctioned allocations"
        icon={<FileText className="w-5 h-5" />}
        breadcrumbs={[
          { label: 'Master Data Management' },
          { label: 'Schemes' },
        ]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Government Scheme
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search schemes by name, code or sponsor..."
        totalCount={schemes.length}
        filteredCount={filteredSchemes.length}
        itemLabel="schemes"
        filters={
          <div className="flex items-center gap-2">
            <SelectField
              options={[
                { value: 'all', label: 'All Fiscal Years' },
                ...fyOptions,
              ]}
              value={fyFilter}
              onChange={setFyFilter}
              className="w-44 text-xs"
            />
            <div className="flex items-center gap-1">
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
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filteredSchemes}
        emptyMessage="No government schemes found matching criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Scheme' : 'Add Government Scheme'}
        subtitle="Manage state scheme code, parent agency, and financial envelope"
        maxWidth="md"
        footer={
          <FormActions
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            submitLabel={editingId ? 'Save Changes' : 'Create Scheme'}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorState message={formError} />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Scheme Code / Budget Line"
              required
              value={formCode}
              onChange={e => setFormCode(e.target.value)}
              placeholder="e.g. 5214, PMAY-01"
            />
            <SelectField
              label="Financial Year"
              options={fyOptions}
              value={formFyId}
              onChange={setFormFyId}
              required
            />
          </div>

          <TextField
            label="Scheme Title"
            required
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. CM Good Governance Fellowship Programme"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Sponsoring Department / Agency"
              value={formAgency}
              onChange={e => setFormAgency(e.target.value)}
              placeholder="e.g. Planning Department, GoMP"
            />
            <TextField
              label="Total Sanctioned Budget (INR)"
              type="number"
              value={formBudget}
              onChange={e => setFormBudget(e.target.value)}
              placeholder="e.g. 50000000"
            />
          </div>

          <TextAreaField
            label="Brief Objectives / Notes"
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Key policy objectives, mandate..."
            rows={2}
          />
        </form>
      </AppDialog>
    </PageContainer>
  );
}
