import React, { useState, useMemo } from 'react';
import {
  MasterStore,
  type BudgetHeadMasterItem,
} from '../../stores/masterStore';
import {
  PageContainer,
  PageHeader,
  TableToolbar,
  AppCard,
  AppBadge,
  ActionIconButton,
  AppDialog,
  TextField,
  SelectField,
  FormActions,
  ErrorState,
  AppButton,
  EmptyState,
} from '../../components';
import { Plus, Wallet, Edit2, Trash2 } from 'lucide-react';

export default function BudgetHeadMasterPage(): React.ReactElement {
  const [budgetHeads, setBudgetHeads] = useState<BudgetHeadMasterItem[]>(() =>
    MasterStore.getBudgetHeads()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [editingHeadId, setEditingHeadId] = useState<string | null>(null);

  // Sub-item modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [targetHeadId, setTargetHeadId] = useState<string | null>(null);
  const [subParticular, setSubParticular] = useState('');
  const [subRate, setSubRate] = useState('50000');
  const [subUnit, setSubUnit] = useState('Months');

  // Head form
  const [formHeadCode, setFormHeadCode] = useState('');
  const [formHeadName, setFormHeadName] = useState('');
  const [formMode, setFormMode] = useState<'detailed' | 'lumpSum' | 'overhead'>(
    'detailed'
  );
  const [formDefaultUnit, setFormDefaultUnit] = useState('Months');
  const [formOverheadPct, setFormOverheadPct] = useState('15');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setBudgetHeads([...MasterStore.getBudgetHeads()]);
  };

  const filteredHeads = useMemo(() => {
    return budgetHeads.filter(b => {
      const q = searchTerm.toLowerCase().trim();
      return (
        !q ||
        b.headName.toLowerCase().includes(q) ||
        b.headCode.toLowerCase().includes(q) ||
        b.subItems.some(s => s.particular.toLowerCase().includes(q))
      );
    });
  }, [budgetHeads, searchTerm]);

  const openCreateHeadModal = () => {
    setEditingHeadId(null);
    setFormHeadCode('');
    setFormHeadName('');
    setFormMode('detailed');
    setFormDefaultUnit('Months');
    setFormOverheadPct('15');
    setFormError(null);
    setIsHeadModalOpen(true);
  };

  const openEditHeadModal = (b: BudgetHeadMasterItem) => {
    setEditingHeadId(b.id);
    setFormHeadCode(b.headCode);
    setFormHeadName(b.headName);
    setFormMode(b.mode);
    setFormDefaultUnit(b.defaultUnit);
    setFormOverheadPct(String(b.overheadPercentage || 15));
    setFormError(null);
    setIsHeadModalOpen(true);
  };

  const handleSaveHead = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formHeadCode.trim()) {
      setFormError('Head code is required.');
      return;
    }
    if (!formHeadName.trim()) {
      setFormError('Head title is required.');
      return;
    }

    const currentHead = editingHeadId
      ? MasterStore.getBudgetHeadById(editingHeadId)
      : null;

    MasterStore.saveBudgetHead({
      id: editingHeadId || undefined,
      headCode: formHeadCode.trim().toUpperCase(),
      headName: formHeadName.trim(),
      mode: formMode,
      defaultUnit: formDefaultUnit,
      overheadPercentage:
        formMode === 'overhead' ? parseFloat(formOverheadPct) || 15 : undefined,
      subItems: currentHead ? currentHead.subItems : [],
      isActive: true,
    });

    showToast(
      editingHeadId
        ? `Updated budget head "${formHeadName}".`
        : `Created budget head "${formHeadName}".`
    );
    refreshData();
    setIsHeadModalOpen(false);
  };

  const openAddSubItemModal = (headId: string) => {
    setTargetHeadId(headId);
    setSubParticular('');
    setSubRate('50000');
    setSubUnit('Months');
    setIsSubModalOpen(true);
  };

  const handleSaveSubItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetHeadId || !subParticular.trim()) return;

    MasterStore.addSubHeadItem(targetHeadId, {
      particular: subParticular.trim(),
      standardRate: parseFloat(subRate) || 0,
      defaultUnit: subUnit,
      isActive: true,
    });

    showToast(`Added line item "${subParticular}".`);
    refreshData();
    setIsSubModalOpen(false);
  };

  const handleDeleteSubItem = (headId: string, subId: string) => {
    MasterStore.removeSubHeadItem(headId, subId);
    refreshData();
    showToast('Removed line item.');
  };

  return (
    <PageContainer>
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      <PageHeader
        title="Budget Heads & Sub-Heads Master"
        subtitle="Manage project budget classification chart, expenditure sub-particulars, unit rates, and calculation modes"
        icon={<Wallet className="w-5 h-5" />}
        breadcrumbs={[
          { label: 'Master Data Management' },
          { label: 'Budget Heads' },
        ]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateHeadModal}
          >
            Add Budget Head
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search budget heads and sub-particulars..."
        totalCount={budgetHeads.length}
        filteredCount={filteredHeads.length}
        itemLabel="budget heads"
      />

      {filteredHeads.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-6 h-6 text-slate-400" />}
          title="No budget heads found"
          description="Try refining your search term or add a new budget head."
        />
      ) : (
        <div className="space-y-4">
          {filteredHeads.map(b => (
            <AppCard
              key={b.id}
              padding="none"
              title={
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded">
                    {b.headCode}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      {b.headName}
                    </span>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center gap-2">
                      <span className="capitalize">Mode: {b.mode}</span>
                      <span>•</span>
                      <span>Unit: {b.defaultUnit}</span>
                      {b.mode === 'overhead' && (
                        <>
                          <span>•</span>
                          <span>Overhead: {b.overheadPercentage}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              }
              headerAction={
                <div className="flex items-center gap-2">
                  <AppButton
                    variant="outline"
                    size="xs"
                    leftIcon={<Plus className="w-3 h-3" />}
                    onClick={() => openAddSubItemModal(b.id)}
                  >
                    Add Sub-Item
                  </AppButton>
                  <ActionIconButton
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    tooltip="Edit Head"
                    onClick={() => openEditHeadModal(b)}
                  />
                </div>
              }
            >
              <div className="p-4">
                {b.subItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No expenditure line items defined under this head yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                          <th className="pb-2">Sub-Particular</th>
                          <th className="pb-2">Standard Unit</th>
                          <th className="pb-2 text-right">Standard Rate</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {b.subItems.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 font-medium text-slate-800">
                              {sub.particular}
                            </td>
                            <td className="py-2.5">
                              <AppBadge variant="secondary" size="xs">
                                {sub.defaultUnit}
                              </AppBadge>
                            </td>
                            <td className="py-2.5 text-right font-mono font-medium text-slate-700">
                              {b.mode === 'overhead'
                                ? `${sub.standardRate}%`
                                : `₹${sub.standardRate.toLocaleString('en-IN')}`}
                            </td>
                            <td className="py-2.5 text-right">
                              <ActionIconButton
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                tooltip="Delete line item"
                                variant="danger"
                                onClick={() =>
                                  handleDeleteSubItem(b.id, sub.id)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </AppCard>
          ))}
        </div>
      )}

      {/* Head Modal */}
      <AppDialog
        isOpen={isHeadModalOpen}
        onClose={() => setIsHeadModalOpen(false)}
        title={editingHeadId ? 'Edit Budget Head' : 'Add Budget Head'}
        subtitle="Manage budget head code, calculation mode, and unit defaults"
        maxWidth="md"
        footer={
          <FormActions
            onCancel={() => setIsHeadModalOpen(false)}
            onSubmit={handleSaveHead}
            submitLabel={editingHeadId ? 'Save Changes' : 'Create Head'}
          />
        }
      >
        <form onSubmit={handleSaveHead} className="space-y-4">
          <ErrorState message={formError} />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Head Code / Abbreviation"
              required
              value={formHeadCode}
              onChange={e => setFormHeadCode(e.target.value)}
              placeholder="e.g. HR, TRV, P&P"
            />
            <SelectField
              label="Calculation Mode"
              options={[
                { value: 'detailed', label: 'Detailed (Rate × Qty)' },
                { value: 'lumpSum', label: 'Lump Sum Fixed' },
                { value: 'overhead', label: 'Fixed % Overhead' },
              ]}
              value={formMode}
              onChange={val =>
                setFormMode(val as 'detailed' | 'lumpSum' | 'overhead')
              }
            />
          </div>

          <TextField
            label="Head Title / Expenditure Category"
            required
            value={formHeadName}
            onChange={e => setFormHeadName(e.target.value)}
            placeholder="e.g. Human Resources & Research Personnel"
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Default Measurement Unit"
              options={[
                { value: 'Months', label: 'Months' },
                { value: 'Days', label: 'Days' },
                { value: 'Lump Sum', label: 'Lump Sum' },
                { value: 'Set', label: 'Set' },
                { value: '% Overhead', label: '% Overhead' },
              ]}
              value={formDefaultUnit}
              onChange={setFormDefaultUnit}
            />
            {formMode === 'overhead' && (
              <TextField
                label="Overhead Percentage (%)"
                type="number"
                value={formOverheadPct}
                onChange={e => setFormOverheadPct(e.target.value)}
              />
            )}
          </div>
        </form>
      </AppDialog>

      {/* Sub-item Modal */}
      <AppDialog
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="Add Sub-Item Particular"
        subtitle="Define standard unit and baseline rate for expenditure estimation"
        maxWidth="sm"
        footer={
          <FormActions
            onCancel={() => setIsSubModalOpen(false)}
            onSubmit={handleSaveSubItem}
            submitLabel="Add Line Item"
          />
        }
      >
        <form onSubmit={handleSaveSubItem} className="space-y-4">
          <TextField
            label="Particular Title"
            required
            value={subParticular}
            onChange={e => setSubParticular(e.target.value)}
            placeholder="e.g. Lead Policy Fellow, Travel conveyance"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Standard Rate (INR)"
              type="number"
              required
              value={subRate}
              onChange={e => setSubRate(e.target.value)}
            />
            <SelectField
              label="Default Unit"
              options={[
                { value: 'Months', label: 'Months' },
                { value: 'Days', label: 'Days' },
                { value: 'Lump Sum', label: 'Lump Sum' },
                { value: 'Set', label: 'Set' },
                { value: '% Overhead', label: '% Overhead' },
              ]}
              value={subUnit}
              onChange={setSubUnit}
            />
          </div>
        </form>
      </AppDialog>
    </PageContainer>
  );
}
