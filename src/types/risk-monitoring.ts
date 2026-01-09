/**
 * Risk Monitoring Type Definitions
 * Type definitions for risk monitoring dashboard and related components
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type RiskCategory = 'liquidity' | 'market' | 'operational' | 'compliance' | 'concentration'
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface RiskMetric {
  id: string
  name: string
  category: RiskCategory
  value: number
  threshold: number
  unit: string
  level: RiskLevel
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  description: string
}

export interface RiskAlert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  category: RiskCategory
  triggeredAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  acknowledgedBy?: string
  resolvedBy?: string
  relatedMetrics: string[]
  metadata: Record<string, any>
}

export interface RiskHeatMapData {
  category: RiskCategory
  level: RiskLevel
  count: number
  percentage: number
  color: string
  description: string
}

export interface RiskTrendData {
  timestamp: string
  overallRisk: number
  categoryRisks: Record<RiskCategory, number>
  alertCount: number
  events: string[]
}

export interface RiskDashboardData {
  metrics: RiskMetric[]
  alerts: RiskAlert[]
  heatMap: RiskHeatMapData[]
  trends: RiskTrendData[]
  summary: RiskSummary
  lastUpdated: string
}

export interface RiskSummary {
  overallRiskLevel: RiskLevel
  overallRiskScore: number // 0-100
  totalAlerts: number
  criticalAlerts: number
  highRiskMetrics: number
  trendDirection: 'improving' | 'stable' | 'deteriorating'
  lastAssessment: string
}

// Chart data structures
export interface GaugeChartData {
  value: number
  min: number
  max: number
  thresholds: {
    low: number
    medium: number
    high: number
    critical: number
  }
  segments: {
    label: string
    value: number
    color: string
  }[]
}

export interface HeatMapDataPoint {
  x: string // category or label
  y: string // sub-category or time period
  value: number
  category: RiskCategory
  metadata?: Record<string, any>
}

export interface TrendChartDataPoint {
  timestamp: string
  value: number
  category?: RiskCategory
  alert?: string
}

// WebSocket message types for risk monitoring
export interface RiskWebSocketMessage {
  type: 'risk:alert' | 'risk:metric' | 'risk:trend'
  channel: 'risk:alerts' | 'risk:metrics' | 'risk:trends'
  timestamp: string
  data: RiskAlert | RiskMetric | RiskTrendData
}

// API response types
export interface RiskMonitoringResponse {
  data: RiskDashboardData
  success: boolean
  message?: string
}

export interface RiskAlertsResponse {
  alerts: RiskAlert[]
  total: number
  page: number
  pageSize: number
  filters?: RiskAlertFilters
}

export interface RiskMetricsResponse {
  metrics: RiskMetric[]
  lastUpdated: string
}

export interface RiskTrendsResponse {
  trends: RiskTrendData[]
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d'
}

// Filter and query types
export interface RiskAlertFilters {
  severity?: AlertSeverity[]
  category?: RiskCategory[]
  status?: ('active' | 'acknowledged' | 'resolved')[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface RiskMetricFilters {
  category?: RiskCategory[]
  level?: RiskLevel[]
  search?: string
}

// Risk calculation types
export interface RiskCalculation {
  metricId: string
  formula: string
  weights: Record<string, number>
  factors: RiskFactor[]
}

export interface RiskFactor {
  name: string
  type: 'input' | 'calculated' | 'external'
  value: number
  weight: number
  description: string
}

// Risk thresholds and configuration
export interface RiskThreshold {
  metricId: string
  category: RiskCategory
  levels: {
    low: { min: number; max: number }
    medium: { min: number; max: number }
    high: { min: number; max: number }
    critical: { min: number; max: number }
  }
}

export interface RiskConfig {
  refreshInterval: number // in milliseconds
  alertRetentionDays: number
  enableRealTimeUpdates: boolean
  defaultTimeframe: string
  thresholds: RiskThreshold[]
}

// Risk action types
export interface RiskAction {
  id: string
  alertId: string
  type: 'acknowledge' | 'resolve' | 'assign' | 'escalate'
  performedBy: string
  performedAt: string
  notes?: string
  metadata?: Record<string, any>
}

// Export/Report types
export interface RiskReportRequest {
  timeframe: string
  categories: RiskCategory[]
  format: 'pdf' | 'excel' | 'csv'
  includeAlerts: boolean
  includeTrends: boolean
  includeRecommendations: boolean
}

export interface RiskReport {
  id: string
  generatedAt: string
  timeframe: string
  summary: RiskSummary
  sections: RiskReportSection[]
  fileUrl?: string
}

export interface RiskReportSection {
  title: string
  type: 'summary' | 'alerts' | 'metrics' | 'trends' | 'recommendations'
  data: any
  charts?: any[]
}