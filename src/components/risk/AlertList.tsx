/**
 * AlertList Component
 * Displays risk alerts with severity indicators and management actions
 */

import { CheckCircle, XCircle, AlertTriangle, Info, Clock, User, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { RiskAlert, AlertSeverity, RiskCategory } from '@/types/risk-monitoring'

interface AlertListProps {
  alerts: RiskAlert[]
  loading?: boolean
  selectedAlerts?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onAcknowledge?: (alertIds: string[], notes?: string) => void
  onDismiss?: (alertIds: string[], notes?: string) => void
  onResolve?: (alertIds: string[], resolution: string, notes?: string) => void
  onAlertClick?: (alert: RiskAlert) => void
  className?: string
  showActions?: boolean
  showSelection?: boolean
}

const severityConfig = {
  critical: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeColor: 'destructive'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeColor: 'secondary'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeColor: 'secondary'
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'secondary'
  }
}

const categoryLabels: Record<RiskCategory, string> = {
  liquidity: 'Liquidity',
  market: 'Market',
  operational: 'Operational',
  compliance: 'Compliance',
  concentration: 'Concentration'
}

const statusLabels = {
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
  dismissed: 'Dismissed'
}

export function AlertList({
  alerts,
  loading = false,
  selectedAlerts = [],
  onSelectionChange,
  onAcknowledge,
  onDismiss,
  onResolve,
  onAlertClick,
  className,
  showActions = true,
  showSelection = true
}: AlertListProps) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? alerts.map(alert => alert.id) : [])
    }
  }

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedAlerts, alertId]
        : selectedAlerts.filter(id => id !== alertId)
      onSelectionChange(newSelection)
    }
  }

  const getAlertStatus = (alert: RiskAlert) => {
    if (alert.resolvedAt) return 'resolved'
    if (alert.acknowledgedAt) return 'acknowledged'
    if (alert.triggeredAt && !alert.acknowledgedAt && !alert.resolvedAt) return 'new'
    return 'new'
  }

  const getSeverityConfig = (severity: AlertSeverity) => {
    return severityConfig[severity] || severityConfig.info
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Risk Alerts
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            All systems are operating within normal risk parameters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with selection controls */}
      {showSelection && (
        <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-md">
          <Checkbox
            checked={selectedAlerts.length === alerts.length && alerts.length > 0}
            onCheckedChange={handleSelectAll}
            aria-label="Select all alerts"
          />
          <span className="text-sm text-muted-foreground">
            {selectedAlerts.length > 0
              ? `${selectedAlerts.length} of ${alerts.length} selected`
              : `${alerts.length} alerts`
            }
          </span>
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const status = getAlertStatus(alert)
          const severityConfig = getSeverityConfig(alert.severity)
          const SeverityIcon = severityConfig.icon
          const isSelected = selectedAlerts.includes(alert.id)
          const isResolved = status === 'resolved'
          const isAcknowledged = status === 'acknowledged'

          return (
            <Card
              key={alert.id}
              className={cn(
                'transition-all hover:shadow-md cursor-pointer',
                severityConfig.bgColor,
                severityConfig.borderColor,
                isSelected && 'ring-2 ring-ring ring-offset-2',
                isResolved && 'opacity-75'
              )}
              onClick={() => onAlertClick?.(alert)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Selection checkbox */}
                  {showSelection && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectAlert(alert.id, !!checked)}
                      aria-label={`Select alert ${alert.title}`}
                      className="mt-1"
                    />
                  )}

                  {/* Severity icon */}
                  <div className={cn('flex-shrink-0', severityConfig.color)}>
                    <SeverityIcon className="h-5 w-5" />
                  </div>

                  {/* Alert content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {alert.description}
                        </p>
                      </div>

                      {/* Actions */}
                      {showActions && !isResolved && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!isAcknowledged && onAcknowledge && (
                              <DropdownMenuItem
                                onClick={() => onAcknowledge([alert.id])}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Acknowledge
                              </DropdownMenuItem>
                            )}
                            {onDismiss && (
                              <DropdownMenuItem
                                onClick={() => onDismiss([alert.id])}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Dismiss
                              </DropdownMenuItem>
                            )}
                            {onResolve && (
                              <DropdownMenuItem
                                onClick={() => onResolve([alert.id], 'Resolved manually')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolve
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Alert metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Category badge */}
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[alert.category]}
                      </Badge>

                      {/* Severity badge */}
                      <Badge variant={severityConfig.badgeColor as any} className="text-xs">
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>

                      {/* Status badge */}
                      {status !== 'new' && (
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[status as keyof typeof statusLabels]}
                        </Badge>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                      </div>

                      {/* Acknowledged by */}
                      {alert.acknowledgedBy && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {alert.acknowledgedBy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Batch actions */}
      {selectedAlerts.length > 0 && showActions && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedAlerts.length} alert{selectedAlerts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                {onAcknowledge && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(selectedAlerts)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDismiss(selectedAlerts)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                )}
                {onResolve && (
                  <Button
                    size="sm"
                    onClick={() => onResolve(selectedAlerts, 'Resolved in batch')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export type { AlertListProps }