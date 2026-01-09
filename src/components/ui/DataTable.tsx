import React, {
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type RowData,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from './table'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Input } from './input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useBreakpoint'
import DataTableCardView, { type CardConfig } from './DataTableCardView'

// DataTable Props
interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  error?: string
  emptyMessage?: string
  pagination?: {
    enabled: boolean
  }
  sorting?: {
    sorting: SortingState
  }
  columnVisibility?: {
    columnVisibility: VisibilityState
  }
  rowSelection?: {
    enabled: boolean
    onSelectionChange?: (selectedRows: TData[]) => void
    rowSelection?: RowSelectionState
  }
  search?: boolean
  className?: string
  onRowClick?: (row: TData, event: React.MouseEvent) => void
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void
  headerActions?: React.ReactNode
  footerActions?: React.ReactNode
  caption?: string
  showRowNumbers?: boolean
  stickyHeader?: boolean
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  /** View mode: 'auto' switches based on viewport, 'table' always table, 'card' always cards */
  viewMode?: 'auto' | 'table' | 'card'
  /** Card configuration for card view */
  cardConfig?: CardConfig
}

// Main DataTable Component
const DataTable = forwardRef(function DataTable<TData extends RowData>(
  props: DataTableProps<TData>,
  ref: React.ForwardedRef<any>
) {
  const {
    data,
    columns: userColumns,
    loading = false,
    emptyMessage = 'No data available',
    pagination,
    sorting,
    columnVisibility,
    rowSelection,
    search,
    onRowClick,
    onRowDoubleClick,
    headerActions,
    caption,
    showRowNumbers = false,
    stickyHeader = false,
    striped = false,
    hoverable = true,
    bordered = false,
    viewMode = 'auto',
    cardConfig
  } = props

  // Responsive detection
  const { isMobile } = useResponsive()

  // Determine if we should show card view
  const shouldShowCards = viewMode === 'card' || (viewMode === 'auto' && isMobile)

  const [globalFilter, setGlobalFilter] = useState('')
  const [sortingState, setSortingState] = useState<SortingState>(sorting?.sorting || [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(columnVisibility?.columnVisibility || {})
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(rowSelection?.rowSelection || {})

  // Enhanced columns with selection
  const columns = useMemo(() => {
    const cols = [...userColumns] as ColumnDef<TData>[]

    // Add row number column
    if (showRowNumbers) {
      cols.unshift({
        id: 'rowNumber',
        header: '#',
        size: 50,
        enableSorting: false,
        cell: ({ row }: any) => row.index + 1
      } as ColumnDef<TData>)
    }

    // Add selection column
    if (rowSelection?.enabled) {
      cols.unshift({
        id: 'select',
        header: ({ table }: any) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: any) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 50
      } as ColumnDef<TData>)
    }

    return cols
  }, [userColumns, showRowNumbers, rowSelection])

  // Table configuration
  const tableConfig = {
    data: data || [],
    columns,
    state: {
      globalFilter,
      sorting: sortingState,
      columnVisibility: columnVisibilityState,
      rowSelection: rowSelectionState,
      columnFilters
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibilityState,
    onRowSelectionChange: setRowSelectionState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false
  }

  const table = useReactTable(tableConfig)

  // Expose table methods via ref
  useImperativeHandle(ref, () => ({
    getTableData: () => data,
    getSelectedRows: () => table.getSelectedRowModel().rows.map(row => row.original),
    clearSelection: () => {
      setRowSelectionState({})
    },
    refresh: () => {
      // Refresh logic can be implemented here
    },
  }), [data, table])

  // Handle row selection changes - use ref to avoid infinite loops
  const onSelectionChangeRef = React.useRef(rowSelection?.onSelectionChange)
  onSelectionChangeRef.current = rowSelection?.onSelectionChange

  useEffect(() => {
    if (onSelectionChangeRef.current) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
      onSelectionChangeRef.current(selectedRows)
    }
  }, [rowSelectionState, table])

  const tableClasses = cn(
    'w-full',
    bordered && 'border',
    striped && '[&>tbody>tr:nth-child(even)]:bg-muted/50',
    hoverable && '[&>tbody>tr:hover]:bg-muted/50'
  )

  const containerStyle = {}

  // Get sortable columns for card view sort control
  const sortableColumns = useMemo(() => {
    return userColumns
      .filter((col) => col.enableSorting !== false)
      .map((col) => ({
        id: (col as any).accessorKey || col.id || '',
        header: typeof col.header === 'string' ? col.header : String((col as any).accessorKey || col.id || ''),
      }))
      .filter((col) => col.id)
  }, [userColumns])

  return (
    <div className="space-y-4">
      {/* Header Actions and Controls */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Search */}
          {search && (
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 w-[200px] sm:w-[300px]"
              />
            </div>
          )}

          {/* Sort control for card view */}
          {shouldShowCards && sorting && sortableColumns.length > 0 && (
            <Select
              value={sortingState[0]?.id || ''}
              onValueChange={(value) => {
                if (value) {
                  const currentSort = sortingState.find((s) => s.id === value)
                  setSortingState([
                    { id: value, desc: currentSort ? !currentSort.desc : false },
                  ])
                } else {
                  setSortingState([])
                }
              }}
            >
              <SelectTrigger className="w-[140px]" aria-label="Sort by">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortableColumns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {headerActions}
      </div>

      {/* Card View or Table View */}
      {shouldShowCards ? (
        <DataTableCardView
          table={table}
          cardConfig={cardConfig}
          onRowClick={onRowClick}
          loading={loading}
          emptyMessage={emptyMessage}
          showSelection={rowSelection?.enabled}
        />
      ) : (
        <div className="rounded-md border overflow-auto" style={containerStyle}>
          <Table className={tableClasses}>
            <TableHeader className={stickyHeader ? 'sticky top-0 bg-background' : ''}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {loading ? 'Loading...' : emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={(e) => onRowClick?.(row.original as TData, e)}
                    onDoubleClick={(e) => onRowDoubleClick?.(row.original as TData, e)}
                    className={cn(
                      hoverable && 'cursor-pointer'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
            {caption && <TableCaption>{caption}</TableCaption>}
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination?.enabled && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

DataTable.displayName = 'DataTable'

export default DataTable