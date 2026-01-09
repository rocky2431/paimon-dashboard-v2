/**
 * ForecastChart Component
 * Displays liquidity forecast with historical data, predictions,
 * confidence intervals, and scenario analysis
 */

import { useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  LiquidityForecast,
  ForecastTimeframe,
  ConfidenceLevel,
  ScenarioData,
} from '@/types/liquidity-forecast'

export interface ForecastChartProps {
  data: LiquidityForecast
  onTimeframeChange?: (timeframe: ForecastTimeframe) => void
  onConfidenceLevelChange?: (level: ConfidenceLevel) => void
  onRefresh?: () => void
  isLoading?: boolean
  showScenarios?: boolean
  showMetrics?: boolean
  height?: number
  className?: string
}

// Format currency values
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Format date for X-axis
function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Scenario card component
function ScenarioCard({ scenario, isSelected, onClick }: {
  scenario: ScenarioData
  isSelected: boolean
  onClick: () => void
}) {
  const TrendIcon = scenario.changePercent > 0 ? TrendingUp :
                    scenario.changePercent < 0 ? TrendingDown : Minus

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col p-3 rounded-lg border transition-all text-left',
        isSelected
          ? 'border-2 ring-2 ring-offset-1'
          : 'hover:border-muted-foreground/50',
        scenario.scenario === 'optimistic' && isSelected && 'border-green-500 ring-green-200',
        scenario.scenario === 'base' && isSelected && 'border-blue-500 ring-blue-200',
        scenario.scenario === 'pessimistic' && isSelected && 'border-red-500 ring-red-200'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium capitalize">{scenario.scenario}</span>
        <Badge
          variant="secondary"
          className="text-xs"
          style={{ backgroundColor: `${scenario.color}20`, color: scenario.color }}
        >
          {scenario.probability}%
        </Badge>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold">{formatCurrency(scenario.projectedValue)}</span>
        <span className={cn(
          'text-xs flex items-center',
          scenario.changePercent > 0 ? 'text-green-600' :
          scenario.changePercent < 0 ? 'text-red-600' : 'text-muted-foreground'
        )}>
          <TrendIcon className="h-3 w-3 mr-0.5" />
          {scenario.changePercent > 0 ? '+' : ''}{scenario.changePercent.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
        {scenario.description}
      </p>
    </button>
  )
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="text-sm font-medium mb-2">{formatDate(label)}</div>
      <div className="space-y-1">
        {data?.historical !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Historical:</span>
            <span className="font-medium">{formatCurrency(data.historical)}</span>
          </div>
        )}
        {data?.predicted !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Predicted:</span>
            <span className="font-medium text-blue-600">{formatCurrency(data.predicted)}</span>
          </div>
        )}
        {data?.upperBound !== undefined && data?.lowerBound !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Range:</span>
            <span className="font-medium text-muted-foreground">
              {formatCurrency(data.lowerBound)} - {formatCurrency(data.upperBound)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ForecastChart({
  data,
  onTimeframeChange,
  onConfidenceLevelChange,
  onRefresh,
  isLoading = false,
  showScenarios = true,
  showMetrics = true,
  height = 400,
  className,
}: ForecastChartProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('base')

  // Combine historical and forecast data for chart
  const chartData = [
    ...data.historical.map(point => ({
      timestamp: point.timestamp,
      historical: point.value,
      predicted: null,
      upperBound: null,
      lowerBound: null,
    })),
    // Add last historical point as first forecast point for continuity
    ...(data.historical.length > 0 ? [{
      timestamp: data.historical[data.historical.length - 1].timestamp,
      historical: null,
      predicted: data.historical[data.historical.length - 1].value,
      upperBound: data.historical[data.historical.length - 1].value,
      lowerBound: data.historical[data.historical.length - 1].value,
    }] : []),
    ...data.forecast.map(point => ({
      timestamp: point.timestamp,
      historical: null,
      predicted: point.predicted,
      upperBound: point.upperBound,
      lowerBound: point.lowerBound,
    })),
  ]

  // Calculate Y-axis domain with padding
  const allValues = [
    ...data.historical.map(p => p.value),
    ...data.forecast.map(p => p.upperBound),
    ...data.forecast.map(p => p.lowerBound),
  ]
  const minValue = Math.min(...allValues) * 0.95
  const maxValue = Math.max(...allValues) * 1.05

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Liquidity Forecast
              <Badge variant="outline" className="font-normal">
                {data.confidenceLevel}% Confidence
              </Badge>
            </CardTitle>
            <CardDescription>
              Historical trends and predicted liquidity with confidence intervals
            </CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {onTimeframeChange && (
              <Select
                value={data.timeframe}
                onValueChange={(value) => onTimeframeChange(value as ForecastTimeframe)}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="14d">14 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="60d">60 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            )}

            {onConfidenceLevelChange && (
              <Select
                value={String(data.confidenceLevel)}
                onValueChange={(value) => onConfidenceLevelChange(Number(value) as ConfidenceLevel)}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Summary */}
        {showMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-xl font-bold">{formatCurrency(data.metrics.currentLiquidity)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Projected</p>
              <p className={cn(
                'text-xl font-bold',
                data.metrics.changePercent > 0 ? 'text-green-600' :
                data.metrics.changePercent < 0 ? 'text-red-600' : ''
              )}>
                {formatCurrency(data.metrics.projectedLiquidity)}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Change</p>
              <p className={cn(
                'text-xl font-bold flex items-center gap-1',
                data.metrics.changePercent > 0 ? 'text-green-600' :
                data.metrics.changePercent < 0 ? 'text-red-600' : ''
              )}>
                {data.metrics.changePercent > 0 ? <TrendingUp className="h-5 w-5" /> :
                 data.metrics.changePercent < 0 ? <TrendingDown className="h-5 w-5" /> :
                 <Minus className="h-5 w-5" />}
                {data.metrics.changePercent > 0 ? '+' : ''}{data.metrics.changePercent.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Model Confidence</p>
              <p className="text-xl font-bold">{data.metrics.modelConfidence}%</p>
            </div>
          </div>
        )}

        {/* Main Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              domain={[minValue, maxValue]}
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
              tick={{ fontSize: 11 }}
              width={80}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Confidence Interval Area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
              name="Upper Bound"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill="#ffffff"
              fillOpacity={1}
              name="Lower Bound"
              connectNulls={false}
            />

            {/* Historical Line */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#1f2937"
              strokeWidth={2}
              dot={false}
              name="Historical"
              connectNulls={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Forecast"
              connectNulls={false}
            />

            {/* Current date reference line */}
            {data.historical.length > 0 && (
              <ReferenceLine
                x={data.historical[data.historical.length - 1].timestamp}
                stroke="#6b7280"
                strokeDasharray="3 3"
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#6b7280',
                  fontSize: 11,
                }}
              />
            )}

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Scenario Analysis */}
        {showScenarios && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Scenario Analysis
                <Info className="h-4 w-4 text-muted-foreground" />
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.scenarios.map(scenario => (
                <ScenarioCard
                  key={scenario.scenario}
                  scenario={scenario}
                  isSelected={selectedScenario === scenario.scenario}
                  onClick={() => setSelectedScenario(scenario.scenario)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Model Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Forecasts are based on historical patterns and may not reflect future conditions
          </div>
          <div>
            Updated: {new Date(data.metrics.lastUpdated).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
