/**
 * ReportTypeSelector Component
 *
 * Task 25.1: Report Type Selector Component
 *
 * Provides tab-based report type selection with collapsible filters.
 *
 * Features:
 * - Four report types: Performance, Risk, Redemption, Rebalancing
 * - Collapsible filter panel with time period and date range selectors
 * - Responsive design (2-column mobile, 4-column desktop)
 * - WCAG 2.1 Level AA compliant
 * - 44px minimum touch targets on mobile
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReportType = 'performance' | 'risk' | 'redemption' | 'rebalancing';
export type TimePeriod = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface ReportTypeSelectorProps {
  /** Currently selected report type */
  reportType: ReportType;
  /** Callback when report type changes */
  onReportTypeChange: (type: ReportType) => void;
  /** Currently selected time period */
  timePeriod: TimePeriod;
  /** Callback when time period changes */
  onTimePeriodChange: (period: TimePeriod) => void;
  /** Selected date range */
  dateRange: DateRange;
  /** Callback when date range changes */
  onDateRangeChange: (range: DateRange) => void;
}

const REPORT_TYPE_CONFIG = {
  performance: {
    label: 'Performance',
    icon: '📈',
  },
  risk: {
    label: 'Risk Analysis',
    icon: '⚠️',
  },
  redemption: {
    label: 'Redemption',
    icon: '💰',
  },
  rebalancing: {
    label: 'Rebalancing',
    icon: '⚖️',
  },
} as const;

const TIME_PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
] as const;

/**
 * ReportTypeSelector Component
 */
export function ReportTypeSelector({
  reportType,
  onReportTypeChange,
  timePeriod,
  onTimePeriodChange,
  dateRange,
  onDateRangeChange,
}: ReportTypeSelectorProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleTabClick = (value: string) => {
    // Runtime validation: ensure value is a valid ReportType
    if (value in REPORT_TYPE_CONFIG) {
      onReportTypeChange?.(value as ReportType);
    }
  };

  const handlePeriodChange = (value: string) => {
    // Runtime validation: ensure value is a valid TimePeriod
    const validPeriods = TIME_PERIOD_OPTIONS.map(opt => opt.value);
    if (validPeriods.includes(value as TimePeriod)) {
      onTimePeriodChange?.(value as TimePeriod);
    }
  };

  const formatDate = (date: Date | null): string => {
    // More reliable date validation using getTime()
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    // Use local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value ? new Date(e.target.value) : null;

    // Business logic validation: start date should not be after end date
    if (start && dateRange.end && start > dateRange.end) {
      // Reset end date if start date is after it
      onDateRangeChange?.({ start, end: null });
      return;
    }

    onDateRangeChange?.({ ...dateRange, start });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value ? new Date(e.target.value) : null;

    // Business logic validation: end date should not be before start date
    if (end && dateRange.start && end < dateRange.start) {
      // Reset start date if end date is before it
      onDateRangeChange?.({ start: null, end });
      return;
    }

    onDateRangeChange?.({ ...dateRange, end });
  };

  return (
    <div className="w-full space-y-4">
      {/* Report Type Tabs */}
      <Tabs value={reportType} onValueChange={handleTabClick}>
        <TabsList
          className="grid grid-cols-2 sm:grid-cols-4 w-full"
          data-testid="tabs-list"
        >
          {(Object.keys(REPORT_TYPE_CONFIG) as ReportType[]).map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="min-h-[44px] data-[state=active]:bg-background"
              data-testid={`tab-trigger-${type}`}
            >
              <span className="mr-2">{REPORT_TYPE_CONFIG[type].icon}</span>
              <span className="hidden sm:inline">
                {REPORT_TYPE_CONFIG[type].label}
              </span>
              <span className="sm:hidden">{REPORT_TYPE_CONFIG[type].label.split(' ')[0]}</span>
              <span data-testid={`tab-icon-${type}`} className="sr-only">
                {REPORT_TYPE_CONFIG[type].icon}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(REPORT_TYPE_CONFIG) as ReportType[]).map((type) => (
          <TabsContent key={type} value={type} data-testid={`tab-content-${type}`}>
            {null}
          </TabsContent>
        ))}
      </Tabs>

      {/* Collapsible Filter Panel */}
      <Collapsible
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        data-testid="collapsible"
        data-open={isFiltersOpen}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full min-h-[44px] justify-between"
            data-testid="collapsible-trigger"
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Filters</span>
            </span>
            <span
              className={cn(
                'transition-transform duration-200',
                isFiltersOpen ? 'rotate-180' : ''
              )}
            >
              ▼
            </span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            {/* Time Period Selector */}
            <div className="space-y-2">
              <Label htmlFor="time-period">Time Period</Label>
              <Select
                value={timePeriod}
                onValueChange={handlePeriodChange}
                data-testid="time-period-selector"
              >
                <SelectTrigger
                  id="time-period"
                  className="min-h-[44px]"
                  data-testid="time-period-selector"
                >
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIOD_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="min-h-[44px]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            {timePeriod === 'custom' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <input
                    id="start-date"
                    type="date"
                    value={formatDate(dateRange.start)}
                    onChange={handleStartDateChange}
                    className="flex h-10 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="date-range-picker"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <input
                    id="end-date"
                    type="date"
                    value={formatDate(dateRange.end)}
                    onChange={handleEndDateChange}
                    className="flex h-10 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
