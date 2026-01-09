import React from 'react'
import { type Table, type Row, flexRender } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Checkbox } from './checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CardConfig {
  titleColumn?: string
  subtitleColumn?: string
  imageColumn?: string
  priorityColumns?: string[]
  hideColumns?: string[]
}

interface DataTableCardViewProps<TData> {
  table: Table<TData>
  cardConfig?: CardConfig
  onRowClick?: (row: TData, event: React.MouseEvent) => void
  loading?: boolean
  emptyMessage?: string
  showSelection?: boolean
}

interface DataTableCardProps<TData> {
  row: Row<TData>
  cardConfig?: CardConfig
  onRowClick?: (row: TData, event: React.MouseEvent) => void
  showSelection?: boolean
  showActions?: boolean
}

function DataTableCard<TData>({
  row,
  cardConfig,
  onRowClick,
  showSelection,
  showActions,
}: DataTableCardProps<TData>) {
  const data = row.original as Record<string, unknown>

  // Get title from configured column or first visible column
  const titleColumn = cardConfig?.titleColumn
  const title = titleColumn ? String(data[titleColumn] ?? '') : ''

  // Get subtitle from configured column
  const subtitleColumn = cardConfig?.subtitleColumn
  const subtitle = subtitleColumn ? String(data[subtitleColumn] ?? '') : ''

  // Get priority columns to display prominently
  const priorityColumns = cardConfig?.priorityColumns || []
  const hideColumns = cardConfig?.hideColumns || []

  // Get visible cells excluding hidden columns and title/subtitle
  const visibleCells = row.getVisibleCells().filter((cell) => {
    const columnId = cell.column.id
    // Skip selection column, row number, and hidden columns
    if (columnId === 'select' || columnId === 'rowNumber') return false
    if (hideColumns.includes(columnId)) return false
    // Skip title and subtitle columns (already shown in header)
    if (columnId === titleColumn || columnId === subtitleColumn) return false
    return true
  })

  // Separate priority and regular columns
  const priorityCells = visibleCells.filter((cell) =>
    priorityColumns.includes(cell.column.id)
  )
  const regularCells = visibleCells.filter(
    (cell) => !priorityColumns.includes(cell.column.id)
  )

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on checkbox or menu
    const target = e.target as HTMLElement
    if (
      target.closest('[role="checkbox"]') ||
      target.closest('[role="menu"]') ||
      target.closest('button')
    ) {
      return
    }
    onRowClick?.(row.original as TData, e)
  }

  return (
    <Card
      data-testid="datatable-card"
      role="article"
      className={cn(
        'relative cursor-pointer hover:shadow-md transition-shadow',
        row.getIsSelected() && 'ring-2 ring-primary'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {showSelection && (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="mt-1"
              />
            )}
            <div className="min-w-0 flex-1">
              {title && (
                <CardTitle className="text-base truncate">{title}</CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Actions"
                  aria-haspopup="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRowClick?.(row.original as TData, {} as React.MouseEvent)}>
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Priority columns displayed prominently */}
        {priorityCells.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {priorityCells.map((cell) => (
              <div
                key={cell.id}
                className="inline-flex items-center px-2 py-1 bg-muted rounded text-sm"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        )}

        {/* Regular columns */}
        {regularCells.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {regularCells.map((cell) => {
              const header = cell.column.columnDef.header
              const headerText =
                typeof header === 'string'
                  ? header
                  : cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1)

              return (
                <div key={cell.id} className="contents">
                  <dt className="text-muted-foreground">{headerText}:</dt>
                  <dd className="truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

export default function DataTableCardView<TData>({
  table,
  cardConfig,
  onRowClick,
  loading,
  emptyMessage = 'No data available',
  showSelection,
}: DataTableCardViewProps<TData>) {
  const rows = table.getRowModel().rows
  const showActions = !!onRowClick

  if (loading) {
    return (
      <div
        data-testid="datatable-card-view"
        className="flex items-center justify-center py-8 text-muted-foreground"
      >
        Loading...
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        data-testid="datatable-card-view"
        className="flex items-center justify-center py-8 text-muted-foreground"
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      data-testid="datatable-card-view"
      className="grid gap-3 sm:grid-cols-2"
      role="list"
    >
      {rows.map((row) => (
        <DataTableCard
          key={row.id}
          row={row}
          cardConfig={cardConfig}
          onRowClick={onRowClick}
          showSelection={showSelection}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
