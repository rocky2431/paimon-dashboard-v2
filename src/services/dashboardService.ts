import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'
import type {
  DashboardData,
  DashboardStats,
  LiquidityDistribution,
  NAVHistoryPoint,
  RecentEvent
} from '../types/dashboard'

// Backend response types aligned with OpenAPI spec
interface FundOverviewResponse {
  total_aum: number
  nav_per_share: number
  total_shares: number
  pending_redemptions: number
  last_updated: string
}

interface AssetAllocation {
  asset: string
  amount: number
  percentage: number
  tier: string
}

interface NAVHistoryResponse {
  data: {
    date: string
    nav: number
    change?: number
    change_percent?: number
  }[]
  timeframe: string
}

// Audit entry response type (from /audit/recent)
interface AuditEntryResponse {
  id: string
  category?: string
  action: string
  description?: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

class DashboardService {
  /**
   * Fetch complete dashboard data from Fund API
   */
  async fetchDashboardData(): Promise<DashboardData> {
    try {
      // Fetch all data in parallel
      const [overviewResponse, allocationsResponse, navHistoryResponse, recentEventsResponse] = await Promise.all([
        apiClient.get<FundOverviewResponse>(API_ENDPOINTS.FUND.OVERVIEW),
        apiClient.get<AssetAllocation[]>(API_ENDPOINTS.FUND.ALLOCATIONS_ASSETS),
        apiClient.get<NAVHistoryResponse>(API_ENDPOINTS.FUND.NAV_HISTORY, {
          params: { days: 30, limit: 100 }
        }),
        apiClient.get<AuditEntryResponse[]>(API_ENDPOINTS.AUDIT.RECENT, {
          params: { limit: 10 }
        })
      ])

      const overview = overviewResponse.data
      const allocations = allocationsResponse.data

      return {
        stats: {
          netAssetValue: overview.nav_per_share,
          assetsUnderManagement: overview.total_aum,
          totalShares: overview.total_shares,
          pendingRedemptions: overview.pending_redemptions,
          lastUpdated: overview.last_updated
        },
        liquidityDistribution: allocations.map((a, index) => ({
          category: a.asset,
          value: a.amount,
          percentage: a.percentage,
          color: this.getColorForIndex(index)
        })),
        navHistory: navHistoryResponse.data.data.map(point => ({
          date: point.date,
          value: point.nav,
          change: point.change || 0,
          changePercent: point.change_percent || 0
        })),
        recentEvents: recentEventsResponse.data.map((entry) => ({
          id: entry.id,
          type: this.mapCategoryToEventType(entry.category),
          title: entry.action,
          description: entry.description || '',
          timestamp: entry.timestamp,
          severity: this.mapSeverity(entry.severity),
          status: 'completed' as const
        }))
      }
    } catch (error: any) {
      console.error('[DashboardService] fetchDashboardData failed:', {
        message: error.message,
        status: error.response?.status
      })
      throw new Error(`Failed to load dashboard data: ${error.message}`)
    }
  }

  /**
   * Fetch dashboard statistics from Fund Overview API
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<FundOverviewResponse>(API_ENDPOINTS.FUND.OVERVIEW)
      const data = response.data

      return {
        netAssetValue: data.nav_per_share,
        assetsUnderManagement: data.total_aum,
        totalShares: data.total_shares,
        pendingRedemptions: data.pending_redemptions,
        lastUpdated: data.last_updated
      }
    } catch (error: any) {
      console.error('[DashboardService] fetchDashboardStats failed:', {
        message: error.message,
        status: error.response?.status
      })
      throw new Error(`Failed to load dashboard stats: ${error.message}`)
    }
  }

  /**
   * Fetch liquidity distribution from Fund Allocations API
   */
  async fetchLiquidityDistribution(): Promise<LiquidityDistribution[]> {
    try {
      const response = await apiClient.get<AssetAllocation[]>(API_ENDPOINTS.FUND.ALLOCATIONS_ASSETS)
      const data = response.data

      return data.map((allocation, index) => ({
        category: allocation.asset,
        value: allocation.amount,
        percentage: allocation.percentage,
        color: this.getColorForIndex(index)
      }))
    } catch (error: any) {
      console.error('[DashboardService] fetchLiquidityDistribution failed:', {
        message: error.message,
        status: error.response?.status
      })
      throw new Error(`Failed to load liquidity distribution: ${error.message}`)
    }
  }

  /**
   * Fetch NAV history from Fund NAV History API
   * Uses 'days' and 'limit' params instead of 'timeframe'
   */
  async fetchNAVHistory(days: number = 30): Promise<NAVHistoryPoint[]> {
    try {
      const response = await apiClient.get<NAVHistoryResponse>(API_ENDPOINTS.FUND.NAV_HISTORY, {
        params: { days, limit: 100 }
      })
      const data = response.data

      return data.data.map(point => ({
        date: point.date,
        value: point.nav,
        change: point.change || 0,
        changePercent: point.change_percent || 0
      }))
    } catch (error: any) {
      console.error('[DashboardService] fetchNAVHistory failed:', {
        message: error.message,
        status: error.response?.status
      })
      throw new Error(`Failed to load NAV history: ${error.message}`)
    }
  }

  /**
   * Fetch recent events (using audit/risk alerts as source)
   */
  async fetchRecentEvents(limit = 10): Promise<RecentEvent[]> {
    try {
      const response = await apiClient.get<AuditEntryResponse[]>(API_ENDPOINTS.AUDIT.RECENT, {
        params: { limit }
      })

      return response.data.map((entry) => ({
        id: entry.id,
        type: this.mapCategoryToEventType(entry.category),
        title: entry.action,
        description: entry.description || '',
        timestamp: entry.timestamp,
        severity: this.mapSeverity(entry.severity),
        status: 'completed' as const
      }))
    } catch (error: any) {
      console.error('[DashboardService] fetchRecentEvents failed:', {
        message: error.message,
        status: error.response?.status
      })
      throw new Error(`Failed to load recent events: ${error.message}`)
    }
  }

  private mapCategoryToEventType(category?: string): RecentEvent['type'] {
    const validTypes: RecentEvent['type'][] = ['redemption', 'deposit', 'rebalance', 'risk_alert', 'approval', 'system']
    if (category === 'risk') return 'risk_alert'
    return validTypes.includes(category as RecentEvent['type']) ? category as RecentEvent['type'] : 'system'
  }

  private mapSeverity(severity?: string): RecentEvent['severity'] {
    if (severity === 'critical') return 'high'
    if (severity === 'low' || severity === 'medium' || severity === 'high') return severity
    return 'low'
  }

  /**
   * Get color for chart based on index
   */
  private getColorForIndex(index: number): string {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
    return colors[index % colors.length]
  }

  /**
   * Format currency values for display
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  /**
   * Format percentage values for display
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    if (diffMs < 60 * 1000) {
      return 'Just now'
    } else if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(diffMs / (60 * 1000))
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000))
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }
}

// Create singleton instance
export const dashboardService = new DashboardService()

export default dashboardService
