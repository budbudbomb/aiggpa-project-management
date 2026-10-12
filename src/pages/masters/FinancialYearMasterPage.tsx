import React, { useState, useMemo } from 'react';
import { MasterStore, type FinancialYearItem } from '../../stores/masterStore';
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
  CheckboxField,
  FormActions,
  ErrorState,
} from '../../components';
import { Plus, Calendar, Edit2, Star } from 'lucide-react';

export default function FinancialYearMasterPage(): React.ReactElement {
  const [fys, setFys] = useState<FinancialYearItem[]>(() =>
    MasterStore.getFinancialYears()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formStartDate, setFormStartDate] = useState('2027-04-01');
  const [formEndDate, setFormEndDate] = useState('2028-03-31');
  const [formIsCurrent, setFormIsCurrent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setFys([...MasterStore.getFinancialYears()]);
  };

  const filteredFys = useMemo(() => {
    return fys.filter(f => {
      const q = searchTerm.toLowerCase().trim();
      return (
        !q || f.code.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
      );
    });
  }, [fys, searchTerm]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormCode('2027-2028');
    setFormStartDate('2027-04-01');
    setFormEndDate('2028-03-31');
    setFormIsCurrent(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (f: FinancialYearItem) => {
    setEditingId(f.id);
    setFormCode(f.code);
    setFormStartDate(f.startDate);
    setFormEndDate(f.endDate);
    setFormIsCurrent(f.isCurrentActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formCode.trim()) {
      setFormError('Financial year code is required (e.g. 2026-2027).');
      return;
    }
    if (new Date(formEndDate) <= new Date(formStartDate)) {
      setFormError('End date must be after start date.');
      return;
    }

    MasterStore.saveFinancialYear({
      id: editingId || undefined,
      code: formCode.trim(),
      startDate: formStartDate,
      endDate: formEndDate,
      isCurrentActive: formIsCurrent,
      isActive: true,
    });

    showToast(
      editingId
        ? `Updated fiscal year "${formCode}".`
        : `Created fiscal year "${formCode}".`
    );
    refreshData();
    setIsModalOpen(false);
  };

  const handleSetCurrent = (f: FinancialYearItem) => {
    MasterStore.saveFinancialYear({
      id: f.id,
      code: f.code,
      startDate: f.startDate,
      endDate: f.endDate,
      isCurrentActive: true,
      isActive: true,
    });
    refreshData();
    showToast(`Marked ${f.code} as current active fiscal year.`);
  };

  const columns: ColumnDef<FinancialYearItem>[] = [
    {
      key: 'code',
      header: 'Fiscal Year Code',
      render: f => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 font-mono text-xs">
            {f.code}
          </span>
          {f.isCurrentActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              <Star className="w-3 h-3 text-blue-700 fill-blue-700" /> Current
              Active
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: f => (
        <span className="font-mono text-xs text-slate-700">{f.startDate}</span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: f => (
        <span className="font-mono text-xs text-slate-700">{f.endDate}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: f => (
        <StatusBadge
          status={f.isActive}
          onClick={() => {
            MasterStore.saveFinancialYear({
              id: f.id,
              code: f.code,
              startDate: f.startDate,
              endDate: f.endDate,
              isCurrentActive: f.isCurrentActive,
              isActive: !f.isActive,
            });
            refreshData();
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '180px',
      align: 'right',
      render: f => (
        <div className="flex items-center justify-end gap-2">
          {!f.isCurrentActive && (
            <AppButton
              variant="outline"
              size="xs"
              onClick={() => handleSetCurrent(f)}
            >
              Set Current
            </AppButton>
          )}
          <ActionIconButton
            icon={<Edit2 className="w-4 h-4" />}
            tooltip="Edit Fiscal Year"
            onClick={() => openEditModal(f)}
          />
        </div>
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
        title="Financial Years Master"
        subtitle="Configure fiscal periods, project estimation cycles, and the current active budgeting year"
        icon={<Calendar className="w-5 h-5" />}
        breadcrumbs={[
          { label: 'Master Data Management' },
          { label: 'Financial Years' },
        ]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Financial Year
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search fiscal years (e.g. 2026)..."
        totalCount={fys.length}
        filteredCount={filteredFys.length}
        itemLabel="fiscal periods"
      />

      <DataTable
        columns={columns}
        data={filteredFys}
        emptyMessage="No financial years found matching criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Financial Year' : 'Add Financial Year'}
        subtitle="Specify start date, end date and default active budgeting year"
        maxWidth="md"
        footer={
          <FormActions
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            submitLabel={editingId ? 'Save Changes' : 'Create Year'}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorState message={formError} />

          <TextField
            label="Financial Year Code"
            required
            value={formCode}
            onChange={e => setFormCode(e.target.value)}
            placeholder="e.g. 2026-2027"
            helperText="Standard format: YYYY-YYYY"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Start Date"
              type="date"
              required
              value={formStartDate}
              onChange={e => setFormStartDate(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              required
              value={formEndDate}
              onChange={e => setFormEndDate(e.target.value)}
            />
          </div>

          <CheckboxField
            label="Mark as Current Active Fiscal Year"
            description="All new project budgets, schemes, and expenditure plans will link to this year by default."
            checked={formIsCurrent}
            onChange={setFormIsCurrent}
          />
        </form>
      </AppDialog>
    </PageContainer>
  );
}
