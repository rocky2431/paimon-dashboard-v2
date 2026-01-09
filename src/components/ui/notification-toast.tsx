/**
 * Custom Notification Toast Components
 * Enhanced toast notifications for approval queue events
 */
import { toast } from 'sonner'
import { Button } from './button'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
  ExternalLinkIcon
} from 'lucide-react'
import type { ApprovalToastNotification } from '@/types/approval-notification'

interface NotificationToastProps {
  notification: ApprovalToastNotification
  onClose?: () => void
}

const NotificationIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon
}

const PriorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

function NotificationIcon({ type, priority }: { type: string, priority: string }) {
  const Icon = NotificationIcons[type as keyof typeof NotificationIcons] || InfoIcon
  const colorClass = priority === 'urgent' ? 'text-red-500' :
                     priority === 'high' ? 'text-orange-500' :
                     priority === 'medium' ? 'text-blue-500' : 'text-gray-500'

  return <Icon className={cn('h-5 w-5', colorClass)} />
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const { title, message, type, priority, actionUrl } = notification

  const handleViewClick = () => {
    if (actionUrl) {
      window.location.href = actionUrl
    }
    onClose?.()
  }

  const handleDismiss = () => {
    onClose?.()
  }

  return (
    <div className={cn(
      'group relative flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
      'bg-white dark:bg-gray-900',
      type === 'success' && 'border-green-200 bg-green-50/50 dark:bg-green-950/50',
      type === 'error' && 'border-red-200 bg-red-50/50 dark:bg-red-950/50',
      type === 'warning' && 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/50',
      type === 'info' && 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/50'
    )}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <NotificationIcon type={type} priority={priority} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <Badge
            variant="outline"
            className={cn('text-xs', PriorityColors[priority as keyof typeof PriorityColors])}
          >
            {priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {actionUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              className="h-7 text-xs"
            >
              <ExternalLinkIcon className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 p-1"
      >
        <XIcon className="h-3 w-3" />
      </button>

      {/* Priority indicator */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
        priority === 'urgent' && 'bg-red-500',
        priority === 'high' && 'bg-orange-500',
        priority === 'medium' && 'bg-blue-500',
        priority === 'low' && 'bg-gray-400'
      )} />
    </div>
  )
}

/**
 * Custom toast function for approval notifications
 */
export function showApprovalNotification(notification: ApprovalToastNotification) {
  return toast.custom((id) => (
    <NotificationToast
      notification={notification}
      onClose={() => toast.dismiss(id)}
    />
  ), {
    duration: notification.duration || 5000,
    position: 'top-right',
    className: 'border-0 shadow-none bg-transparent p-0'
  })
}

/**
 * Convenience functions for different notification types
 */
export const ApprovalNotifications = {
  /**
   * Show new approval request notification
   */
  newRequest: (item: { id: string; title: string; priority: string }) => {
    return showApprovalNotification({
      id: `new-${item.id}`,
      title: 'New Approval Request',
      message: `${item.title} requires your review`,
      type: 'info',
      priority: item.priority as any,
      timestamp: new Date().toISOString(),
      itemId: item.id,
      actionUrl: '/approval-queue',
      autoHide: true,
      duration: 6000
    })
  },

  /**
   * Show approval completed notification
   */
  approved: (item: { id: string; title: string }) => {
    return showApprovalNotification({
      id: `approved-${item.id}`,
      title: 'Approval Completed',
      message: `${item.title} has been approved`,
      type: 'success',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      itemId: item.id,
      actionUrl: '/approval-queue',
      autoHide: true,
      duration: 4000
    })
  },

  /**
   * Show approval rejected notification
   */
  rejected: (item: { id: string; title: string; reason?: string }) => {
    return showApprovalNotification({
      id: `rejected-${item.id}`,
      title: 'Approval Rejected',
      message: `${item.title} has been rejected${item.reason ? ': ' + item.reason : ''}`,
      type: 'error',
      priority: 'high',
      timestamp: new Date().toISOString(),
      itemId: item.id,
      actionUrl: '/approval-queue',
      autoHide: false,
      duration: 8000
    })
  },

  /**
   * Show approval assigned notification
   */
  assigned: (item: { id: string; title: string }) => {
    return showApprovalNotification({
      id: `assigned-${item.id}`,
      title: 'Approval Assigned',
      message: `${item.title} has been assigned to you`,
      type: 'info',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      itemId: item.id,
      actionUrl: '/approval-queue',
      autoHide: true,
      duration: 5000
    })
  }
}