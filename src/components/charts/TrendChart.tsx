/**
 * TrendChart Component
 * Displays risk trends over time with multiple chart types
 */

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils'
import type { RiskTrendData, RiskCategory } from '@/types/risk-monitoring'

export interface TrendChartProps {
  data: RiskTrendData[]
  categories?: RiskCategory[]
  type?: 'line' | 'area' | 'combined'
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d'
  showGrid?: boolean
  showBrush?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  height?: number
  className?: string
  title?: string
  description?: string
  showEvents?: boolean
  threshold?: number
}

const categoryColors: Record<RiskCategory, string> = {
  liquidity: '#10b981',      // green
  market: '#3b82f6',         // blue
  operational: '#f59e0b',    // amber
  compliance: '#8b5cf6',     // purple
  concentration: '#ef4444'   // red
}

const categoryLabels: Record<RiskCategory, string> = {
  liquidity: 'Liquidity',
  market: 'Market',
  operational: 'Operational',
  compliance: 'Compliance',
  concentration: 'Concentration'
}

export function TrendChart({
  data,
  categories = ['liquidity', 'market', 'operational', 'compliance', 'concentration'],
  type = 'area',
  timeRange = '7d',
  showGrid = true,
  showBrush = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  title,
  description,
  showEvents = true,
  threshold = 75
}: TrendChartProps) {
  // Format data for Recharts
  const chartData = data.map(trend => ({
    timestamp: new Date(trend.timestamp),
    overallRisk: trend.overallRisk,
    alertCount: trend.alertCount,
    events: trend.events,
    ...trend.categoryRisks
  }))

  // Format timestamp for display
  const formatXAxis = (tickItem: any) => {
    if (timeRange === '1h' || timeRange === '24h') {
      return tickItem.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return tickItem.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !showTooltip) return null

    return (
      <div className="bg-background border border-border rounded-md p-3 shadow-lg">
        <div className="text-sm font-medium mb-2">
          {label.toLocaleString()}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name}:
            </span>
            <span className="font-medium">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Event markers
  const EventMarkers = () => {
    const eventsData = chartData.filter(item => item.events && item.events.length > 0)

    return (
      <>
        {eventsData.map((item, index) => (
          <ReferenceLine
            key={index}
            x={item.timestamp.getTime()}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{
              value: item.events?.[0],
              position: 'top',
              fill: '#ef4444',
              fontSize: 10,
              angle: -45
            }}
          />
        ))}
      </>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="text-center mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}

            {/* Overall risk line */}
            <Line
              type="monotone"
              dataKey="overallRisk"
              stroke="#1f2937"
              strokeWidth={3}
              dot={false}
              name="Overall Risk"
            />

            {/* Category lines */}
            {categories.map(category => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={categoryColors[category]}
                strokeWidth={2}
                dot={false}
                name={categoryLabels[category]}
              />
            ))}

            {/* Threshold line */}
            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'Risk Threshold', position: 'right' }}
              />
            )}

            {/* Event markers */}
            {showEvents && <EventMarkers />}

            {/* Brush for time range selection */}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke={categoryColors.market}
                tickFormatter={formatXAxis}
              />
            )}

            {showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="line"
                wrapperStyle={{ fontSize: '12px' }}
              />
            )}
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}

            {/* Overall risk area */}
            <Area
              type="monotone"
              dataKey="overallRisk"
              stroke="#1f2937"
              fill="#1f2937"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Overall Risk"
            />

            {/* Category areas */}
            {categories.map(category => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={categoryColors[category]}
                fill={categoryColors[category]}
                fillOpacity={0.2}
                strokeWidth={2}
                name={categoryLabels[category]}
              />
            ))}

            {/* Threshold line */}
            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'Risk Threshold', position: 'right' }}
              />
            )}

            {/* Event markers */}
            {showEvents && <EventMarkers />}

            {/* Brush */}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke={categoryColors.market}
                tickFormatter={formatXAxis}
              />
            )}

            {showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="rect"
                wrapperStyle={{ fontSize: '12px' }}
              />
            )}
          </AreaChart>
        ) : (
          // Combined type: Line for overall, Area for categories
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}

            {/* Category areas */}
            {categories.map(category => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={categoryColors[category]}
                fill={categoryColors[category]}
                fillOpacity={0.1}
                strokeWidth={1}
                name={categoryLabels[category]}
              />
            ))}

            {/* Overall risk line on top */}
            <Line
              type="monotone"
              dataKey="overallRisk"
              stroke="#1f2937"
              strokeWidth={3}
              dot={false}
              name="Overall Risk"
            />

            {/* Alert count secondary axis */}
            <Line
              type="monotone"
              dataKey="alertCount"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Alert Count"
              yAxisId="right"
            />

            {/* Second Y-axis for alert count */}
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              label={{ value: 'Alert Count', angle: 90, position: 'insideRight' }}
            />

            {/* Threshold line */}
            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'Risk Threshold', position: 'right' }}
              />
            )}

            {/* Event markers */}
            {showEvents && <EventMarkers />}

            {/* Brush */}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke={categoryColors.market}
                tickFormatter={formatXAxis}
              />
            )}

            {showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* Summary Statistics */}
      {data.length > 0 && (
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <div>
            Avg Risk: <span className="font-medium text-foreground">
              {(data.reduce((sum, item) => sum + item.overallRisk, 0) / data.length).toFixed(1)}
            </span>
          </div>
          <div>
            Total Alerts: <span className="font-medium text-foreground">
              {data.reduce((sum, item) => sum + item.alertCount, 0)}
            </span>
          </div>
          <div>
            Peak Risk: <span className="font-medium text-foreground">
              {Math.max(...data.map(item => item.overallRisk)).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}