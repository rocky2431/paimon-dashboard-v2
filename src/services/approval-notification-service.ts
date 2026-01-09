/**
 * Approval Notification Service
 * Handles WebSocket subscriptions and message processing for real-time approval updates
 * This service works with React WebSocket context for proper integration
 */

import { toast } from 'sonner'
import { ApprovalNotifications } from '@/components/ui/notification-toast'
import type {
  ApprovalNotificationMessage
} from '@/types/approval-notification'
import type { WebSocketMessage } from '@/lib/websocket-types'
import type { WebSocketClient } from '@/lib/websocket-client'

class ApprovalNotificationService {
  private messageHandlers: Map<string, ((message: ApprovalNotificationMessage) => void)[]> = new Map()

  /**
   * Initialize WebSocket event handlers with the provided client
   */
  public initializeWebSocketClient(wsClient: WebSocketClient) {
    if (!wsClient) return

    // Handle incoming messages
    const messageHandler = (_data: unknown, message: WebSocketMessage) => {
      try {
        if (this.isApprovalMessage(message)) {
          this.handleApprovalMessage(message as unknown as ApprovalNotificationMessage)
        }
      } catch (error) {
        console.error('Error processing approval notification:', error)
      }
    }

    // Subscribe to all WebSocket messages; filtering done in messageHandler via isApprovalMessage()
    const subscriptionId = wsClient.subscribe('*', messageHandler)

    return () => {
      wsClient.unsubscribe(subscriptionId)
    }
  }

  /**
   * Check if message is an approval-related message
   */
  private isApprovalMessage(message: WebSocketMessage): boolean {
    return Boolean(message.channel && message.channel.startsWith('approval:') && (message.data as Record<string, unknown>)?.item)
  }

  /**
   * Handle incoming approval notification
   */
  private handleApprovalMessage(message: ApprovalNotificationMessage) {
    // Call registered message handlers
    const handlers = this.messageHandlers.get(message.type) || []
    handlers.forEach(handler => {
      try {
        handler(message)
      } catch (error: any) {
        console.error('Error in message handler:', error)
      }
    })

    // Show toast notification for relevant events
    if (this.shouldShowToast(message)) {
      this.showToastNotification(message)
    }
  }

  /**
   * Determine if a message should show a toast notification
   */
  private shouldShowToast(message: ApprovalNotificationMessage): boolean {
    const { type, data } = message

    switch (type) {
      case 'approval:new':
        return true // Always show new approval notifications
      case 'approval:updated':
        // Show for status changes to approved/rejected
        return data.changeType === 'approved' || data.changeType === 'rejected'
      case 'approval:assigned':
        // Only show if assigned to current user (in real app, would check current user ID)
        return true
      default:
        return false
    }
  }

  /**
   * Create and display toast notification
   */
  private showToastNotification(message: ApprovalNotificationMessage) {
    const { type, data } = message
    const { item, changeType } = data

    switch (type) {
      case 'approval:new':
        ApprovalNotifications.newRequest(item)
        break
      case 'approval:updated':
        if (changeType === 'approved') {
          ApprovalNotifications.approved(item)
        } else if (changeType === 'rejected') {
          ApprovalNotifications.rejected({
            ...item,
            reason: data.reason
          })
        }
        break
      case 'approval:assigned':
        ApprovalNotifications.assigned(item)
        break
      default:
        // Fallback to basic toast
        toast.info('Approval Update', {
          description: `${data.item.title} status has been updated`,
          duration: 4000
        })
    }
  }

  /**
   * Subscribe to approval notification messages
   */
  public subscribe(type: string, handler: (message: ApprovalNotificationMessage) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(type)
        }
      }
    }
  }

  /**
   * Get active subscriptions count
   */
  public getActiveSubscriptions(): number {
    let count = 0
    this.messageHandlers.forEach(handlers => {
      count += handlers.length
    })
    return count
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    this.messageHandlers.clear()
  }
}

// Singleton instance
export const approvalNotificationService = new ApprovalNotificationService()