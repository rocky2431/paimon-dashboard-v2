/**
 * DataTable Type Definitions
 */

import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table'

export interface DataTablePaginationState {
  pageIndex: number
  pageSize: number
}

export interface DataTableSortingState {
  sorting: SortingState
}

export interface DataTableColumnVisibilityState {
  columnVisibility: VisibilityState
}

export interface DataTableRowSelectionState {
  rowSelection: Record<string, boolean>
}

export interface DataTableFiltersState {
  globalFilter: string
}

// Table column definition with additional properties
export interface DataTableColumn<TData> extends Omit<ColumnDef<TData>, 'header' | 'accessorKey' | 'id' | 'cell'> {
  /** Whether the column is sortable */
  sortable?: boolean

  /** Whether the column is filterable */
  filterable?: boolean

  /** Whether the column is visible by default */
  defaultVisible?: boolean

  /** Column width */
  width?: number | string

  /** Minimum column width */
  minWidth?: number

  /** Maximum column width */
  maxWidth?: number

  /** Custom cell renderer */
  cell?: (props: { row: { original: TData }, getValue: () => any }) => React.ReactNode

  /** Custom header renderer */
  header?: (props: { column: ColumnDef<TData> }) => React.ReactNode

  /** Column alignment */
  align?: 'left' | 'center' | 'right'

  /** Enable row spanning */
  enableRowSpanning?: boolean

  /** Enable column pinning */
  enablePinning?: boolean
}

// Bulk action configuration
export interface DataTableBulkAction<TData = any> {
  key: string
  label: string
  onClick: (selectedRows: TData[]) => void
  disabled?: (selectedRows: TData[]) => boolean
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// Export action configuration
export interface DataTableExportAction {
  key: string
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

// Column visibility toggle configuration
export interface DataTableColumnVisibilityToggle {
  key: string
  label: string
  icon?: React.ReactNode
}

// Pagination configuration
export interface DataTablePagination {
  enabled: boolean
  pageSize?: number
  pageIndex?: number
  onPageChange?: (pageIndex: number, pageSize: number) => void
  canNextPage?: boolean
  canPreviousPage?: boolean
  pageCount?: number
  rowCount?: number
  manual?: boolean
}

// Sorting configuration
export interface DataTableSorting {
  enabled: boolean
  onSortChange?: (sorting: SortingState[]) => void
  manual?: boolean
}

// Column visibility configuration
export interface DataTableColumnVisibility {
  enabled: boolean
  onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void
}

// Row selection configuration
export interface DataTableRowSelection {
  enabled: boolean
  onSelectionChange?: (selection: Record<string, boolean>) => void
  selectAll?: boolean
  getRowId?: (row: any) => string
}

// Search/Filter configuration
export interface DataTableSearch {
  enabled: boolean
  placeholder?: string
  onSearch?: (query: string) => void
  debounceMs?: number
}

// Responsive configuration
export interface DataTableResponsive {
  enabled: boolean
  breakpoint?: string
  compactMode?: boolean
}

// Virtual scrolling configuration
export interface DataTableVirtualScrolling {
  enabled: boolean
  height?: number
  overscan?: number
  estimatedRowHeight?: number
}

// Main DataTable props
export interface DataTableProps<TData = any> {
  /** Table data */
  data: TData[]

  /** Table columns */
  columns: DataTableColumn<TData>[]

  /** Table loading state */
  loading?: boolean

  /** Table error state */
  error?: string

  /** Empty state message */
  emptyMessage?: string

  /** Table height */
  height?: number | string

  /** Max height */
  maxHeight?: number | string

  /** Pagination configuration */
  pagination?: DataTablePagination

  /** Sorting configuration */
  sorting?: DataTableSorting

  /** Column visibility configuration */
  columnVisibility?: DataTableColumnVisibility

  /** Row selection configuration */
  rowSelection?: DataTableRowSelection

  /** Search/Filter configuration */
  search?: DataTableSearch

  /** Responsive configuration */
  responsive?: DataTableResponsive

  /** Virtual scrolling configuration */
  virtualScrolling?: DataTableVirtualScrolling

  /** Bulk actions */
  bulkActions?: DataTableBulkAction<TData>[]

  /** Export actions */
  exportActions?: DataTableExportAction[]

  /** Column visibility toggle actions */
  columnVisibilityToggles?: DataTableColumnVisibilityToggle[]

  /** Custom class name */
  className?: string

  /** Custom styles */
  style?: React.CSSProperties

  /** Row click handler */
  onRowClick?: (row: TData, event: React.MouseEvent) => void

  /** Double click handler */
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void

  /** Header actions */
  headerActions?: React.ReactNode

  /** Footer actions */
  footerActions?: React.ReactNode

  /** Table caption */
  caption?: string

  /** Show row numbers */
  showRowNumbers?: boolean

  /** Enable column resizing */
  enableColumnResizing?: boolean

  /** Enable column ordering */
  enableColumnOrdering?: boolean

  /** Enable multi-sort */
  enableMultiSort?: boolean

  /** Sticky header */
  stickyHeader?: boolean

  /** Striped rows */
  striped?: boolean

  /** Hoverable rows */
  hoverable?: boolean

  /** Bordered table */
  bordered?: boolean
}

// Hook return types
export interface UseDataTableReturn<TData> {
  table: any
  refetch: () => void
  getTableData: () => TData[]
  // Additional methods can be added as needed
}