import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}
export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor = (row, idx) => {
    const r = row as { id?: string | number };
    return r.id !== undefined ? r.id : idx;
  },
  isLoading = false,
  emptyState,
  emptyMessage = 'No records found matching search criteria.',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}
      >
        <LoadingState />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-3 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState || <EmptyState description={emptyMessage} />}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-50'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {columns.map(col => {
                    const content = col.render
                      ? col.render(row, idx)
                      : (row as Record<string, React.ReactNode>)[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
