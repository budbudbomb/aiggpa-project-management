import React from 'react';
import { Search } from 'lucide-react';

export interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  totalCount?: number;
  filteredCount?: number;
  itemLabel?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  totalCount,
  filteredCount,
  itemLabel = 'records',
  filters,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        {onSearchChange !== undefined && (
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue ?? ''}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>
        )}

        {filters && (
          <div className="flex items-center gap-2 flex-wrap">{filters}</div>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        {totalCount !== undefined && (
          <div className="text-xs text-slate-500 font-medium">
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredCount !== undefined ? filteredCount : totalCount}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span>{' '}
            {itemLabel}
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default TableToolbar;
