import { useDashboardStats, useRecentEvents, useLiquidityDistribution, useNAVHistory } from '../hooks/useDashboard'
import { useDashboardWebSocket } from '../hooks/useDashboardWebSocket'
import StatCard from '../components/dashboard/StatCard'
import RecentEvents from '../components/dashboard/RecentEvents'
import LiquidityChart from '../components/dashboard/LiquidityChart'
import NAVHistoryChart from '../components/dashboard/NAVHistoryChart'
import WebSocketStatus from '../components/dashboard/WebSocketStatus'
import { DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  // WebSocket real-time updates
  const { connectionInfo } = useDashboardWebSocket()

  // Dashboard data hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: events, isLoading: eventsLoading, error: eventsError } = useRecentEvents()
  const { data: liquidity, isLoading: liquidityLoading, error: liquidityError } = useLiquidityDistribution()
  const { data: navHistory, isLoading: navLoading, error: navError } = useNAVHistory()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor fund performance and key metrics
          </p>
        </div>

        {/* WebSocket Connection Status */}
        <WebSocketStatus connectionInfo={connectionInfo} showDetails={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Asset Value"
          value={stats?.netAssetValue || 0}
          change={stats?.netAssetValue ? stats.netAssetValue * 0.025 : undefined}
          changePercent={2.5}
          trend="up"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
          error={statsError ? 'Failed to load NAV data' : undefined}
        />

        <StatCard
          title="Assets Under Management"
          value={stats?.assetsUnderManagement || 0}
          change={stats?.assetsUnderManagement ? stats.assetsUnderManagement * 0.123 : undefined}
          changePercent={12.3}
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
          error={statsError ? 'Failed to load AUM data' : undefined}
        />

        <StatCard
          title="Total Shares"
          value={stats?.totalShares || 0}
          change={123}
          changePercent={0.27}
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
          error={statsError ? 'Failed to load shares data' : undefined}
        />

        <StatCard
          title="Pending Redemptions"
          value={stats?.pendingRedemptions || 0}
          trend="neutral"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
          error={statsError ? 'Failed to load redemptions data' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NAVHistoryChart
          data={navHistory || []}
          loading={navLoading}
          error={navError ? 'Failed to load NAV history' : undefined}
          timeframe="30d"
        />

        <LiquidityChart
          data={liquidity || []}
          loading={liquidityLoading}
          error={liquidityError ? 'Failed to load liquidity data' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentEvents
          events={events || []}
          loading={eventsLoading}
          error={eventsError ? 'Failed to load recent events' : undefined}
          maxItems={10}
        />
      </div>
    </div>
  )
}