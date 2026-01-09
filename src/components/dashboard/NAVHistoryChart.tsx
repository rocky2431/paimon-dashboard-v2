import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { NAVHistoryPoint } from '../../types/dashboard'
import { dashboardService } from '../../services/dashboardService'

interface NAVHistoryChartProps {
  data: NAVHistoryPoint[]
  loading?: boolean
  error?: string
  height?: number
  timeframe?: '7d' | '30d' | '90d' | '1y'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">
          {new Date(data.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="text-sm text-gray-600">
          NAV: {dashboardService.formatCurrency(data.value)}
        </p>
        {data.change !== undefined && (
          <p className={`text-sm flex items-center ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {data.change >= 0 ? '+' : ''}{dashboardService.formatCurrency(data.change)}
            {data.changePercent && ` (${data.changePercent.toFixed(2)}%)`}
          </p>
        )}
      </div>
    )
  }
  return null
}

const formatDateLabel = (dateStr: string, timeframe: string) => {
  const date = new Date(dateStr)

  switch (timeframe) {
    case '7d':
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    case '30d':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case '90d':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case '1y':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatYAxis = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

export function NAVHistoryChart({
  data,
  loading,
  error,
  height = 300,
  timeframe = '30d'
}: NAVHistoryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NAV Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Loading NAV history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">NAV Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-red-600">Error loading NAV history</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NAV Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500">No NAV data available</p>
              <p className="text-xs text-gray-400">Historical data will appear once available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate performance metrics
  const latestValue = data[data.length - 1]?.value || 0
  const firstValue = data[0]?.value || 0
  const totalChange = latestValue - firstValue
  const totalChangePercent = firstValue > 0 ? ((totalChange / firstValue) * 100) : 0

  const getTrendIcon = () => {
    if (totalChange > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (totalChange < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = () => {
    if (totalChange > 0) return 'text-green-600'
    if (totalChange < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>NAV Performance</CardTitle>
        <div className="flex items-center space-x-3 text-sm">
          <div className={`flex items-center ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1 font-medium">
              {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </span>
          </div>
          <span className="text-gray-500">
            {timeframe.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDateLabel(value, timeframe)}
              className="text-xs"
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={formatYAxis}
              className="text-xs"
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#navGradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default NAVHistoryChart