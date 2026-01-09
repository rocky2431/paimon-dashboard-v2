/**
 * Dashboard Types
 *
 * Type definitions for dashboard data structures and API responses
 */

export interface DashboardStats {
  netAssetValue: number
  assetsUnderManagement: number
  totalShares: number
  pendingRedemptions: number
  lastUpdated: string
}

export interface LiquidityDistribution {
  category: string
  value: number
  percentage: number
  color?: string
}

export interface NAVHistoryPoint {
  date: string
  value: number
  change?: number
  changePercent?: number
}

export interface RecentEvent {
  id: string
  type: 'redemption' | 'deposit' | 'rebalance' | 'risk_alert' | 'approval' | 'system'
  title: string
  description: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'completed' | 'failed'
  metadata?: Record<string, any>
}

export interface DashboardData {
  stats: DashboardStats
  liquidityDistribution: LiquidityDistribution[]
  navHistory: NAVHistoryPoint[]
  recentEvents: RecentEvent[]
}

export interface DashboardApiResponse {
  success: boolean
  data: DashboardData
  timestamp: string
}

// WebSocket message types for real-time updates
export interface DashboardWebSocketMessage {
  type: 'stats_update' | 'new_event' | 'nav_update'
  data: Partial<DashboardData>
  timestamp: string
}

// Component props types
export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  loading?: boolean
  error?: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

export interface PerformanceChartProps {
  data: NAVHistoryPoint[]
  loading?: boolean
  error?: string
  height?: number
}

export interface LiquidityChartProps {
  data: LiquidityDistribution[]
  loading?: boolean
  error?: string
  height?: number
}

export interface RecentEventsProps {
  events: RecentEvent[]
  loading?: boolean
  error?: string
  maxItems?: number
}

// Query key types for TanStack Query
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  stats: () => [...DASHBOARD_QUERY_KEYS.all, 'stats'] as const,
  liquidity: () => [...DASHBOARD_QUERY_KEYS.all, 'liquidity'] as const,
  navHistory: (days?: number) => [...DASHBOARD_QUERY_KEYS.all, 'navHistory', days] as const,
  recentEvents: (limit?: number) => [...DASHBOARD_QUERY_KEYS.all, 'recentEvents', limit] as const,
} as const