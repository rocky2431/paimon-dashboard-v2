import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { LiquidityDistribution } from '../../types/dashboard'

interface LiquidityChartProps {
  data: LiquidityDistribution[]
  loading?: boolean
  error?: string
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as LiquidityDistribution
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.category}</p>
        <p className="text-sm text-gray-600">
          Value: ${data.value.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Percentage: {data.percentage.toFixed(1)}%
        </p>
      </div>
    )
  }
  return null
}

const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function LiquidityChart({
  data,
  loading,
  error,
  height = 300
}: LiquidityChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Loading liquidity data...</p>
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
          <CardTitle className="text-red-600">Liquidity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-red-600">Error loading liquidity data</p>
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
          <CardTitle>Liquidity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No liquidity data available</p>
              <p className="text-xs text-gray-400">Data will appear once available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Liquidity Distribution</span>
          <span className="text-sm font-normal text-gray-500">
            Total: ${totalValue.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data.map(item => ({ ...item, name: item.category }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry: any) => {
                const payload = entry?.payload as LiquidityDistribution
                return payload ? (
                  <span className="text-sm">
                    {payload.category} ({payload.percentage.toFixed(1)}%)
                  </span>
                ) : value
              }}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default LiquidityChart