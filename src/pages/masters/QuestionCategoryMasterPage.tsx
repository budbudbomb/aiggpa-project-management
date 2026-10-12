import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Tag } from 'lucide-react';
import {
  MasterStore,
  type QuestionCategoryItem,
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
  CheckboxField,
  FormActions,
  ErrorState,
} from '../../components';

export const QuestionCategoryMasterPage: React.FC = () => {
  const [categories, setCategories] = useState<QuestionCategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<QuestionCategoryItem | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = () => {
    setCategories(MasterStore.getQuestionCategories(true));
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
    setCode(`QC-${String(categories.length + 1).padStart(3, '0')}`);
    setName('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: QuestionCategoryItem) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name);
    setDisplayOrder(cat.displayOrder || 1);
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
      MasterStore.saveQuestionCategory({
        id: editingCategory ? editingCategory.id : `qc_${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        displayOrder: Number(displayOrder) || 1,
        isActive,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving category';
      setErrorMessage(msg);
    }
  };

  const filteredCategories = categories.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<QuestionCategoryItem>[] = [
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
        <span className="font-medium text-slate-900">{cat.name}</span>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Display Order',
      width: '130px',
      align: 'center',
      render: cat => (
        <span className="inline-flex items-center justify-center font-mono text-xs bg-slate-100 text-slate-700 w-7 h-6 rounded">
          {cat.displayOrder || 1}
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
            MasterStore.toggleQuestionCategoryActive(cat.id);
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
        title="Question Category Master"
        subtitle="Standard classification tags for research surveys and organizational question banks"
        icon={<Tag className="w-5 h-5" />}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Question Category
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by category name or code..."
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
        itemLabel="categories"
      />

      <DataTable
        columns={columns}
        data={filteredCategories}
        emptyMessage="No question categories found matching search criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory ? 'Edit Question Category' : 'Add Question Category'
        }
        subtitle="Configure classification code, label and display sequence"
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

          <TextField
            label="Category Code"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="e.g. LIV, EDU, AGR"
            helperText="Short alphanumeric code identifier"
          />

          <TextField
            label="Category Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Livelihood & Income Generation"
          />

          <TextField
            label="Display Order Sequence"
            type="number"
            min={1}
            value={displayOrder}
            onChange={e => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
            helperText="Determines sorting order in question builder and category filters"
          />

          <CheckboxField
            label="Active Category Status"
            description="Inactive categories will not appear in new survey creation dropdowns"
            checked={isActive}
            onChange={setIsActive}
          />
        </form>
      </AppDialog>
    </PageContainer>
  );
};

export default QuestionCategoryMasterPage;
