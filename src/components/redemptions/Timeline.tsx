import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  AlertCircleIcon
} from 'lucide-react'
import type { Redemption } from '@/types/redemption'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  status: 'completed' | 'current' | 'pending' | 'error'
  icon?: React.ReactNode
  metadata?: Record<string, any>
}

interface TimelineProps {
  redemption: Redemption
  className?: string
}

export function Timeline({ redemption, className }: TimelineProps) {
  const events = generateTimelineEvents(redemption)

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">Processing Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <TimelineEventItem key={event.id} event={event} isLast={index === events.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface TimelineEventItemProps {
  event: TimelineEvent
  isLast: boolean
}

function TimelineEventItem({ event, isLast }: TimelineEventItemProps) {
  const getIcon = () => {
    if (event.icon) return event.icon

    switch (event.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'current':
        return <LoaderIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-green-500'
      case 'current':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      case 'pending':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getBorderColor = () => {
    switch (event.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'current':
        return 'border-blue-200 bg-blue-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'pending':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="relative flex items-start space-x-4">
      {/* Icon circle */}
      <div className={cn(
        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background',
        getStatusColor()
      )}>
        {getIcon()}
      </div>

      {/* Event content */}
      <div className={cn(
        'flex-1 pb-6',
        isLast && 'pb-0'
      )}>
        <Card className={cn(
          'border p-4 transition-all duration-200 hover:shadow-md',
          getBorderColor()
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{event.title}</h4>
                {event.status === 'current' && (
                  <Badge variant="secondary" className="text-xs">
                    In Progress
                  </Badge>
                )}
              </div>

              {event.description && (
                <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
              )}

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="font-medium capitalize text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-muted-foreground">
                        {formatMetadataValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="ml-4 text-right">
              <div className="text-sm text-muted-foreground">
                {format(new Date(event.timestamp), 'MMM dd, yyyy')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(event.timestamp), 'HH:mm:ss')}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function generateTimelineEvents(redemption: Redemption): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Initial request
  events.push({
    id: 'request',
    title: 'Redemption Requested',
    description: `User requested redemption of ${redemption.currency} ${redemption.amount.toLocaleString()}`,
    timestamp: redemption.requestDate,
    status: 'completed',
    metadata: {
      amount: `${redemption.currency} ${redemption.amount.toLocaleString()}`,
      channel: redemption.channel.replace('_', ' ').toUpperCase(),
      walletAddress: redemption.walletAddress
    }
  })

  // Processing started (if not pending anymore)
  if (redemption.processedDate) {
    events.push({
      id: 'processing',
      title: 'Processing Started',
      description: 'Admin review and validation initiated',
      timestamp: redemption.processedDate,
      status: redemption.status === 'processing' ? 'current' : 'completed',
      metadata: {
        processedBy: 'Admin',
        notes: redemption.notes
      }
    })

    // Status-specific events
    switch (redemption.status) {
      case 'approved':
        events.push({
          id: 'approved',
          title: 'Approved',
          description: 'Redemption request approved and ready for processing',
          timestamp: redemption.processedDate,
          status: 'completed',
          metadata: {
            notes: redemption.notes
          }
        })
        break

      case 'rejected':
        events.push({
          id: 'rejected',
          title: 'Rejected',
          description: redemption.reason || 'Redemption request rejected',
          timestamp: redemption.processedDate,
          status: 'error',
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
          metadata: {
            reason: redemption.reason,
            notes: redemption.notes
          }
        })
        break

      case 'processing':
        // Current processing state
        events.push({
          id: 'current_processing',
          title: 'Processing Payment',
          description: 'Processing payment to user account',
          timestamp: redemption.processedDate,
          status: 'current',
          icon: <LoaderIcon className="h-5 w-5 text-blue-500" />,
          metadata: {
            transactionHash: redemption.transactionHash
          }
        })
        break

      case 'completed':
        // Approved and completed
        events.push({
          id: 'approved',
          title: 'Approved',
          description: 'Redemption request approved',
          timestamp: redemption.processedDate,
          status: 'completed'
        })

        if (redemption.completedDate) {
          events.push({
            id: 'completed',
            title: 'Completed',
            description: 'Payment successfully processed and completed',
            timestamp: redemption.completedDate,
            status: 'completed',
            icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
            metadata: {
              netAmount: redemption.netAmount ?
                `${redemption.currency} ${redemption.netAmount.toLocaleString()}` :
                `${redemption.currency} ${redemption.amount.toLocaleString()}`,
              fee: redemption.fee ?
                `${redemption.currency} ${redemption.fee.toLocaleString()}` :
                'N/A',
              transactionHash: redemption.transactionHash
            }
          })
        }
        break

      case 'failed':
        events.push({
          id: 'failed',
          title: 'Processing Failed',
          description: redemption.notes || 'Payment processing failed',
          timestamp: redemption.processedDate,
          status: 'error',
          icon: <AlertCircleIcon className="h-5 w-5 text-red-500" />,
          metadata: {
            error: redemption.notes
          }
        })
        break

      case 'cancelled':
        events.push({
          id: 'cancelled',
          title: 'Cancelled',
          description: redemption.notes || 'Redemption request cancelled',
          timestamp: redemption.processedDate,
          status: 'error',
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
          metadata: {
            reason: redemption.notes
          }
        })
        break
    }
  } else {
    // Still pending
    events.push({
      id: 'pending_review',
      title: 'Pending Review',
      description: 'Waiting for admin review and approval',
      timestamp: new Date().toISOString(),
      status: 'current',
      icon: <ClockIcon className="h-5 w-5 text-yellow-500" />
    })
  }

  return events
}

function formatMetadataValue(key: string, value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string') {
    // Truncate long strings like transaction hashes
    if (key.includes('hash') || key.includes('address')) {
      return `${value.slice(0, 8)}...${value.slice(-8)}`
    }
    return value
  }
  return String(value)
}