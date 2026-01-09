/**
 * GaugeChart Component
 * Displays risk levels in a gauge/dial format
 */

import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types/risk-monitoring'

export interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showThresholds?: boolean
  showLabels?: boolean
  className?: string
  title?: string
  description?: string
  thresholds?: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

interface GaugeSegment {
  start: number
  end: number
  color: string
  label: string
}

const defaultThresholds = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 100
}

const sizeConfig = {
  sm: { width: 120, height: 120, strokeWidth: 6 },
  md: { width: 160, height: 160, strokeWidth: 8 },
  lg: { width: 200, height: 200, strokeWidth: 10 },
  xl: { width: 240, height: 240, strokeWidth: 12 }
}

const levelColors = {
  low: '#10b981',    // green
  medium: '#f59e0b', // amber
  high: '#f97316', // orange
  critical: '#ef4444' // red
}

function getRiskLevel(value: number, thresholds: { [key in RiskLevel]: number }): RiskLevel {
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.high) return 'high'
  if (value >= thresholds.medium) return 'medium'
  return 'low'
}

function getGaugeColor(value: number, thresholds: { [key in RiskLevel]: number }): string {
  const level = getRiskLevel(value, thresholds)
  return levelColors[level]
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 'md',
  showThresholds = true,
  showLabels = true,
  className,
  title,
  description,
  thresholds = defaultThresholds
}: GaugeChartProps) {
  const config = sizeConfig[size]
  const percentage = ((value - min) / (max - min)) * 100
  const angle = (percentage * 180) / 100 - 90 // Convert to gauge angle (-90 to 90)
  const riskLevel = getRiskLevel(value, thresholds)
  const gaugeColor = getGaugeColor(value, thresholds)

  // Calculate arc path for the gauge
  const radius = (Math.min(config.width, config.height) / 2) - config.strokeWidth
  const centerX = config.width / 2
  const centerY = config.height / 2

  // Create gauge segments
  const segments: GaugeSegment[] = [
    {
      start: -90,
      end: -90 + (thresholds.low * 180 / 100),
      color: levelColors.low,
      label: 'Low'
    },
    {
      start: -90 + (thresholds.low * 180 / 100),
      end: -90 + (thresholds.medium * 180 / 100),
      color: levelColors.medium,
      label: 'Medium'
    },
    {
      start: -90 + (thresholds.medium * 180 / 100),
      end: -90 + (thresholds.high * 180 / 100),
      color: levelColors.high,
      label: 'High'
    },
    {
      start: -90 + (thresholds.high * 180 / 100),
      end: 90,
      color: levelColors.critical,
      label: 'Critical'
    }
  ]

  // Create path for the gauge arc
  const createGaugePath = (startAngle: number, endAngle: number) => {
    const start = (startAngle * Math.PI) / 180
    const end = (endAngle * Math.PI) / 180
    const largeArcFlag = Math.abs(end - start) > Math.PI ? 1 : 0

    return [
      `M ${centerX + radius * Math.cos(start)} ${centerY + radius * Math.sin(start)}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${centerX + radius * Math.cos(end)} ${centerY + radius * Math.sin(end)}`
    ].join(' ')
  }

  // Create needle path
  const needleLength = radius * 0.7
  const needleX = centerX + needleLength * Math.cos((angle * Math.PI) / 180)
  const needleY = centerY + needleLength * Math.sin((angle * Math.PI) / 180)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="text-center mb-2">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Gauge Chart */}
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />

          {/* Gauge segments */}
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createGaugePath(segment.start, segment.end)}
              fill="none"
              stroke={segment.color}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
            />
          ))}

          {/* Threshold markers */}
          {showThresholds && (
            <>
              {Object.entries(thresholds).map(([level, threshold]) => {
                const thresholdAngle = -90 + (threshold * 180 / 100)
                const markerRadius = radius + 5
                const markerX = centerX + markerRadius * Math.cos((thresholdAngle * Math.PI) / 180)
                const markerY = centerY + markerRadius * Math.sin((thresholdAngle * Math.PI) / 180)

                return (
                  <g key={level}>
                    <line
                      x1={centerX + (radius - 8) * Math.cos((thresholdAngle * Math.PI) / 180)}
                      y1={centerY + (radius - 8) * Math.sin((thresholdAngle * Math.PI) / 180)}
                      x2={centerX + (radius + 8) * Math.cos((thresholdAngle * Math.PI) / 180)}
                      y2={centerY + (radius + 8) * Math.sin((thresholdAngle * Math.PI) / 180)}
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <circle
                      cx={markerX}
                      cy={markerY}
                      r={3}
                      fill={levelColors[level as RiskLevel]}
                    />
                  </g>
                )
              })}
            </>
          )}

          {/* Center value circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={8}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={2}
          />

          {/* Center value text */}
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            className="text-xs font-bold"
            fill="#374151"
          >
            {Math.round(percentage)}%
          </text>
        </svg>

        {/* Needle */}
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#1f2937"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill="#1f2937"
          />
        </svg>
      </div>

      {/* Risk Level Label */}
      {showLabels && (
        <div className="mt-2 text-center">
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              riskLevel === 'critical' && 'bg-red-100 text-red-800',
              riskLevel === 'high' && 'bg-orange-100 text-orange-800',
              riskLevel === 'medium' && 'bg-amber-100 text-amber-800',
              riskLevel === 'low' && 'bg-green-100 text-green-800'
            )}
          >
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </span>
        </div>
      )}

      {/* Value display */}
      <div className="text-center mt-2">
        <span className="text-2xl font-bold" style={{ color: gaugeColor }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          / {max}
        </span>
      </div>

      {/* Thresholds Legend */}
      {showThresholds && (
        <div className="flex justify-center gap-2 mt-2 text-xs">
          {Object.entries(thresholds).map(([level, threshold]) => (
            <div key={level} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: levelColors[level as RiskLevel] }}
              />
              <span className={cn(
                'text-muted-foreground',
                riskLevel === level && 'font-medium text-foreground'
              )}>
                {threshold}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}