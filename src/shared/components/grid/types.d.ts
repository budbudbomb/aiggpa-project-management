declare namespace Controls {
  interface GridProps<T> {
    data: Array<T>;
    columns?: ColumnProps<T>[];
    children?: React.ReactNode;

    // Action Buttons
    editCaption?: string;
    onEdit?: (obj: T) => void;
    viewCaption?: string;
    onView?: (obj: T) => void;
    removeCaption?: string;
    onRemove?: (obj: T) => void;

    // Pagination
    pagination?: Pagination;

    // Search
    searchFields?: (keyof T)[];
    globalFilter?: string;

    // Loading & Empty State
    isLoading?: boolean;
    emptyMessage?: string;

    // DataTable features
    headerColumnGroup?: React.ReactNode;
    size?: 'small' | 'large';
    showGridlines?: boolean;
    stripedRows?: boolean;
    className?: string;
    rowGroupMode?: 'subheader' | 'rowspan';
    groupRowsBy?: string | string[];
    rowGroupHeaderTemplate?: (data: T) => React.ReactNode;
    scrollHeight?: string;
    scrollable?: boolean;
    lazyVirtualization?: boolean;

    // Selection
    selection?: T | T[];
    onSelectionChange?: (e: { value: T | T[] }) => void;
    selectionMode?: 'single' | 'multiple' | 'checkbox' | 'radiobutton';
    cellSelection?: boolean;
    dragSelection?: boolean;
    dataKey?: string;
    isDataSelectable?: (event: { data: T }) => boolean;

    // Callbacks
    onValueChange?: (value: T[]) => void;
    rowClassName?: (data: T) => string;
    onRowMouseEnter?: (e: {
      originalEvent: React.SyntheticEvent;
      data: T;
      index: number;
    }) => void;
    onRowMouseLeave?: (e: {
      originalEvent: React.SyntheticEvent;
      data: T;
      index: number;
    }) => void;
    onSort?: (e: { sortField?: string; sortOrder?: number }) => void;
    onFilter?: (e: { globalFilter?: string }) => void;
    sortField?: string | null;
    sortOrder?: number | null;

    // View Modes
    viewMode?: 'list' | 'card' | 'row';
    onViewModeChange?: (mode: 'list' | 'card' | 'row') => void;
    hideViewToggle?: boolean;
    rowTemplate?: (item: T, options: { rowIndex: number }) => React.ReactNode;
    customViewTemplate?: (data: T[]) => React.ReactNode;

    // Header extras
    headerActions?: React.ReactNode;
    searchPlaceholder?: string;
    onRefresh?: () => void;
  }

  interface ColumnProps<T> {
    field?: keyof T | (string & {});
    header?: string | React.ReactNode;
    cell?: (item: T, option: { rowIndex: number }) => React.ReactNode;
    sortable?: boolean;
    filter?: boolean;
    width?: number | string;
    minWidth?: number | string;
    footer?: string | React.ReactNode;
    align?: 'left' | 'right' | 'center';
    alignHeader?: 'left' | 'right' | 'center';
  }

  interface PaginationProps {
    rows?: number;
  }

  type Pagination = boolean | PaginationProps;

  interface ResponsiveGridProps<T> extends GridProps<T> {
    renderMobileItem?: (item: T, index: number) => React.ReactNode;
  }
}
