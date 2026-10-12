import React, { useState } from 'react';
import { Grid } from 'shared/components/grid';
import { Badge } from 'shared/components/feedback/Badge';
import { mockUsers } from 'services/mockData';
import { type UserMember } from 'types/dashboard';

// ─── Column Definitions ───────────────────────────────────────────────────────

const userColumns: Controls.ColumnProps<UserMember>[] = [
  {
    field: 'id',
    header: 'ID',
    sortable: true,
    width: '8%',
  },
  {
    field: 'name',
    header: 'User',
    sortable: true,
    width: '30%',
    cell: (row, { rowIndex }) => (
      <div className="flex items-center gap-3" key={rowIndex}>
        <img
          src={row.avatar}
          alt={row.name}
          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {row.name}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {row.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    field: 'role',
    header: 'Role',
    sortable: true,
    width: '20%',
  },
  {
    field: 'department',
    header: 'Department',
    sortable: true,
    width: '18%',
  },
  {
    field: 'status',
    header: 'Status',
    sortable: true,
    width: '12%',
    cell: row => {
      const statusMap = {
        Active: 'success',
        Pending: 'warning',
        Inactive: 'neutral',
      } as const;
      return (
        <Badge variant={statusMap[row.status] || 'neutral'} dot size="sm">
          {row.status}
        </Badge>
      );
    },
  },
];

// ─── TableSection ─────────────────────────────────────────────────────────────

export const TableSection: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers([...mockUsers]);
      setLoading(false);
    }, 800);
  };

  const handleEdit = (user: UserMember) => {
    // eslint-disable-next-line no-console
    console.log('Edit:', user);
  };

  const handleRemove = (user: UserMember) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  // ── Custom Row Template (for "row" view mode)
  const renderRowTemplate = (user: UserMember) => (
    <div
      key={user.id}
      className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
    >
      <img
        src={user.avatar}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
          {user.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {user.email}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
          {user.role}
        </span>
        <Badge
          variant={
            user.status === 'Active'
              ? 'success'
              : user.status === 'Pending'
                ? 'warning'
                : 'neutral'
          }
          dot
          size="sm"
        >
          {user.status}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Grid Component (List / Card / Row Views)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          PrimeReact DataTable with Tailwind CSS v4 — 3 view modes, edit/remove
          actions, card view, custom row template. Toggle views with the{' '}
          <kbd className="px-1 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
            ⊞ / ☰
          </kbd>{' '}
          button.
        </p>
      </div>

      <Grid<UserMember>
        data={users}
        columns={userColumns}
        isLoading={loading}
        onRefresh={handleRefresh}
        pagination={{ rows: 5 }}
        searchPlaceholder="Search users..."
        onEdit={handleEdit}
        onRemove={handleRemove}
        editCaption="Edit"
        removeCaption="Remove"
        rowTemplate={renderRowTemplate}
        searchFields={['name', 'email', 'role', 'department', 'status']}
        dataKey="id"
      />
    </div>
  );
};
