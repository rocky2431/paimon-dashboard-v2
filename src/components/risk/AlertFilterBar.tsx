/**
 * AlertFilterBar Component
 * Filtering controls for risk alerts
 */

import { Search, Filter, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { AlertSeverity, RiskCategory } from '@/types/risk-monitoring'

interface AlertFilterBarProps {
  filters: AlertFilters
  onFiltersChange: (filters: AlertFilters) => void
  loading?: boolean
  className?: string
  showDateRange?: boolean
  compact?: boolean
}

export interface AlertFilters {
  search?: string
  severity?: AlertSeverity[]
  category?: RiskCategory[]
  status?: ('active' | 'acknowledged' | 'resolved' | 'dismissed')[]
  dateRange?: {
    start: Date
    end: Date
  }
}

const severityOptions: { value: AlertSeverity; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'error', label: 'Error', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800 border-blue-200' }
]

const categoryOptions: { value: RiskCategory; label: string }[] = [
  { value: 'liquidity', label: 'Liquidity' },
  { value: 'market', label: 'Market' },
  { value: 'operational', label: 'Operational' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'concentration', label: 'Concentration' }
]

const statusOptions: { value: 'active' | 'acknowledged' | 'resolved' | 'dismissed'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' }
]

export function AlertFilterBar({
  filters,
  onFiltersChange,
  loading = false,
  className,
  showDateRange = true,
  compact = false
}: AlertFilterBarProps) {
  const hasActiveFilters = filters.search ||
    filters.severity?.length ||
    filters.category?.length ||
    filters.status?.length ||
    filters.dateRange

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleSeverityToggle = (severity: AlertSeverity) => {
    const currentSeverity = filters.severity || []
    const newSeverity = currentSeverity.includes(severity)
      ? currentSeverity.filter(s => s !== severity)
      : [...currentSeverity, severity]
    onFiltersChange({ ...filters, severity: newSeverity })
  }

  const handleCategoryToggle = (category: RiskCategory) => {
    const currentCategory = filters.category || []
    const newCategory = currentCategory.includes(category)
      ? currentCategory.filter(c => c !== category)
      : [...currentCategory, category]
    onFiltersChange({ ...filters, category: newCategory })
  }

  const handleStatusToggle = (status: 'active' | 'acknowledged' | 'resolved' | 'dismissed') => {
    const currentStatus = filters.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]
    onFiltersChange({ ...filters, status: newStatus })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.severity?.length) count++
    if (filters.category?.length) count++
    if (filters.status?.length) count++
    if (filters.dateRange) count++
    return count
  }

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Severity Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1',
                  filters.severity?.length && 'ring-2 ring-ring'
                )}
              >
                <Filter className="h-4 w-4" />
                Severity
                {filters.severity && filters.severity.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {filters.severity.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                {severityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${option.value}`}
                      checked={filters.severity?.includes(option.value) || false}
                      onCheckedChange={() => handleSeverityToggle(option.value)}
                    />
                    <label
                      htmlFor={`severity-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full border-2', option.color)} />
                        {option.label}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1',
                  filters.category?.length && 'ring-2 ring-ring'
                )}
              >
                <Filter className="h-4 w-4" />
                Category
                {filters.category && filters.category.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {filters.category.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                {categoryOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${option.value}`}
                      checked={filters.category?.includes(option.value) || false}
                      onCheckedChange={() => handleCategoryToggle(option.value)}
                    />
                    <label
                      htmlFor={`category-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1',
                  filters.status?.length && 'ring-2 ring-ring'
                )}
              >
                <Filter className="h-4 w-4" />
                Status
                {filters.status && filters.status.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <label
                      htmlFor={`status-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Range Filter - placeholder */}
          {showDateRange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'gap-1',
                    filters.dateRange && 'ring-2 ring-ring'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Date range filtering coming soon
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Will allow filtering by trigger date range
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {/* Active Filters Summary */}
          {!compact && hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export type { AlertFilterBarProps }