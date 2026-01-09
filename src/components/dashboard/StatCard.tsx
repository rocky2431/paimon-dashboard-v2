import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { StatCardProps } from '../../types/dashboard'
import { dashboardService } from '../../services/dashboardService'

export function StatCard({
  title,
  value,
  change,
  changePercent,
  trend,
  icon,
  loading,
  error
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toString()
    }
    return val
  }

  const getTrendIcon = () => {
    if (!trend) return null

    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600'

    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatChange = (changeValue?: number): string => {
    if (changeValue === undefined) return ''

    const sign = changeValue >= 0 ? '+' : ''
    if (Math.abs(changeValue) >= 1000000) {
      return `${sign}${(changeValue / 1000000).toFixed(1)}M`
    } else if (Math.abs(changeValue) >= 1000) {
      return `${sign}${(changeValue / 1000).toFixed(1)}K`
    }
    return `${sign}${changeValue.toFixed(0)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-red-600 text-sm">Error loading data</div>
            <div className="text-xs text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {typeof value === 'number' && title.toLowerCase().includes('value') ||
             title.toLowerCase().includes('management') ||
             title.toLowerCase().includes('nav') ?
              dashboardService.formatCurrency(Number(value)) :
              formatValue(value)
            }
          </div>
          {(change !== undefined || changePercent !== undefined) && (
            <p className={`text-xs ${getTrendColor()}`}>
              {change !== undefined && formatChange(change)}
              {change !== undefined && changePercent !== undefined && ' '}
              {changePercent !== undefined && `(${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
              {change !== undefined || changePercent !== undefined ? ' from last month' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard