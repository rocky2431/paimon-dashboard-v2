import React from 'react'
import { approvalNotificationService } from '@/services/approval-notification-service'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocketContext } from '@/providers/WebSocketProvider'
import type { ApprovalNotificationMessage } from '@/types/approval-notification'
import { approvalQueueKeys } from './useApprovalQueue'

/**
 * Hook for approval notification WebSocket management
 */
export function useApprovalNotifications() {
  const queryClient = useQueryClient()
  const { client, isConnected, connectionState, error } = useWebSocketContext()
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Handle new approval notifications
  const handleApprovalNew = React.useCallback((message: ApprovalNotificationMessage) => {
    console.log('New approval notification:', message)
    queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
  }, [queryClient])

  // Handle approval updated notifications
  const handleApprovalUpdated = React.useCallback((message: ApprovalNotificationMessage) => {
    console.log('Approval updated notification:', message)
    queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
  }, [queryClient])

  // Handle approval assigned notifications
  const handleApprovalAssigned = React.useCallback((message: ApprovalNotificationMessage) => {
    console.log('Approval assigned notification:', message)
    queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
  }, [queryClient])

  // Initialize WebSocket client with notification service
  React.useEffect(() => {
    if (client && !isInitialized) {
      const cleanup = approvalNotificationService.initializeWebSocketClient(client)
      setIsInitialized(true)

      return () => {
        if (cleanup) {
          cleanup()
        }
      }
    }
  }, [client, isInitialized])

  // Subscribe to approval notifications
  React.useEffect(() => {
    const unsubscribeNew = approvalNotificationService.subscribe(
      'approval:new',
      handleApprovalNew
    )

    const unsubscribeUpdated = approvalNotificationService.subscribe(
      'approval:updated',
      handleApprovalUpdated
    )

    const unsubscribeAssigned = approvalNotificationService.subscribe(
      'approval:assigned',
      handleApprovalAssigned
    )

    return () => {
      unsubscribeNew()
      unsubscribeUpdated()
      unsubscribeAssigned()
    }
  }, [handleApprovalNew, handleApprovalUpdated, handleApprovalAssigned])

  return {
    isConnected,
    connectionState,
    error,
    activeSubscriptions: approvalNotificationService.getActiveSubscriptions()
  }
}

/**
 * Hook for connection status monitoring
 */
export function useApprovalConnectionStatus() {
  const { isConnected, connectionState, error } = useWebSocketContext()
  const { activeSubscriptions } = useApprovalNotifications()

  return {
    connected: isConnected,
    connecting: connectionState === 'connecting',
    connectionState,
    error: error || undefined,
    reconnectAttempts: 0, // Could be tracked if needed
    subscriptions: [], // Could be tracked if needed
    activeSubscriptions,
    lastConnected: isConnected ? new Date().toISOString() : undefined
  }
}

/**
 * Hook for manual notification subscription
 */
export function useApprovalNotificationSubscription(
  channels: string[],
  onMessage?: (message: ApprovalNotificationMessage) => void
) {
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  React.useEffect(() => {
    if (!channels.length || !onMessage) return

    const unsubscribers: (() => void)[] = []

    channels.forEach(channel => {
      const unsubscribe = approvalNotificationService.subscribe(channel, onMessage)
      unsubscribers.push(unsubscribe)
    })

    setIsSubscribed(true)

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
      setIsSubscribed(false)
    }
  }, [channels, onMessage])

  return {
    isSubscribed,
    unsubscribe: () => {
      // Manual cleanup handled by useEffect cleanup
    }
  }
}