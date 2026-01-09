/**
 * AlertDetailDrawer Component
 * Shows detailed information about a risk alert
 */

import { X, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { RiskAlert, RiskCategory } from '@/types/risk-monitoring'

interface AlertDetailDrawerProps {
  alert?: RiskAlert | null
  open: boolean
  onClose: () => void
  onAcknowledge?: (alertId: string, notes?: string) => void
  onResolve?: (alertId: string, resolution: string, notes?: string) => void
  onDismiss?: (alertId: string, notes?: string) => void
}

const severityStyleConfig = {
  critical: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  error: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  info: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
}

const categoryLabels: Record<RiskCategory, string> = {
  liquidity: 'Liquidity',
  market: 'Market',
  operational: 'Operational',
  compliance: 'Compliance',
  concentration: 'Concentration'
}

export function AlertDetailDrawer({
  alert,
  open,
  onClose,
  onAcknowledge,
  onResolve,
  onDismiss
}: AlertDetailDrawerProps) {
  if (!alert) return null

  const severityConfig = severityStyleConfig[alert.severity] || severityStyleConfig.info
  const isResolved = !!alert.resolvedAt
  const isAcknowledged = !!alert.acknowledgedAt

  const getAlertStatus = () => {
    if (isResolved) return { label: 'Resolved', color: 'text-green-600' }
    if (isAcknowledged) return { label: 'Acknowledged', color: 'text-blue-600' }
    return { label: 'Active', color: 'text-gray-600' }
  }

  const getStatusIcon = () => {
    if (isResolved) return CheckCircle
    if (isAcknowledged) return CheckCircle
    return AlertTriangle
  }

  const StatusIcon = getStatusIcon()
  const status = getAlertStatus()

  const handleQuickAction = (action: 'acknowledge' | 'resolve' | 'dismiss') => {
    switch (action) {
      case 'acknowledge':
        onAcknowledge?.(alert.id, 'Acknowledged from detail drawer')
        break
      case 'resolve':
        onResolve?.(alert.id, 'Resolved manually from detail drawer')
        break
      case 'dismiss':
        onDismiss?.(alert.id, 'Dismissed from detail drawer')
        break
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-2xl">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', severityConfig.bgColor)}>
                <AlertTriangle className={cn('h-5 w-5', severityConfig.color)} />
              </div>
              Risk Alert Details
            </DrawerTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Alert Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {alert.title}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[alert.category]}
                  </Badge>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground">
                {alert.description}
              </p>
            </div>

            {/* Status and Timing */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn('h-4 w-4', status.color)} />
                    <div>
                      <div className="text-sm font-medium">Status</div>
                      <div className={cn('text-sm', status.color)}>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Triggered At */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Triggered</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  {!isResolved && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Duration</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            {Object.keys(alert.metadata).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(alert.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground min-w-[100px] capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm text-foreground">
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Metrics */}
            {alert.relatedMetrics.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Related Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {alert.relatedMetrics.map((metricId) => (
                      <Badge key={metricId} variant="outline" className="text-xs">
                        {metricId}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Updates */}
            {(alert.acknowledgedAt || alert.resolvedAt) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alert.acknowledgedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Acknowledged</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.acknowledgedAt), { addSuffix: true })}
                        </div>
                        {alert.acknowledgedBy && (
                          <div className="text-xs text-muted-foreground">
                            by {alert.acknowledgedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {alert.resolvedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Resolved</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.resolvedAt), { addSuffix: true })}
                        </div>
                        {alert.resolvedBy && (
                          <div className="text-xs text-muted-foreground">
                            by {alert.resolvedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className={cn('border-dashed', severityConfig.borderColor)}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  {!isAcknowledged && !isResolved && onAcknowledge && (
                    <Button
                      onClick={() => handleQuickAction('acknowledge')}
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                  {!isResolved && onDismiss && (
                    <Button
                      onClick={() => handleQuickAction('dismiss')}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  )}
                  {onResolve && (
                    <Button
                      onClick={() => handleQuickAction('resolve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isResolved ? 'Reopen' : 'Resolve'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export type { AlertDetailDrawerProps }