/**
 * AlertManagementPage Component
 * Complete alert management interface with filtering, list, and detail view
 */

import * as React from 'react'
import { useState } from 'react'
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertList } from './AlertList'
import { AlertFilterBar, type AlertFilters } from './AlertFilterBar'
import { AlertDetailDrawer } from './AlertDetailDrawer'
import { useRiskAlerts, useAcknowledgeAlert } from '@/hooks/useRiskMonitoring'
import { useRiskMonitoringWebSocket } from '@/hooks/useRiskMonitoring'
import { cn } from '@/lib/utils'
import type { RiskAlert } from '@/types/risk-monitoring'

export function AlertManagementPage({
  className,
  title = "Risk Alert Management",
  description = "Monitor and manage risk alerts in real-time"
}: {
  className?: string
  title?: string
  description?: string
}) {
  // State management
  const [filters, setFilters] = useState<AlertFilters>({})
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)

  // Data fetching
  const { data: alertsData, isLoading } = useRiskAlerts(1, 50, {
    severity: filters.severity,
    category: filters.category,
    search: filters.search
  })

  // Mutations - only acknowledge is available per backend API
  const acknowledgeMutation = useAcknowledgeAlert()

  // WebSocket integration
  useRiskMonitoringWebSocket()

  // Handlers
  const handleFiltersChange = (newFilters: AlertFilters) => {
    setFilters(newFilters)
    setSelectedAlerts([]) // Clear selection when filters change
  }

  const handleAlertClick = (alert: RiskAlert) => {
    setSelectedAlert(alert)
    setShowDetailDrawer(true)
  }

  const handleAcknowledge = (alertIds: string[], notes?: string) => {
    // For now, handle single alert. Batch operations can be added later
    const alertId = alertIds[0]
    if (alertId) {
      acknowledgeMutation.mutate({ alertId, notes })
    }
    setSelectedAlerts([])
  }

  // Note: resolve and dismiss not available in backend API
  const handleResolve = (alertIds: string[], _resolution: string, notes?: string) => {
    // Backend only supports acknowledge - use that instead
    const alertId = alertIds[0]
    if (alertId) {
      acknowledgeMutation.mutate({ alertId, notes })
    }
    setSelectedAlerts([])
  }

  const handleDismiss = (alertIds: string[], notes?: string) => {
    // Backend only supports acknowledge - use that instead
    const alertId = alertIds[0]
    if (alertId) {
      acknowledgeMutation.mutate({ alertId, notes })
    }
    setSelectedAlerts([])
  }

  const handleDetailAcknowledge = (alertId: string, notes?: string) => {
    handleAcknowledge([alertId], notes)
    setShowDetailDrawer(false)
  }

  const handleDetailResolve = (alertId: string, resolution: string, notes?: string) => {
    handleResolve([alertId], resolution, notes)
    setShowDetailDrawer(false)
  }

  const handleDetailDismiss = (alertId: string, notes?: string) => {
    handleDismiss([alertId], notes)
    setShowDetailDrawer(false)
  }

  const isProcessing = acknowledgeMutation.isPending

  const alerts = alertsData?.alerts || []

  // Calculate alert statistics
  const stats = React.useMemo(() => {
    if (!alerts.length) return { total: 0, critical: 0, error: 0, warning: 0, info: 0 }

    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      error: alerts.filter(a => a.severity === 'error').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    }
  }, [alerts])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Stats Summary */}
        <div className="flex flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground ml-1">{stats.total}</span>
          </div>
          <div className="text-sm text-red-600">
            Critical: <span className="font-medium ml-1">{stats.critical}</span>
          </div>
          <div className="text-sm text-orange-600">
            Error: <span className="font-medium ml-1">{stats.error}</span>
          </div>
          <div className="text-sm text-yellow-600">
            Warning: <span className="font-medium ml-1">{stats.warning}</span>
          </div>
          <div className="text-sm text-blue-600">
            Info: <span className="font-medium ml-1">{stats.info}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Alert List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filter Bar */}
          <AlertFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={isLoading}
          />

          {/* Alert List */}
          <AlertList
            alerts={alerts}
            loading={isLoading}
            selectedAlerts={selectedAlerts}
            onSelectionChange={setSelectedAlerts}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
            showActions={true}
            showSelection={true}
            onAlertClick={handleAlertClick}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alert Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{severity}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden"
                          style={{
                            width: `${(count / stats.total) * 100}%`
                          }}
                        >
                          <div
                            className={cn(
                              'h-full rounded-full',
                              severity === 'critical' && 'bg-red-500',
                              severity === 'error' && 'bg-orange-500',
                              severity === 'warning' && 'bg-yellow-500',
                              severity === 'info' && 'bg-blue-500',
                              severity === 'total' && 'bg-gray-500'
                            )}
                          />
                        </div>
                        <span className="text-sm font-medium ml-2">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      {stats.critical} critical alerts need immediate attention
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {stats.error} error alerts are pending resolution
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {isProcessing ? 'Processing...' : 'All actions completed'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        onAcknowledge={handleDetailAcknowledge}
        onResolve={handleDetailResolve}
        onDismiss={handleDetailDismiss}
      />
    </div>
  )
}