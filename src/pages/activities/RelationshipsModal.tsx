import React, { useState, useMemo } from 'react';
import {
  ActivityTaskStore,
  type Employee,
} from '../../stores/activityTaskStore';
import {
  AppDialog,
  SelectField,
  AppButton,
  AppBadge,
  ErrorState,
} from '../../components';
import { Users, RefreshCw } from 'lucide-react';

interface RelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: Employee;
  onHierarchyUpdated?: () => void;
}

export const RelationshipsModal: React.FC<RelationshipsModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  onHierarchyUpdated,
}) => {
  const employees = ActivityTaskStore.getEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    employees[0]?.id || ''
  );
  const [newSupervisorId, setNewSupervisorId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find(e => e.id === selectedEmpId),
    [employees, selectedEmpId]
  );

  // Eligible supervisors for selected employee based on hierarchy rules
  const eligibleSupervisors = useMemo(() => {
    return employees.filter(supervisor => {
      if (!selectedEmployee) return false;
      if (supervisor.id === selectedEmployee.id) return false;

      // Center Head reports to no one
      if (selectedEmployee.role === 'Center Head') return false;

      // PM and RA report to Center Head
      if (
        selectedEmployee.role === 'Project Manager' ||
        selectedEmployee.role === 'Research Analyst'
      ) {
        return supervisor.role === 'Center Head';
      }

      // Fellows report to PM or RA
      if (selectedEmployee.role === 'Fellow') {
        return (
          supervisor.role === 'Project Manager' ||
          supervisor.role === 'Research Analyst'
        );
      }

      // Interns report to Fellows
      if (selectedEmployee.role === 'Intern') {
        return supervisor.role === 'Fellow';
      }

      return false;
    });
  }, [employees, selectedEmployee]);

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !newSupervisorId) return;

    ActivityTaskStore.updateReportingRelationship(
      selectedEmployee.id,
      newSupervisorId === 'none' ? null : newSupervisorId
    );

    setSuccessMsg(
      `Updated reporting: ${selectedEmployee.name} now reports to ${
        employees.find(e => e.id === newSupervisorId)?.name
      }.`
    );
    setTimeout(() => setSuccessMsg(null), 3500);
    onHierarchyUpdated?.();
  };

  const handleResetDefaults = () => {
    ActivityTaskStore.resetToDefaults();
    setSuccessMsg('Organizational hierarchy reset to standard defaults.');
    setTimeout(() => setSuccessMsg(null), 3500);
    onHierarchyUpdated?.();
  };

  const employeeOptions = useMemo(
    () =>
      employees.map(e => ({
        value: e.id,
        label: `${e.name} — ${e.role} (${e.designation})`,
      })),
    [employees]
  );

  const supervisorOptions = useMemo(() => {
    if (selectedEmployee?.role === 'Center Head') {
      return [
        { value: 'none', label: 'Reports directly to Board / Governance' },
      ];
    }
    const opts = [{ value: '', label: '-- Select Approved Supervisor --' }];
    eligibleSupervisors.forEach(s => {
      opts.push({
        value: s.id,
        label: `${s.name} (${s.role} - ${s.designation})`,
      });
    });
    return opts;
  }, [selectedEmployee, eligibleSupervisors]);

  const centerHeads = useMemo(
    () => employees.filter(e => e.role === 'Center Head'),
    [employees]
  );
  const managers = useMemo(
    () =>
      employees.filter(
        e => e.role === 'Project Manager' || e.role === 'Research Analyst'
      ),
    [employees]
  );
  const fellows = useMemo(
    () => employees.filter(e => e.role === 'Fellow'),
    [employees]
  );
  const interns = useMemo(
    () => employees.filter(e => e.role === 'Intern'),
    [employees]
  );

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Organizational Reporting Hierarchy & Assignment Matrix</span>
        </div>
      }
      subtitle="Center Head → Project Managers & Research Analysts → Fellows → Interns"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {successMsg && (
          <ErrorState
            type="success"
            message={successMsg}
            onDismiss={() => setSuccessMsg(null)}
          />
        )}

        {/* Quick Management Box */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-xs font-bold text-blue-900">
              Establish / Reconfigure Reporting Relationship
            </span>
            <AppButton
              variant="ghost"
              size="xs"
              leftIcon={<RefreshCw className="w-3 h-3 text-blue-700" />}
              onClick={handleResetDefaults}
              className="text-blue-700"
            >
              Reset to System Defaults
            </AppButton>
          </div>

          <form
            onSubmit={handleUpdateAssignment}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-5">
              <SelectField
                label="Select Employee"
                options={employeeOptions}
                value={selectedEmpId}
                onChange={val => {
                  setSelectedEmpId(val);
                  setNewSupervisorId('');
                }}
              />
            </div>

            <div className="sm:col-span-5">
              <SelectField
                label="Permitted Reporting Supervisor"
                options={supervisorOptions}
                value={newSupervisorId}
                onChange={setNewSupervisorId}
                disabled={selectedEmployee?.role === 'Center Head'}
              />
            </div>

            <div className="sm:col-span-2">
              <AppButton
                type="submit"
                variant="primary"
                size="sm"
                fullWidth
                disabled={
                  !newSupervisorId || selectedEmployee?.role === 'Center Head'
                }
              >
                Save Line
              </AppButton>
            </div>
          </form>
        </div>

        {/* Hierarchy Overview Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level 1: Center Head */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Level 1: Center Head
              </span>
              <AppBadge variant="primary" size="xs">
                {centerHeads.length} Leaders
              </AppBadge>
            </div>
            <div className="space-y-2">
              {centerHeads.map(ch => (
                <div
                  key={ch.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900">{ch.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {ch.designation} • {ch.department}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 2: Project Managers & Research Analysts */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Level 2: PMs & Analysts
              </span>
              <AppBadge variant="info" size="xs">
                {managers.length} Staff
              </AppBadge>
            </div>
            <div className="space-y-2">
              {managers.map(m => (
                <div
                  key={m.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900">{m.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {m.role} • {m.designation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 3: Fellows */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Level 3: Fellows
              </span>
              <AppBadge variant="secondary" size="xs">
                {fellows.length} Fellows
              </AppBadge>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fellows.map(f => (
                <div
                  key={f.id}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900">{f.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {f.designation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level 4: Interns */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Level 4: Field Interns
              </span>
              <AppBadge variant="neutral" size="xs">
                {interns.length} Interns
              </AppBadge>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {interns.map(i => (
                <div
                  key={i.id}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <div className="font-bold text-slate-900">{i.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {i.designation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppDialog>
  );
};

export default RelationshipsModal;
