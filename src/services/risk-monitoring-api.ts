/**
 * Risk Monitoring API Service
 * Handles API calls for risk monitoring dashboard data
 * Aligned with backend OpenAPI spec (/api/v1/risk/*)
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/environment'
import type {
  RiskDashboardData,
  RiskAlertsResponse,
  RiskMetricsResponse,
  RiskTrendsResponse,
  RiskAlertFilters,
  RiskMetricFilters,
  RiskCategory,
  RiskMetric
} from '@/types/risk-monitoring'

export const riskMonitoringApi = {
  /**
   * Get complete risk dashboard data
   */
  async getRiskDashboardData(): Promise<RiskDashboardData> {
    const response = await apiClient.get(API_ENDPOINTS.RISK.DASHBOARD)
    return response.data
  },

  /**
   * Get risk metrics
   * Metrics are included in /risk/dashboard response
   */
  async getRiskMetrics(filters?: RiskMetricFilters): Promise<RiskMetricsResponse> {
    // Get metrics from dashboard endpoint
    const response = await apiClient.get(API_ENDPOINTS.RISK.DASHBOARD)
    const dashboard = response.data

    let metrics = dashboard.metrics || []

    // Apply client-side filtering if needed
    if (filters?.category && filters.category.length > 0) {
      metrics = metrics.filter((metric: RiskMetric) =>
        filters.category!.includes(metric.category)
      )
    }

    if (filters?.level && filters.level.length > 0) {
      metrics = metrics.filter((metric: RiskMetric) =>
        filters.level!.includes(metric.level)
      )
    }

    return {
      metrics,
      lastUpdated: dashboard.lastUpdated || new Date().toISOString()
    }
  },

  /**
   * Get risk alerts
   */
  async getRiskAlerts(
    page: number = 1,
    pageSize: number = 20,
    filters?: RiskAlertFilters
  ): Promise<RiskAlertsResponse> {
    const params = { page, page_size: pageSize, ...filters }
    const response = await apiClient.get(API_ENDPOINTS.RISK.ALERTS, { params })
    return response.data
  },

  /**
   * Get risk trends data
   * Trends are included in /risk/dashboard response
   */
  async getRiskTrends(
    timeframe: '1h' | '24h' | '7d' | '30d' | '90d' = '7d'
  ): Promise<RiskTrendsResponse> {
    // Get trends from dashboard
    const response = await apiClient.get(API_ENDPOINTS.RISK.DASHBOARD)
    const dashboard = response.data
    return {
      trends: dashboard.trends || [],
      timeframe
    }
  },

  /**
   * Acknowledge a risk alert
   */
  async acknowledgeAlert(alertId: string, notes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.RISK.ALERT_ACKNOWLEDGE(alertId), { notes })
  },

  /**
   * Acknowledge multiple alerts (parallel requests to individual endpoint)
   * Backend lacks batch API, so we call acknowledge for each alert concurrently
   */
  async acknowledgeMultipleAlerts(alertIds: string[], notes?: string): Promise<void> {
    await Promise.all(
      alertIds.map(id =>
        apiClient.post(API_ENDPOINTS.RISK.ALERT_ACKNOWLEDGE(id), notes ? { notes } : {})
      )
    )
  },

  /**
   * Export risk report
   * Uses reports API for export functionality
   */
  async exportRiskReport(request: {
    timeframe: string
    categories: RiskCategory[]
    format: 'pdf' | 'excel' | 'csv'
    includeAlerts: boolean
    includeTrends: boolean
    includeRecommendations: boolean
  }): Promise<{ fileUrl: string; reportId: string }> {
    const response = await apiClient.post(API_ENDPOINTS.REPORTS.GENERATE, {
      report_type: 'risk',
      ...request
    })
    return response.data
  }
}
