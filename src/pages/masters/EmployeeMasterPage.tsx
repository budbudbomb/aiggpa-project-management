import React, { useState, useMemo } from 'react';
import {
  ActivityTaskStore,
  type Employee,
  type OrgRole,
} from '../../stores/activityTaskStore';
import { MasterStore } from '../../stores/masterStore';
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
  AppBadge,
} from '../../components';
import { Plus, Users, Edit2 } from 'lucide-react';

export default function EmployeeMasterPage(): React.ReactElement {
  const [employees, setEmployees] = useState<Employee[]>(() =>
    ActivityTaskStore.getEmployees()
  );
  const centers = MasterStore.getCenters(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<OrgRole>('Fellow');
  const [formDesignation, setFormDesignation] = useState('');
  const [formCenterId, setFormCenterId] = useState(centers[0]?.id || 'CTR-01');
  const [formReportsTo, setFormReportsTo] = useState<string>('EMP-PM-01');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    setEmployees([...ActivityTaskStore.getEmployees()]);
  };

  // Filtered List
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(q)) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);

      const matchRole = roleFilter === 'all' || emp.role === roleFilter;
      const isActive = emp.isActive !== false;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  // Supervisors available for selected role (respecting hierarchy)
  const availableSupervisors = useMemo(() => {
    if (formRole === 'Center Head') return [];
    if (formRole === 'Advisor') {
      return employees.filter(e => e.role === 'Center Head');
    }
    // Tier 3 (Fellow, Intern, Field Instructor, Research Analyst) report to Advisor or Center Head
    return employees.filter(
      e => e.role === 'Advisor' || e.role === 'Center Head'
    );
  }, [employees, formRole]);

  const openCreateModal = () => {
    setEditingEmpId(null);
    setFormName('');
    setFormCode(`E${Date.now().toString().slice(-4)}`);
    setFormEmail('');
    setFormRole('Fellow');
    setFormDesignation('Research Fellow');
    setFormCenterId(centers[0]?.id || 'CTR-01');
    const defaultSup = employees.find(e => e.role === 'Advisor')?.id || '';
    setFormReportsTo(defaultSup);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setFormName(emp.name);
    setFormCode(emp.employeeCode || emp.id);
    setFormEmail(emp.email);
    setFormRole(emp.role);
    setFormDesignation(emp.designation);
    setFormCenterId(emp.centerId || centers[0]?.id || 'CTR-01');
    setFormReportsTo(emp.reportsTo || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('A valid official email is required.');
      return;
    }

    const selectedCenter = centers.find(c => c.id === formCenterId);
    const departmentName =
      selectedCenter?.name || 'Center for Policy Planning & Governance';

    // Loop check if supervisor assigned
    if (formReportsTo && editingEmpId) {
      if (
        !ActivityTaskStore.validateReportingLoop(editingEmpId, formReportsTo)
      ) {
        setFormError(
          'Circular reporting loop detected: Selected supervisor reports back to this employee.'
        );
        return;
      }
    }

    const savedEmp = ActivityTaskStore.saveEmployee({
      id: editingEmpId || undefined,
      employeeCode: formCode.trim(),
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      designation: formDesignation.trim(),
      department: departmentName,
      centerId: formCenterId,
      reportsTo: formRole === 'Center Head' ? null : formReportsTo || null,
      isActive: true,
    });

    // Auto-update center head if selected as Center Head
    if (formRole === 'Center Head' && formCenterId) {
      MasterStore.saveCenter({
        id: formCenterId,
        code: selectedCenter?.code || 'CTR',
        name: selectedCenter?.name || 'Center',
        headEmployeeId: savedEmp.id,
        headEmployeeName: savedEmp.name,
        isActive: true,
      });
    }

    showToast(
      editingEmpId
        ? `Updated employee "${formName}".`
        : `Created employee "${formName}".`
    );
    refreshData();
    setIsModalOpen(false);
  };

  const handleToggleActive = (emp: Employee) => {
    ActivityTaskStore.toggleEmployeeActive(emp.id);
    refreshData();
    const nextStatus = emp.isActive === false;
    showToast(`${emp.name} is now ${nextStatus ? 'active' : 'deactivated'}.`);
  };

  const centerOptions = useMemo(() => {
    return centers.map(c => ({
      value: c.id,
      label: `${c.code} - ${c.name}`,
    }));
  }, [centers]);

  const supervisorOptions = useMemo(() => {
    const opts = [{ value: '', label: '-- No Supervisor Assigned --' }];
    availableSupervisors.forEach(s => {
      opts.push({
        value: s.id,
        label: `${s.name} (${s.role} - ${s.designation})`,
      });
    });
    return opts;
  }, [availableSupervisors]);

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Details',
      render: emp => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {emp.name
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{emp.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {emp.employeeCode || emp.id} • {emp.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Designation',
      render: emp => (
        <div>
          <AppBadge
            variant={
              emp.role === 'Center Head'
                ? 'primary'
                : emp.role === 'Advisor' || emp.role === 'Research Analyst'
                  ? 'info'
                  : 'secondary'
            }
            size="xs"
          >
            {emp.role}
          </AppBadge>
          <div className="text-xs text-slate-600 mt-1 font-medium">
            {emp.designation}
          </div>
        </div>
      ),
    },
    {
      key: 'center',
      header: 'Assigned Center',
      render: emp => {
        const c = centers.find(ctr => ctr.id === emp.centerId);
        return (
          <div className="text-xs">
            <span className="font-semibold text-slate-800">
              {c ? c.code : 'AIGGPA'}
            </span>
            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {c ? c.name : emp.department}
            </div>
          </div>
        );
      },
    },
    {
      key: 'reportsTo',
      header: 'Reports To',
      render: emp => {
        if (!emp.reportsTo) {
          return (
            <span className="text-slate-400 italic text-xs">
              Direct Governance
            </span>
          );
        }
        const sup = employees.find(e => e.id === emp.reportsTo);
        return sup ? (
          <div className="text-xs font-medium text-slate-800">
            {sup.name}
            <span className="block text-[10px] text-slate-500 font-normal">
              {sup.role}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500">
            {emp.reportsTo}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: emp => (
        <StatusBadge
          status={emp.isActive !== false}
          onClick={() => handleToggleActive(emp)}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      align: 'right',
      render: emp => (
        <ActionIconButton
          icon={<Edit2 className="w-4 h-4" />}
          tooltip="Edit Employee"
          onClick={() => openEditModal(emp)}
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
        title="Employee Directory Master"
        subtitle="Maintain verified organizational personnel, reporting lines, research centers, and hierarchy roles"
        icon={<Users className="w-5 h-5" />}
        breadcrumbs={[
          { label: 'Master Data Management' },
          { label: 'Employees' },
        ]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Employee
          </AppButton>
        }
      />

      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search employees by name, code, email..."
        totalCount={employees.length}
        filteredCount={filteredEmployees.length}
        itemLabel="personnel"
        filters={
          <div className="flex items-center gap-2">
            <SelectField
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Center Head', label: 'Center Head' },
                { value: 'Advisor', label: 'Advisor' },
                { value: 'Research Analyst', label: 'Research Analyst' },
                { value: 'Fellow', label: 'Fellow' },
                { value: 'Intern', label: 'Intern' },
                { value: 'Field Instructor', label: 'Field Instructor' },
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-40 text-xs"
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
        data={filteredEmployees}
        emptyMessage="No employees found matching criteria."
      />

      <AppDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmpId ? 'Edit Employee Details' : 'Add New Employee'}
        subtitle="Configure official designation, reporting line, and organizational center"
        maxWidth="lg"
        footer={
          <FormActions
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            submitLabel={editingEmpId ? 'Save Changes' : 'Create Employee'}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorState message={formError} />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Full Legal Name"
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Dr. Rajeshwar Rao"
            />
            <TextField
              label="Employee Code"
              required
              value={formCode}
              onChange={e => setFormCode(e.target.value)}
              placeholder="e.g. EMP-CH-01"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Official Email Address"
              type="email"
              required
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              placeholder="e.g. rajeshwar.rao@aiggpa.mp.gov.in"
            />
            <TextField
              label="Formal Designation"
              required
              value={formDesignation}
              onChange={e => setFormDesignation(e.target.value)}
              placeholder="e.g. Principal Advisor, Lead Fellow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Organizational Hierarchy Role"
              options={[
                { value: 'Center Head', label: 'Center Head' },
                { value: 'Advisor', label: 'Advisor' },
                { value: 'Research Analyst', label: 'Research Analyst' },
                { value: 'Fellow', label: 'Fellow' },
                { value: 'Intern', label: 'Intern' },
                { value: 'Field Instructor', label: 'Field Instructor' },
              ]}
              value={formRole}
              onChange={val => {
                const newRole = val as OrgRole;
                setFormRole(newRole);
                if (newRole === 'Center Head') {
                  setFormReportsTo('');
                }
              }}
              required
              helperText="Determines task creation, review approvals and escalation rules"
            />

            <SelectField
              label="Primary Research Center"
              options={centerOptions}
              value={formCenterId}
              onChange={setFormCenterId}
              required
            />
          </div>

          {formRole !== 'Center Head' && (
            <SelectField
              label="Direct Reporting Supervisor"
              options={supervisorOptions}
              value={formReportsTo}
              onChange={setFormReportsTo}
              helperText="Must match valid hierarchy rules: Intern → Fellow → PM/RA → Center Head"
            />
          )}
        </form>
      </AppDialog>
    </PageContainer>
  );
}
