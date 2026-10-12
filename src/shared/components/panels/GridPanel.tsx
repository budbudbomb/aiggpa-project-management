import React, { useState } from 'react';
import { TextBox } from '../forms/TextBox';
import { Grid } from '../grid/Grid';
import { Button } from '../buttons/Button';
import { Card } from './Card';
import { FileSpreadsheet, Printer, LayoutGrid, List } from 'lucide-react';

export interface GridPanelProps<T> extends Controls.GridProps<T> {
  title?: string;
  toolbar?: React.ReactElement;
  searchBox?: boolean;
  exportExcel?: boolean;
  onExportExcel?: () => void;
  isExporting?: boolean;
  print?: boolean;
  onPrint?: () => void;
  isPrint?: boolean;
  actionButtons?: React.ReactElement;
  onValueChange?: (value: T[]) => void;
  onSort?: (e: { sortField?: string; sortOrder?: number }) => void;
  onFilter?: (e: { globalFilter?: string }) => void;
  footerColumnGroup?: React.ReactNode;
  headerColumnGroup?: React.ReactNode;
  sortField?: string | null;
  sortOrder?: number | null;
  defaultViewMode?: 'list' | 'card' | 'row';
  noCard?: boolean;
  cardClassName?: string;
}

export function GridPanel<T extends object = object>({
  title,
  toolbar,
  searchBox = true,
  exportExcel = false,
  onExportExcel,
  isExporting,
  print = false,
  onPrint,
  isPrint,
  actionButtons,
  onValueChange,
  onSort,
  onFilter,
  sortField,
  sortOrder,
  defaultViewMode = 'list',
  noCard = false,
  cardClassName = 'p-0 sm:p-0',
  ...rest
}: GridPanelProps<T>) {
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'row'>(
    defaultViewMode
  );

  const currentGlobalFilter = rest.globalFilter ?? internalGlobalFilter;

  const handleFilterChange = (value: string) => {
    if (onFilter) {
      onFilter({ globalFilter: value });
    } else {
      setInternalGlobalFilter(value);
    }
  };

  const hasTitle = Boolean(title && title.trim());

  const content = (
    <div className="flex flex-col gap-2.5">
      {/* Panel header controls wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {hasTitle ? (
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </span>
        ) : searchBox ? (
          <div className="w-full sm:w-60">
            <TextBox
              value={currentGlobalFilter}
              onChange={e => handleFilterChange(e.target.value)}
              placeholder="Search..."
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
          {toolbar}

          {exportExcel && onExportExcel && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={onExportExcel}
              isLoading={isExporting}
            >
              Export
            </Button>
          )}

          {print && onPrint && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={onPrint}
              isLoading={isPrint}
            >
              Print
            </Button>
          )}

          {actionButtons}

          {hasTitle && searchBox && (
            <div className="w-full sm:w-60">
              <TextBox
                value={currentGlobalFilter}
                onChange={e => handleFilterChange(e.target.value)}
                placeholder="Search..."
              />
            </div>
          )}

          {/* Grid View Mode Toggle Button */}
          {!rest.hideViewToggle && (
            <button
              type="button"
              title={
                viewMode === 'list'
                  ? 'Switch to Card View'
                  : viewMode === 'card' && rest.rowTemplate
                    ? 'Switch to Row View'
                    : 'Switch to List View'
              }
              className="grid-view-toggle-btn"
              onClick={() => {
                if (viewMode === 'list') setViewMode('card');
                else if (viewMode === 'card' && rest.rowTemplate)
                  setViewMode('row');
                else setViewMode('list');
              }}
            >
              {viewMode === 'list' ? (
                <LayoutGrid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid table */}
      <Grid
        {...rest}
        globalFilter={currentGlobalFilter}
        onValueChange={onValueChange}
        onSort={onSort}
        onFilter={onFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideViewToggle={true} // Hide view toggle inside Grid since GridPanel handles it now
        hideHeader={true}
      />
    </div>
  );

  if (noCard) {
    return content;
  }

  return <Card className={cardClassName}>{content}</Card>;
}
