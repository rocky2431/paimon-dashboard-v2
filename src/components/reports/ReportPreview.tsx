/**
 * ReportPreview Component
 *
 * Task 25.2: Report Preview Component
 *
 * Card-based report preview layout with lazy loading and visualizations.
 *
 * Features:
 * - Support for 4 report types: Performance, Risk, Redemption, Rebalancing
 * - Lazy-loaded chart components
 * - Loading and empty states
 * - Responsive grid layout for metrics
 * - WCAG 2.1 Level AA compliant
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { ReportType } from './ReportTypeSelector';

// Lazy load chart components
const PerformanceChart = lazy(() => import('./charts/PerformanceChart'));
const RiskChart = lazy(() => import('./charts/RiskChart'));
const RedemptionChart = lazy(() => import('./charts/RedemptionChart'));
const RebalancingChart = lazy(() => import('./charts/RebalancingChart'));

// Data types for each report type
export interface PerformanceData {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  dailyReturns?: Array<{ date: string; value: number }>;
}

export interface RiskData {
  riskScore: number;
  var95: number;
  cvar95: number;
  beta: number;
  riskDistribution?: Array<{ name: string; value: number; fill: string }>;
}

export interface RedemptionData {
  pendingRequests: number;
  processedToday: number;
  totalAmount: number;
  averageProcessingTime: number;
}

export interface RebalancingData {
  totalTrades: number;
  completedTrades: number;
  pendingTrades: number;
  turnover: number;
}

export type ReportData = PerformanceData | RiskData | RedemptionData | RebalancingData;

export interface ReportPreviewProps {
  /** Report type to display */
  reportType: ReportType;
  /** Report data */
  data: ReportData | null;
  /** Loading state */
  isLoading?: boolean;
  /** Optional error message */
  error?: string | null;
}

/**
 * Format percentage value
 */
function formatPercentage(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format decimal value
 */
function formatDecimal(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
}

/**
 * Skeleton loader for report preview
 */
function ReportPreviewSkeleton() {
  return (
    <Card data-testid="skeleton-loader" className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </CardContent>
      <div role="status" aria-live="polite" className="sr-only">
        Loading report data...
      </div>
    </Card>
  );
}

/**
 * Empty state for report preview
 */
function ReportPreviewEmpty({ reportType }: { reportType: ReportType }) {
  const messages: Record<ReportType, string> = {
    performance: 'No performance data available for the selected period.',
    risk: 'No risk analysis data available.',
    redemption: 'No redemption requests found.',
    rebalancing: 'No rebalancing activity recorded.',
  };

  return (
    <Card data-testid="report-preview-card" role="region" aria-label="Empty report">
      <CardContent className="flex items-center justify-center py-12">
        <Alert>
          <AlertDescription className="text-center">
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm text-muted-foreground">{messages[reportType]}</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

/**
 * Performance metrics display
 */
function PerformanceMetrics({ data }: { data: PerformanceData }) {
  const metrics = [
    {
      label: 'Total Return',
      value: typeof data.totalReturn === 'number' ? formatPercentage(data.totalReturn) : 'N/A',
      color: data.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Sharpe Ratio',
      value: typeof data.sharpeRatio === 'number' ? formatDecimal(data.sharpeRatio) : 'N/A',
      color: 'text-foreground'
    },
    {
      label: 'Max Drawdown',
      value: typeof data.maxDrawdown === 'number' ? formatPercentage(data.maxDrawdown) : 'N/A',
      color: 'text-red-600'
    },
    {
      label: 'Volatility',
      value: typeof data.volatility === 'number' ? formatPercentage(data.volatility) : 'N/A',
      color: 'text-foreground'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className={cn('text-2xl font-bold', metric.color)}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Risk metrics display
 */
function RiskMetrics({ data }: { data: RiskData }) {
  const metrics = [
    { label: 'Risk Score', value: data.riskScore.toString(), suffix: '/100' },
    { label: 'VaR (95%)', value: formatPercentage(data.var95) },
    { label: 'CVaR (95%)', value: formatPercentage(data.cvar95) },
    { label: 'Beta', value: formatDecimal(data.beta) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="text-2xl font-bold">
            {metric.value}
            {metric.suffix && <span className="text-base font-normal text-muted-foreground ml-1">{metric.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Redemption metrics display
 */
function RedemptionMetrics({ data }: { data: RedemptionData }) {
  const metrics = [
    { label: 'Pending Requests', value: data.pendingRequests.toString() },
    { label: 'Processed Today', value: data.processedToday.toString() },
    { label: 'Total Amount', value: formatCurrency(data.totalAmount) },
    { label: 'Avg Processing Time', value: `${data.averageProcessingTime}h` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Rebalancing metrics display
 */
function RebalancingMetrics({ data }: { data: RebalancingData }) {
  const metrics = [
    { label: 'Total Trades', value: data.totalTrades.toString() },
    { label: 'Completed', value: data.completedTrades.toString() },
    { label: 'Pending', value: data.pendingTrades.toString() },
    { label: 'Turnover', value: formatDecimal(data.turnover, 3) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * ReportPreview Component
 */
export function ReportPreview({ reportType, data, isLoading = false, error }: ReportPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state
  if (isLoading) {
    return <ReportPreviewSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Card role="alert" className="w-full border-destructive">
        <CardContent className="flex items-center justify-center py-12">
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium mb-1">Error Loading Report</p>
              <p className="text-sm">{error}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data) {
    return <ReportPreviewEmpty reportType={reportType} />;
  }

  // Render metrics based on report type
  const renderMetrics = () => {
    switch (reportType) {
      case 'performance':
        return <PerformanceMetrics data={data as PerformanceData} />;
      case 'risk':
        return <RiskMetrics data={data as RiskData} />;
      case 'redemption':
        return <RedemptionMetrics data={data as RedemptionData} />;
      case 'rebalancing':
        return <RebalancingMetrics data={data as RebalancingData} />;
      default:
        return null;
    }
  };

  // Render chart based on report type
  const renderChart = () => {
    if (!mounted || !data) return null;

    switch (reportType) {
      case 'performance':
        return <PerformanceChart data={data as PerformanceData} />;
      case 'risk':
        return <RiskChart data={data as RiskData} />;
      case 'redemption':
        return <RedemptionChart data={data as RedemptionData} />;
      case 'rebalancing':
        return <RebalancingChart data={data as RebalancingData} />;
      default:
        return null;
    }
  };

  return (
    <Card
      data-testid="report-preview-card"
      role="region"
      aria-label={`${reportType} report preview`}
      className="w-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    >
      <CardHeader>
        <CardTitle className="capitalize">{reportType} Report</CardTitle>
        <CardDescription>
          Key metrics and visualizations for {reportType} analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        {renderMetrics()}

        {/* Chart - lazy loaded */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          {renderChart()}
        </Suspense>
      </CardContent>
    </Card>
  );
}
