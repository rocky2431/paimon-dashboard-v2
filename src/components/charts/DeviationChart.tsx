/**
 * DeviationChart Component
 *
 * Visualizes current vs target asset allocations with deviation indicators
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { AssetAllocation } from '@/types/rebalancing'

export interface DeviationChartProps {
  data: AssetAllocation[]
  height?: number
  showTargetLine?: boolean
  threshold?: number
  className?: string
  onAssetClick?: (asset: AssetAllocation) => void
}

const getDeviationColor = (deviation: number, threshold = 5): string => {
  const absDeviation = Math.abs(deviation)
  if (absDeviation >= threshold * 2) return '#ef4444' // red - critical
  if (absDeviation >= threshold) return '#f97316' // orange - warning
  if (absDeviation > 0) return '#f59e0b' // amber - minor
  return '#10b981' // green - balanced
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as AssetAllocation

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {data.name} ({data.symbol})
      </p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Current:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {data.currentWeight.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Target:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {data.targetWeight.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Deviation:</span>
          <span
            className={cn(
              'font-medium',
              data.deviation > 0 ? 'text-orange-600' : data.deviation < 0 ? 'text-blue-600' : 'text-green-600'
            )}
          >
            {data.deviation > 0 ? '+' : ''}{data.deviation.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">Value:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${(data.currentValue / 1000000).toFixed(2)}M
          </span>
        </div>
        {data.action && data.action !== 'hold' && (
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Action:</span>
            <span
              className={cn(
                'font-medium uppercase text-xs',
                data.action === 'buy' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {data.action}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function DeviationChart({
  data,
  height = 400,
  showTargetLine = true,
  threshold: _threshold = 5,
  className,
  onAssetClick,
}: DeviationChartProps) {
  // Transform data for chart
  const chartData = data.map(asset => ({
    ...asset,
    name: asset.symbol,
    fullName: asset.name,
  }))

  const handleBarClick = (data: any) => {
    if (onAssetClick && data) {
      onAssetClick(data)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: 'Weight (%)',
              angle: -90,
              position: 'insideLeft',
              fill: 'currentColor',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Target weight reference line for threshold */}
          {showTargetLine && (
            <>
              <ReferenceLine
                y={0}
                stroke="#9ca3af"
                strokeDasharray="3 3"
                label={{ value: 'Baseline', position: 'right', fill: '#9ca3af', fontSize: 10 }}
              />
            </>
          )}

          {/* Current weight bars */}
          <Bar
            dataKey="currentWeight"
            name="Current Weight"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
          />

          {/* Target weight bars */}
          <Bar
            dataKey="targetWeight"
            name="Target Weight"
            fill="#9ca3af"
            fillOpacity={0.5}
            radius={[4, 4, 0, 0]}
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Deviation Bar Chart - shows only deviation values
export interface DeviationBarChartProps {
  data: AssetAllocation[]
  height?: number
  threshold?: number
  className?: string
  onAssetClick?: (asset: AssetAllocation) => void
}

export function DeviationBarChart({
  data,
  height = 300,
  threshold = 5,
  className,
  onAssetClick,
}: DeviationBarChartProps) {
  const chartData = data.map(asset => ({
    ...asset,
    name: asset.symbol,
    absDeviation: Math.abs(asset.deviation),
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            type="number"
            domain={[-15, 15]}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: 'Deviation (%)',
              position: 'bottom',
              fill: 'currentColor',
              fontSize: 12,
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Threshold reference lines */}
          <ReferenceLine
            x={threshold}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{ value: `+${threshold}%`, position: 'top', fill: '#f97316', fontSize: 10 }}
          />
          <ReferenceLine
            x={-threshold}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{ value: `-${threshold}%`, position: 'top', fill: '#f97316', fontSize: 10 }}
          />
          <ReferenceLine x={0} stroke="#9ca3af" />

          {/* Deviation bars with conditional coloring */}
          <Bar
            dataKey="deviation"
            name="Deviation"
            radius={[0, 4, 4, 0]}
            onClick={onAssetClick ? (data: any) => onAssetClick(data) : undefined}
            cursor={onAssetClick ? 'pointer' : 'default'}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getDeviationColor(entry.deviation, threshold)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
