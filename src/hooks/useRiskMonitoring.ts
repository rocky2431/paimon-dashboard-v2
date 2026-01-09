import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { riskMonitoringApi } from '@/services/risk-monitoring-api'
import { useWebSocket } from '@/hooks/useWebSocket'
import type {
  RiskAlertFilters,
  RiskMetricFilters,
  RiskCategory
} from '@/types/risk-monitoring'
import type {
  RiskAlertMessage
} from '@/lib/websocket-types'
import { toast } from 'sonner'

// Query keys
export const riskMonitoringKeys = {
  all: ['risk-monitoring'] as const,
  dashboard: () => [...riskMonitoringKeys.all, 'dashboard'] as const,
  metrics: (filters?: RiskMetricFilters) => [...riskMonitoringKeys.all, 'metrics', filters] as const,
  alerts: (page?: number, pageSize?: number, filters?: RiskAlertFilters) =>
    [...riskMonitoringKeys.all, 'alerts', page, pageSize, filters] as const,
  trends: (timeframe?: string) => [...riskMonitoringKeys.all, 'trends', timeframe] as const
}

/**
 * Hook for fetching complete risk dashboard data
 */
export function useRiskDashboard() {
  return useQuery({
    queryKey: riskMonitoringKeys.dashboard(),
    queryFn: () => riskMonitoringApi.getRiskDashboardData(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds for real-time updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  })
}

/**
 * Hook for fetching risk metrics
 */
export function useRiskMetrics(filters?: RiskMetricFilters) {
  return useQuery({
    queryKey: riskMonitoringKeys.metrics(filters),
    queryFn: () => riskMonitoringApi.getRiskMetrics(filters),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true
  })
}

/**
 * Hook for fetching risk alerts with pagination and filters
 */
export function useRiskAlerts(
  page: number = 1,
  pageSize: number = 20,
  filters?: RiskAlertFilters
) {
  return useQuery({
    queryKey: riskMonitoringKeys.alerts(page, pageSize, filters),
    queryFn: () => riskMonitoringApi.getRiskAlerts(page, pageSize, filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 15, // 15 seconds for alerts
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData // Keep previous data for infinite scroll
  })
}

/**
 * Hook for fetching risk trends
 */
export function useRiskTrends(timeframe: '1h' | '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: riskMonitoringKeys.trends(timeframe),
    queryFn: () => riskMonitoringApi.getRiskTrends(timeframe),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true
  })
}

/**
 * Hook for acknowledging risk alerts
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes?: string }) =>
      riskMonitoringApi.acknowledgeAlert(alertId, notes),
    onSuccess: () => {
      toast.success('Alert acknowledged successfully')
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.alerts() })
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.dashboard() })
    },
    onError: (error) => {
      toast.error('Failed to acknowledge alert')
      console.error('Acknowledge alert error:', error)
    }
  })
}


/**
 * Hook for batch acknowledging alerts
 */
export function useAcknowledgeMultipleAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ alertIds, notes }: { alertIds: string[]; notes?: string }) =>
      riskMonitoringApi.acknowledgeMultipleAlerts(alertIds, notes),
    onSuccess: (_, { alertIds }) => {
      toast.success(`${alertIds.length} alerts acknowledged successfully`)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.alerts() })
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.dashboard() })
    },
    onError: (error) => {
      toast.error('Failed to acknowledge alerts')
      console.error('Batch acknowledge error:', error)
    }
  })
}


/**
 * Hook for exporting risk reports
 */
export function useExportReport() {
  return useMutation({
    mutationFn: (request: {
      timeframe: string
      categories: RiskCategory[]
      format: 'pdf' | 'excel' | 'csv'
      includeAlerts: boolean
      includeTrends: boolean
      includeRecommendations: boolean
    }) => riskMonitoringApi.exportRiskReport(request),
    onSuccess: (data) => {
      toast.success('Risk report exported successfully')
      console.log('Report exported:', data)
    },
    onError: (error) => {
      toast.error('Failed to export risk report')
      console.error('Export report error:', error)
    }
  })
}

/**
 * Hook for real-time risk monitoring WebSocket updates
 * Note: Backend only supports 'risk:alert' and 'risk:score' channels
 */
export function useRiskMonitoringWebSocket() {
  const queryClient = useQueryClient()
  const { subscribe, unsubscribe, isConnected } = useWebSocket()

  React.useEffect(() => {
    if (!isConnected) return

    // Handle risk alert messages - channel is 'risk:alert' (singular)
    const handleRiskAlert = (message: RiskAlertMessage) => {
      const { action, alert, timestamp } = message.data

      switch (action) {
        case 'created':
        case 'updated':
          // Invalidate alerts list to fetch new data
          queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.alerts() })
          queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.dashboard() })

          // Show toast notification for new critical alerts
          if (action === 'created' && alert.severity === 'critical') {
            toast.error(`Critical Risk Alert: ${alert.title}`, {
              description: alert.description,
              duration: 10000,
              action: {
                label: 'View',
                onClick: () => {
                  window.location.href = '/risk-monitoring'
                }
              }
            })
          } else if (action === 'created') {
            toast.info(`New Risk Alert: ${alert.title}`, {
              description: alert.description,
              duration: 5000
            })
          }
          break

        case 'acknowledged':
          // Invalidate alerts list to update status
          queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.alerts() })
          queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.dashboard() })
          break
      }

      console.log(`Risk alert ${action}:`, { alert, timestamp })
    }

    // Handle risk score messages
    const handleRiskScore = (data: any) => {
      // Invalidate dashboard to update score
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: riskMonitoringKeys.metrics() })
      console.log('Risk score updated:', data)
    }

    // Subscribe to risk monitoring channels - use correct channel names per backend
    const alertSubscriptionId = subscribe('risk:alert', handleRiskAlert)
    const scoreSubscriptionId = subscribe('risk:score', handleRiskScore)

    return () => {
      // Cleanup subscriptions
      unsubscribe(alertSubscriptionId)
      unsubscribe(scoreSubscriptionId)
    }
  }, [queryClient, subscribe, unsubscribe, isConnected])
}

/**
 * Hook for getting critical alerts (high priority alerts that need attention)
 */
export function useCriticalAlerts() {
  const { data: alertsData, ...rest } = useRiskAlerts(1, 10, {
    severity: ['critical', 'error']
  })

  return {
    ...rest,
    criticalAlerts: (alertsData as any)?.alerts || []
  }
}

/**
 * Hook for getting high risk metrics
 */
export function useHighRiskMetrics() {
  const { data: metricsData, ...rest } = useRiskMetrics({
    level: ['high', 'critical']
  })

  return {
    ...rest,
    highRiskMetrics: (metricsData as any)?.metrics || []
  }
}

/**
 * Hook for calculating risk score trends
 */
export function useRiskScoreTrends(timeframe: '1h' | '24h' | '7d' | '30d' | '90d' = '7d') {
  const { data: trendsData, ...rest } = useRiskTrends(timeframe)

  const trendScore = React.useMemo(() => {
    if (!trendsData?.trends || trendsData.trends.length === 0) {
      return 'stable'
    }

    const trends = trendsData.trends
    const recent = trends.slice(-3) // Last 3 data points
    const older = trends.slice(-7, -3) // Previous 4 data points

    if (recent.length < 2 || older.length < 2) {
      return 'stable'
    }

    const recentAvg = recent.reduce((sum, item) => sum + item.overallRisk, 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item.overallRisk, 0) / older.length

    const diff = recentAvg - olderAvg

    if (diff > 5) return 'deteriorating'
    if (diff < -5) return 'improving'
    return 'stable'
  }, [trendsData])

  return {
    ...rest,
    trendScore,
    trendsData
  }
}

/**
 * Hook for risk alert statistics
 */
export function useRiskAlertStats() {
  const { data: alertsData } = useRiskAlerts(1, 1) // Get total count

  const stats = React.useMemo(() => {
    if (!alertsData) {
      return {
        total: 0,
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
        acknowledged: 0,
        resolved: 0
      }
    }

    const { alerts, total } = alertsData as any
    const stats = {
      total: total || 0,
      critical: alerts?.filter((alert: any) => alert.severity === 'critical').length || 0,
      error: alerts?.filter((alert: any) => alert.severity === 'error').length || 0,
      warning: alerts?.filter((alert: any) => alert.severity === 'warning').length || 0,
      info: alerts?.filter((alert: any) => alert.severity === 'info').length || 0,
      acknowledged: alerts?.filter((alert: any) => alert.acknowledgedAt).length || 0,
      resolved: alerts?.filter((alert: any) => alert.resolvedAt).length || 0
    }

    return stats
  }, [alertsData])

  return stats
}