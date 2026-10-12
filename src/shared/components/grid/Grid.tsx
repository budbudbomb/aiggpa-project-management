import { Column, type ColumnBodyOptions } from 'primereact/column';
import {
  DataTable,
  type DataTableProps,
  type DataTableValueArray,
} from 'primereact/datatable';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import React, { useState } from 'react';
import {
  Eye,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '../buttons/Button';
import { TextInput } from '../forms/TextInput';
import ButtonColumn from './ButtonColumn';

// ─── Column Mapper ────────────────────────────────────────────────────────────

function mapColumns<T>(columns: Controls.ColumnProps<T>[]) {
  return columns.map(
    ({ sortable = true, filter = false, footer = false, ...column }) => {
      return (
        <Column
          key={String(column.field ?? column.header)}
          body={(data: T, options: ColumnBodyOptions) => {
            let content;
            if (typeof column.cell === 'function') {
              content = column.cell(data, options);
            } else if (column.cell !== undefined) {
              content = column.cell;
            } else {
              content = data[column.field as keyof T] as React.ReactNode;
            }
            return (
              <React.Fragment>
                {/* Mobile label shown via CSS */}
                <span className="grid-col-title">
                  {column.header as React.ReactNode}
                </span>
                <span
                  className="grid-col-value"
                  style={
                    column.align
                      ? {
                          display: 'inline-block',
                          width: '100%',
                          textAlign: column.align,
                        }
                      : undefined
                  }
                >
                  {content}
                </span>
              </React.Fragment>
            );
          }}
          field={column.field as string}
          header={column.header}
          style={{
            width: column.width,
            minWidth: column.minWidth,
            textAlign: column.align,
          }}
          sortable={column.field && sortable ? sortable : false}
          sortField={column.field as string}
          filter={filter}
          footer={column.field && footer ? footer : true}
          align={column.align}
          alignHeader={column.alignHeader ?? column.align}
        />
      );
    }
  );
}

// ─── Pagination Helper ────────────────────────────────────────────────────────

function paginationProps(pagination: Controls.Pagination) {
  if (pagination === false) return undefined;

  const defaultProps = {
    rowsPerPageOptions: [10, 20, 30, 50, 100],
    currentPageReportTemplate: 'Showing {first}-{last} of {totalRecords} items',
    paginatorTemplate:
      'RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
  };

  if (pagination === true) {
    return { rows: 10, ...defaultProps };
  }

  const paginationType = pagination as Controls.PaginationProps;
  return {
    ...defaultProps,
    rows: paginationType.rows ?? 10,
  };
}

// ─── Grid Component ───────────────────────────────────────────────────────────

export function Grid<T extends object = object>({
  data,
  columns,
  editCaption,
  viewCaption,
  removeCaption,
  onEdit,
  onView,
  onRemove,
  searchFields,
  pagination = true,
  onValueChange,
  isLoading,
  viewMode: controlledViewMode,
  onViewModeChange,
  hideViewToggle = false,
  customViewTemplate,
  headerActions,
  searchPlaceholder = 'Search...',
  onRefresh,
  className = '',
  hideHeader = false,
  ...rest
}: React.PropsWithChildren<
  Controls.GridProps<T> & {
    isLoading?: boolean;
    customViewTemplate?: (data: T[]) => React.ReactNode;
    className?: string;
    hideHeader?: boolean;
  }
>) {
  const [internalViewMode, setInternalViewMode] = useState<
    'list' | 'card' | 'row'
  >('list');
  const viewMode = controlledViewMode ?? internalViewMode;

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [cardFirst, setCardFirst] = useState(0);
  const pageProps = paginationProps(pagination);
  const [cardRows, setCardRows] = useState(pageProps?.rows ?? 10);

  const hasData = Array.isArray(data) && data.length > 0;
  const showPaginator =
    Array.isArray(data) && data.length > (pageProps?.rows ?? 10);

  const handleViewModeChange = (mode: 'list' | 'card' | 'row') => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Merge column + children
  let allColumns = columns || [];
  if (rest.children) {
    const childrenArray = React.Children.toArray(
      rest.children
    ) as React.ReactElement[];
    const childColumns = childrenArray
      .map(
        child =>
          child.props as {
            field?: string;
            header?: string;
            body?: Controls.ColumnProps<T>['cell'];
          }
      )
      .filter(props => props && (props.field || props.header))
      .map(props => ({
        field: props.field as keyof T,
        header: props.header,
        cell: props.body as Controls.ColumnProps<T>['cell'],
      }));
    allColumns = [...allColumns, ...childColumns];
  }

  // ─── Card View ─────────────────────────────────────────────────────────────

  const renderCardView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 text-sm font-medium">
          No Records Found
        </div>
      );
    }

    const currentCardData = showPaginator
      ? data.slice(cardFirst, cardFirst + cardRows)
      : data;

    return (
      <div className="grid-card-container">
        <div className="grid-card-grid">
          {currentCardData.map((item, index) => (
            <div key={index} className="grid-card-item">
              <div className="grid-card-body">
                {allColumns?.map((col, colIdx) => {
                  let content;
                  if (typeof col.cell === 'function') {
                    content = col.cell(item, { rowIndex: index });
                  } else if (col.cell !== undefined) {
                    content = col.cell;
                  } else if (col.field) {
                    content = item[col.field as keyof T] as React.ReactNode;
                  }
                  return (
                    <div key={colIdx} className="grid-card-row">
                      <span className="grid-card-label">
                        {typeof col.header === 'string'
                          ? col.header
                          : col.header}
                        :
                      </span>
                      <span className="grid-card-value">{content}</span>
                    </div>
                  );
                })}
              </div>

              {(onView || onEdit || onRemove) && (
                <div className="grid-card-actions">
                  {onView && (
                    <ButtonColumn
                      caption={viewCaption ?? 'View'}
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => onView(item)}
                      variant="badge-view"
                      iconOnly
                    />
                  )}
                  {onEdit && (
                    <ButtonColumn
                      caption={editCaption ?? 'Edit'}
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => onEdit(item)}
                      variant="badge-edit"
                      iconOnly
                    />
                  )}
                  {onRemove && (
                    <ButtonColumn
                      caption={removeCaption ?? 'Remove'}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => onRemove(item)}
                      variant="badge-remove"
                      iconOnly
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showPaginator && pageProps && (
          <Paginator
            first={cardFirst}
            rows={cardRows}
            totalRecords={data.length}
            rowsPerPageOptions={pageProps.rowsPerPageOptions}
            currentPageReportTemplate={pageProps.currentPageReportTemplate}
            template={pageProps.paginatorTemplate}
            onPageChange={(e: PaginatorPageChangeEvent) => {
              setCardFirst(e.first);
              setCardRows(e.rows);
            }}
            className="mt-3"
          />
        )}
      </div>
    );
  };

  // ─── Row View ──────────────────────────────────────────────────────────────

  const renderCustomRowView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 text-sm font-medium">
          No Records Found
        </div>
      );
    }

    const currentRowData = showPaginator
      ? data.slice(cardFirst, cardFirst + cardRows)
      : data;

    return (
      <div className="flex flex-col gap-3">
        {customViewTemplate
          ? customViewTemplate(currentRowData)
          : currentRowData.map((item, index) => (
              <React.Fragment key={index}>
                {rest.rowTemplate?.(item, { rowIndex: index })}
              </React.Fragment>
            ))}

        {showPaginator && pageProps && (
          <Paginator
            first={cardFirst}
            rows={cardRows}
            totalRecords={data.length}
            rowsPerPageOptions={pageProps.rowsPerPageOptions}
            currentPageReportTemplate={pageProps.currentPageReportTemplate}
            template={pageProps.paginatorTemplate}
            onPageChange={(e: PaginatorPageChangeEvent) => {
              setCardFirst(e.first);
              setCardRows(e.rows);
            }}
            className="mt-3"
          />
        )}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* ── Header Bar (Search + Actions + Toggle) ── */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="w-full sm:w-72">
            <TextInput
              placeholder={searchPlaceholder}
              value={globalFilterValue}
              onChange={e => setGlobalFilterValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Right: actions + refresh + view toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {headerActions}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={onRefresh}
                isLoading={isLoading}
              >
                Refresh
              </Button>
            )}

            {!hideViewToggle && (
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
                  if (viewMode === 'list') handleViewModeChange('card');
                  else if (viewMode === 'card' && rest.rowTemplate)
                    handleViewModeChange('row');
                  else handleViewModeChange('list');
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
      )}

      {/* ── View Content ── */}
      {viewMode === 'list' ? (
        <DataTable
          className={`${(data?.length ?? 0) <= 1 ? 'hide-paginator-mobile' : ''} ${className}`}
          value={data as DataTableValueArray}
          loading={isLoading}
          scrollable
          scrollHeight={rest.scrollHeight ?? '520px'}
          style={{ width: '100%' }}
          globalFilter={globalFilterValue}
          globalFilterFields={searchFields as string[]}
          emptyMessage="No Records Found"
          {...(rest as DataTableProps<DataTableValueArray>)}
          onValueChange={onValueChange as (e: DataTableValueArray) => void}
          {...(showPaginator ? pageProps : undefined)}
          paginator={showPaginator ? !!pageProps : false}
          paginatorDropdownAppendTo="self"
          stripedRows={rest.stripedRows ?? true}
          removableSort={false}
          virtualScrollerOptions={
            rest.lazyVirtualization
              ? { disabled: false, lazy: true, itemSize: 50 }
              : undefined
          }
        >
          {[
            ...(columns ? mapColumns(columns) : []),
            ...(onView || onEdit || onRemove
              ? [
                  <Column
                    key="action-column"
                    header="Action"
                    style={{
                      width:
                        [onView, onEdit, onRemove].filter(Boolean).length * 36 +
                        16,
                    }}
                    body={(item: T) => (
                      <React.Fragment>
                        <span className="grid-col-title">Action</span>
                        <span className="grid-col-value flex items-center justify-end gap-1.5 w-full">
                          {onView && (
                            <ButtonColumn
                              caption={viewCaption ?? 'View'}
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => onView(item)}
                              variant="badge-view"
                              iconOnly
                            />
                          )}
                          {onEdit && (
                            <ButtonColumn
                              caption={editCaption ?? 'Edit'}
                              icon={<Pencil className="w-3.5 h-3.5" />}
                              onClick={() => onEdit(item)}
                              variant="badge-edit"
                              iconOnly
                            />
                          )}
                          {onRemove && (
                            <ButtonColumn
                              caption={removeCaption ?? 'Remove'}
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={() => onRemove(item)}
                              variant="badge-remove"
                              iconOnly
                            />
                          )}
                        </span>
                      </React.Fragment>
                    )}
                  />,
                ]
              : []),
          ]}
          {rest.children}
        </DataTable>
      ) : viewMode === 'row' && (rest.rowTemplate || customViewTemplate) ? (
        renderCustomRowView()
      ) : (
        renderCardView()
      )}
    </div>
  );
}
