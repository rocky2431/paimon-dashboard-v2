/**
 * RiskMetrics Component
 * Displays risk metrics in card format with trend indicators
 */

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskMetric } from '@/types/risk-monitoring'

export interface RiskMetricsProps {
  metrics: RiskMetric[]
  layout?: 'grid' | 'list' | 'carousel'
  size?: 'sm' | 'md' | 'lg'
  showTrends?: boolean
  showThresholds?: boolean
  clickable?: boolean
  onMetricClick?: (metric: RiskMetric) => void
  className?: string
  title?: string
  description?: string
}

const sizeConfig = {
  sm: {
    padding: 'p-3',
    titleSize: 'text-sm font-medium',
    valueSize: 'text-lg font-bold',
    descriptionSize: 'text-xs',
    iconSize: 16
  },
  md: {
    padding: 'p-4',
    titleSize: 'text-base font-semibold',
    valueSize: 'text-xl font-bold',
    descriptionSize: 'text-sm',
    iconSize: 20
  },
  lg: {
    padding: 'p-6',
    titleSize: 'text-lg font-semibold',
    valueSize: 'text-2xl font-bold',
    descriptionSize: 'text-base',
    iconSize: 24
  }
}

const levelColors = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    value: 'text-green-600',
    icon: 'text-green-500'
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    value: 'text-amber-600',
    icon: 'text-amber-500'
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    value: 'text-orange-600',
    icon: 'text-orange-500'
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    value: 'text-red-600',
    icon: 'text-red-500'
  }
}

const levelIcons = {
  low: Minus,
  medium: TrendingUp,
  high: TrendingUp,
  critical: AlertTriangle
}

function getThresholdStatus(value: number, threshold: number): 'below' | 'near' | 'above' {
  if (value <= threshold * 0.8) return 'below'
  if (value <= threshold) return 'near'
  return 'above'
}

export function RiskMetrics({
  metrics,
  layout = 'grid',
  size = 'md',
  showTrends = true,
  showThresholds = true,
  clickable = false,
  onMetricClick,
  className,
  title,
  description
}: RiskMetricsProps) {
  const config = sizeConfig[size]

  const handleMetricClick = (metric: RiskMetric) => {
    if (clickable && onMetricClick) {
      onMetricClick(metric)
    }
  }

  const MetricCard = ({ metric }: { metric: RiskMetric }) => {
    const levelStyle = levelColors[metric.level]
    const TrendIcon = levelIcons[metric.level]
    const thresholdStatus = getThresholdStatus(metric.value, metric.threshold)

    return (
      <div
        className={cn(
          'bg-card border rounded-lg transition-all hover:shadow-md',
          levelStyle.bg,
          levelStyle.border,
          clickable && 'cursor-pointer hover:scale-105',
          config.padding
        )}
        onClick={() => handleMetricClick(metric)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className={cn(config.titleSize, 'text-foreground')}>
              {metric.name}
            </h4>
            <p className={cn(config.descriptionSize, 'text-muted-foreground mt-1')}>
              {metric.description}
            </p>
          </div>
          {showTrends && (
            <div className={cn('flex items-center', levelStyle.icon)}>
              <TrendIcon size={config.iconSize} />
            </div>
          )}
        </div>

        {/* Value and Threshold */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={cn(config.valueSize, levelStyle.value)}>
            {metric.value.toFixed(1)}
          </span>
          <span className={cn(config.descriptionSize, 'text-muted-foreground')}>
            / {metric.threshold} {metric.unit}
          </span>
        </div>

        {/* Progress Bar */}
        {showThresholds && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                thresholdStatus === 'above' && 'bg-red-500',
                thresholdStatus === 'near' && 'bg-amber-500',
                thresholdStatus === 'below' && 'bg-green-500'
              )}
              style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            levelStyle.bg,
            levelStyle.text
          )}>
            {metric.level.charAt(0).toUpperCase() + metric.level.slice(1)}
          </span>
          <div className="flex items-center gap-2">
            {/* Trend Indicator */}
            {showTrends && (
              <div className={cn(
                'flex items-center gap-1 text-xs',
                metric.trend === 'up' && 'text-red-500',
                metric.trend === 'down' && 'text-green-500',
                metric.trend === 'stable' && 'text-gray-500'
              )}>
                {metric.trend === 'up' && <TrendingUp size={12} />}
                {metric.trend === 'down' && <TrendingDown size={12} />}
                {metric.trend === 'stable' && <Minus size={12} />}
                <span>{metric.trend}</span>
              </div>
            )}
            {/* Last Updated */}
            <span className={cn(config.descriptionSize, 'text-muted-foreground')}>
              {new Date(metric.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <div className={cn('flex flex-col space-y-3', className)}>
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        {metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {(title || description) && (
        <div className="text-center mb-4">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className={cn(
        'grid gap-4',
        size === 'sm' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        size === 'md' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        size === 'lg' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  )
}