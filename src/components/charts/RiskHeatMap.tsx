/**
 * RiskHeatMap Component
 * Displays risk exposure distribution across categories and levels
 */

import { cn } from '@/lib/utils'
import type { RiskHeatMapData, RiskCategory, RiskLevel } from '@/types/risk-monitoring'

export interface RiskHeatMapProps {
  data: RiskHeatMapData[]
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabels?: boolean
  showValues?: boolean
  showLegend?: boolean
  className?: string
  title?: string
  description?: string
  onCellClick?: (data: RiskHeatMapData) => void
}

const sizeConfig = {
  sm: { cellSize: 40, fontSize: 10, gap: 2 },
  md: { cellSize: 60, fontSize: 12, gap: 4 },
  lg: { cellSize: 80, fontSize: 14, gap: 6 },
  xl: { cellSize: 100, fontSize: 16, gap: 8 }
}

const levelColors = {
  low: '#10b981',      // green
  medium: '#f59e0b',   // amber
  high: '#f97316',     // orange
  critical: '#ef4444'  // red
}

const categoryLabels: Record<RiskCategory, string> = {
  liquidity: 'Liquidity',
  market: 'Market',
  operational: 'Operational',
  compliance: 'Compliance',
  concentration: 'Concentration'
}

const levelLabels: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
}

export function RiskHeatMap({
  data,
  size = 'md',
  showLabels = true,
  showValues = true,
  showLegend = true,
  className,
  title,
  description,
  onCellClick
}: RiskHeatMapProps) {
  const config = sizeConfig[size]

  // Create a matrix of categories x levels
  const categories = Array.from(new Set(data.map(item => item.category)))
  const levels = Array.from(new Set(data.map(item => item.level)))

  // Create the heatmap matrix
  const matrix: (RiskHeatMapData | null)[][] = categories.map(category =>
    levels.map(level => {
      const found = data.find(item => item.category === category && item.level === level)
      return found || null
    })
  )

  const maxValue = Math.max(...data.map(item => item.percentage))

  const handleCellClick = (cellData: RiskHeatMapData | null) => {
    if (cellData && onCellClick) {
      onCellClick(cellData)
    }
  }

  const getCellOpacity = (value: number) => {
    if (value === 0) return 0.1
    return 0.3 + (value / maxValue) * 0.7 // Range from 0.3 to 1.0
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

      {/* Heat Map Grid */}
      <div className="flex flex-col items-center">
        {/* Column Headers (Risk Levels) */}
        {showLabels && (
          <div className="flex mb-2">
            <div style={{ width: config.cellSize }} />
            {levels.map(level => (
              <div
                key={level}
                className="flex items-center justify-center font-medium text-xs text-muted-foreground"
                style={{
                  width: config.cellSize,
                  height: config.cellSize,
                  fontSize: config.fontSize
                }}
              >
                {levelLabels[level]}
              </div>
            ))}
          </div>
        )}

        {/* Heat Map Rows */}
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Row Header (Category) */}
            {showLabels && (
              <div
                className="flex items-center justify-end pr-2 font-medium text-xs text-muted-foreground"
                style={{
                  width: config.cellSize,
                  height: config.cellSize,
                  fontSize: config.fontSize
                }}
              >
                {categoryLabels[categories[rowIndex]]}
              </div>
            )}

            {/* Heat Map Cells */}
            {row.map((cell, cellIndex) => (
              <div
                key={`${rowIndex}-${cellIndex}`}
                className={cn(
                  'border rounded-md flex items-center justify-center cursor-pointer transition-all hover:scale-105',
                  'border-border',
                  cell && 'hover:shadow-md'
                )}
                style={{
                  width: config.cellSize,
                  height: config.cellSize,
                  backgroundColor: cell
                    ? `${levelColors[cell.level]}${Math.round(getCellOpacity(cell.percentage) * 255).toString(16).padStart(2, '0')}`
                    : 'transparent',
                  gap: config.gap,
                  fontSize: config.fontSize
                }}
                onClick={() => handleCellClick(cell)}
                title={cell?.description}
              >
                {cell && showValues && (
                  <span className="font-semibold text-white text-center">
                    {cell.percentage > 0 ? `${cell.percentage.toFixed(0)}%` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-2">Risk Level</div>
          <div className="flex gap-4">
            {Object.entries(levelColors).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {levelLabels[level as RiskLevel]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {data.length > 0 && (
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground">
            Total Risk Items: <span className="font-medium text-foreground">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Categories Affected: <span className="font-medium text-foreground">
              {categories.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}