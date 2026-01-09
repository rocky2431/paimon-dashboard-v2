import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RedemptionFilters } from '@/types/redemption'
import { RedemptionStatus, RedemptionChannel } from '@/types/redemption'

interface FilterBarProps {
  filters: RedemptionFilters
  onFiltersChange: (filters: RedemptionFilters) => void
  className?: string
}

const REDEMPTION_STATUS_OPTIONS: { value: RedemptionStatus; label: string }[] = [
  { value: RedemptionStatus.PENDING, label: 'Pending' },
  { value: RedemptionStatus.APPROVED, label: 'Approved' },
  { value: RedemptionStatus.PROCESSING, label: 'Processing' },
  { value: RedemptionStatus.COMPLETED, label: 'Completed' },
  { value: RedemptionStatus.REJECTED, label: 'Rejected' },
  { value: RedemptionStatus.FAILED, label: 'Failed' },
  { value: RedemptionStatus.CANCELLED, label: 'Cancelled' }
]

const REDEMPTION_CHANNEL_OPTIONS: { value: RedemptionChannel; label: string }[] = [
  { value: RedemptionChannel.WALLET, label: 'Wallet' },
  { value: RedemptionChannel.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: RedemptionChannel.CRYPTO, label: 'Crypto' },
  { value: RedemptionChannel.INTERNAL, label: 'Internal' }
]

export function FilterBar({ filters, onFiltersChange, className }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempFilters, setTempFilters] = useState<RedemptionFilters>(filters)

  const handleFilterChange = (key: keyof RedemptionFilters, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    onFiltersChange(tempFilters)
  }

  const clearFilters = () => {
    const emptyFilters: RedemptionFilters = {}
    setTempFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const removeFilter = (key: keyof RedemptionFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setTempFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.length} selected
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('status')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.channel && (
            <Badge variant="secondary" className="gap-1">
              Channel: {filters.channel.length} selected
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('channel')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              Date Range
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('dateRange')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.userId && (
            <Badge variant="secondary" className="gap-1">
              User ID: {filters.userId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('userId')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.amountRange && (
            <Badge variant="secondary" className="gap-1">
              Amount: {filters.amountRange.min} - {filters.amountRange.max}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('amountRange')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('search')}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by user ID, transaction hash..."
              value={tempFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={tempFilters.status?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange('status', value ? [value as RedemptionStatus] : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {REDEMPTION_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Channel Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <Select
                  value={tempFilters.channel?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange('channel', value ? [value as RedemptionChannel] : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {REDEMPTION_CHANNEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User ID Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID</label>
                <Input
                  placeholder="Enter user ID"
                  value={tempFilters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                />
              </div>

              {/* Amount Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={tempFilters.amountRange?.min || ''}
                    onChange={(e) =>
                      handleFilterChange('amountRange', {
                        ...tempFilters.amountRange,
                        min: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={tempFilters.amountRange?.max || ''}
                    onChange={(e) =>
                      handleFilterChange('amountRange', {
                        ...tempFilters.amountRange,
                        max: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={tempFilters.dateRange?.start || ''}
                    onChange={(e) =>
                      handleFilterChange('dateRange', {
                        ...tempFilters.dateRange,
                        start: e.target.value
                      })
                    }
                  />
                  <Input
                    type="date"
                    value={tempFilters.dateRange?.end || ''}
                    onChange={(e) =>
                      handleFilterChange('dateRange', {
                        ...tempFilters.dateRange,
                        end: e.target.value
                      })
                    }
                  />
                </div>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}