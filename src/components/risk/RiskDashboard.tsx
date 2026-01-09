/**
 * RiskDashboard Component
 * Main risk monitoring dashboard integrating all risk visualization components
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  RefreshCw,
  Download,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bell,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { GaugeChart, RiskHeatMap, TrendChart, RiskMetrics, ForecastChart } from '@/components/charts'
import { useRiskDashboard, useRiskAlerts, useExportReport } from '@/hooks/useRiskMonitoring'
import { useLiquidityForecast, useForecastAlerts } from '@/services/liquidity-forecast-api'
import type { RiskMetric, RiskAlert } from '@/types/risk-monitoring'
import type { ForecastTimeframe, ConfidenceLevel } from '@/types/liquidity-forecast'

export interface RiskDashboardProps {
  className?: string
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d'
  refreshInterval?: number
  autoRefresh?: boolean
}

export function RiskDashboard({
  className,
  timeRange = '7d',
  refreshInterval = 30000, // 30 seconds
  autoRefresh = true
}: RiskDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<'1h' | '24h' | '7d' | '30d' | '90d'>(timeRange)
  const [forecastTimeframe, setForecastTimeframe] = React.useState<ForecastTimeframe>('30d')
  const [confidenceLevel, setConfidenceLevel] = React.useState<ConfidenceLevel>(90)

  // Data fetching
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useRiskDashboard()

  const {
    isLoading: alertsLoading,
    refetch: refetchAlerts
  } = useRiskAlerts(1, 10, { severity: ['critical', 'error'] })

  // Liquidity forecast data
  const {
    data: forecastData,
    isLoading: forecastLoading,
    refetch: refetchForecast
  } = useLiquidityForecast(forecastTimeframe, confidenceLevel)

  const { data: forecastAlerts } = useForecastAlerts()

  const exportReportMutation = useExportReport()

  // Auto-refresh effect
  React.useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetchDashboard()
      refetchAlerts()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetchDashboard, refetchAlerts])

  // Handlers
  const handleRefresh = () => {
    refetchDashboard()
    refetchAlerts()
    toast.success('Risk data refreshed')
  }

  const handleExportReport = async () => {
    try {
      await exportReportMutation.mutateAsync({
        timeframe: selectedTimeRange,
        categories: ['liquidity', 'market', 'operational', 'compliance', 'concentration'] as any,
        format: 'pdf',
        includeAlerts: true,
        includeTrends: true,
        includeRecommendations: true
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleMetricClick = (metric: RiskMetric) => {
    toast.info(`Selected metric: ${metric.name}`)
  }

  const handleHeatMapClick = (data: any) => {
    toast.info(`Selected: ${data.category} - ${data.level}`)
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    // This would use the acknowledgeAlert mutation
    toast.success(`Alert ${alertId} acknowledged`)
  }

  // Loading state
  if (dashboardLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading risk dashboard...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (dashboardError || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load risk data</h3>
          <p className="text-muted-foreground mb-4">Please try refreshing the dashboard</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    )
  }

  const { metrics, heatMap, trends, summary } = dashboardData

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risk Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time risk assessment and monitoring for Paimon Fund
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exportReportMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Risk Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{summary.overallRiskScore.toFixed(1)}</span>
                  <Badge variant={summary.overallRiskLevel === 'critical' ? 'destructive' : 'secondary'}>
                    {summary.overallRiskLevel}
                  </Badge>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{summary.totalAlerts}</span>
                  <Badge variant="destructive">
                    {summary.criticalAlerts} Critical
                  </Badge>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Metrics</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{summary.highRiskMetrics}</span>
                  <Badge variant="secondary">
                    {summary.trendDirection}
                  </Badge>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <span className="text-sm font-mono">
                  {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              <RefreshCw className={cn('h-8 w-8 text-muted-foreground', autoRefresh && 'animate-spin')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Risk Gauge */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart
                  value={summary.overallRiskScore}
                  size="lg"
                  title="Risk Score"
                  description={`${summary.overallRiskLevel.charAt(0).toUpperCase() + summary.overallRiskLevel.slice(1)} risk level`}
                  thresholds={{
                    low: 30,
                    medium: 60,
                    high: 80,
                    critical: 100
                  }}
                />
              </CardContent>
            </Card>

            {/* Risk Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskHeatMap
                  data={heatMap}
                  size="md"
                  title="Risk Heat Map"
                  onCellClick={handleHeatMapClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Key Risk Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskMetrics
                metrics={metrics.slice(0, 4)} // Show top 4 metrics
                layout="grid"
                size="md"
                clickable
                onMetricClick={handleMetricClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>All Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskMetrics
                metrics={metrics}
                layout="grid"
                size="md"
                clickable
                onMetricClick={handleMetricClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={trends}
                type="combined"
                timeRange={selectedTimeRange as any}
                height={400}
                showEvents
                showBrush
                threshold={75}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          {forecastLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading forecast data...</span>
                </div>
              </CardContent>
            </Card>
          ) : forecastData ? (
            <>
              <ForecastChart
                data={forecastData}
                onTimeframeChange={setForecastTimeframe}
                onConfidenceLevelChange={setConfidenceLevel}
                onRefresh={() => refetchForecast()}
                isLoading={forecastLoading}
                showScenarios
                showMetrics
                height={400}
              />

              {/* Forecast Alerts */}
              {forecastAlerts && forecastAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecastAlerts.map(alert => (
                        <div
                          key={alert.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border',
                            alert.severity === 'critical' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
                            alert.severity === 'warning' && 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
                            alert.severity === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                          )}
                        >
                          <AlertTriangle className={cn(
                            'h-5 w-5 mt-0.5',
                            alert.severity === 'critical' && 'text-red-600',
                            alert.severity === 'warning' && 'text-amber-600',
                            alert.severity === 'info' && 'text-blue-600'
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'warning' ? 'default' : 'secondary'
                              }>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.type.replace('_', ' ')}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {alert.probability}% probability
                              </span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Forecasted for: {new Date(alert.forecastedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No forecast data available</h3>
                  <p className="text-muted-foreground">Please try again later</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Risk Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.alerts?.slice(0, 5).map((alert: RiskAlert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Triggered: {new Date(alert.triggeredAt).toLocaleString()}</span>
                        {!alert.acknowledgedAt && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}