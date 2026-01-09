import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEYS } from '../types/dashboard'
import { WebSocketClient } from '../lib/websocket-client'
import { API_CONFIG } from '../config/environment'
import { useAuthStore } from '../stores'
import type {
  FundNavUpdateMessage,
  ConnectionInfo
} from '../lib/websocket-types'

interface UseDashboardWebSocketOptions {
  autoConnect?: boolean
}

interface UseDashboardWebSocketReturn {
  isConnected: boolean
  connectionInfo: ConnectionInfo
  subscribeToDashboard: () => void
  refreshDashboard: (type?: 'all' | 'stats' | 'events' | 'nav' | 'liquidity') => void
  sendCustomMessage: (message: any) => void
}

/**
 * Hook for dashboard real-time updates via WebSocket
 */
// WebSocket client singleton
let wsClientInstance: WebSocketClient | null = null

export function useDashboardWebSocket(options: UseDashboardWebSocketOptions = {}): UseDashboardWebSocketReturn {
  const queryClient = useQueryClient()
  const { autoConnect = true } = options

  // Create or reuse WebSocket client singleton
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(
      API_CONFIG.WS_URL,
      {
        getToken: () => {
          // Get token from memory-only auth store (secure - no localStorage)
          return useAuthStore.getState().token
        },
        debug: import.meta.env.DEV
      }
    )
  }

  const wsClient = wsClientInstance!

  // Manual refresh function
  const refreshDashboard = useCallback((type: 'all' | 'stats' | 'events' | 'nav' | 'liquidity' = 'all') => {
    switch (type) {
      case 'all':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all })
        break
      case 'stats':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats() })
        break
      case 'events':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.recentEvents() })
        break
      case 'nav':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.navHistory() })
        break
      case 'liquidity':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.liquidity() })
        break
    }
  }, [queryClient])

  // Send custom message
  const sendCustomMessage = useCallback((message: any) => {
    if (wsClient.isConnected && wsClient.send) {
      wsClient.send(message)
    }
  }, [wsClient])

  // Subscribe to dashboard channels
  const subscribeToDashboard = useCallback(() => {
    // Subscribe to NAV updates
    const navSubscription = wsClient.subscribe(
      'fund:nav',
      (_data: any, message: any) => {
        // Type cast for message
        const navMessage = message as FundNavUpdateMessage

        // Update dashboard stats with new NAV
        queryClient.setQueryData(
          DASHBOARD_QUERY_KEYS.stats(),
          (oldData: any) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              netAssetValue: navMessage.nav,
              lastUpdated: new Date().toISOString()
            }
          }
        )

        // Update NAV history
        queryClient.setQueryData(
          DASHBOARD_QUERY_KEYS.navHistory(),
          (oldData: any[] | undefined) => {
            if (!oldData) return oldData
            const newPoint = {
              date: new Date().toISOString().split('T')[0],
              value: navMessage.nav,
              change: navMessage.nav - oldData[oldData.length - 1]?.value || 0,
              changePercent: navMessage.changePercent
            }
            return [...oldData.slice(1), newPoint] // Keep rolling 30 days
          }
        )
      }
    )

    // Subscribe to overview updates
    const overviewSubscription = wsClient.subscribe(
      'fund:overview',
      (data: any) => {
        // Update multiple dashboard components
        if (data.nav) {
          queryClient.setQueryData(
            DASHBOARD_QUERY_KEYS.stats(),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                netAssetValue: data.nav,
                assetsUnderManagement: data.aum || oldData.assetsUnderManagement,
                totalShares: data.totalShares || oldData.totalShares,
                pendingRedemptions: data.pendingRedemptions || oldData.pendingRedemptions,
                lastUpdated: new Date().toISOString()
              }
            }
          )
        }

        if (data.liquidity) {
          queryClient.setQueryData(
            DASHBOARD_QUERY_KEYS.liquidity(),
            data.liquidity
          )
        }

        if (data.events) {
          queryClient.setQueryData(
            DASHBOARD_QUERY_KEYS.recentEvents(),
            data.events
          )
        }
      }
    )

    return { navSubscription, overviewSubscription }
  }, [wsClient, queryClient])

  // Setup connection and subscriptions
  useEffect(() => {
    if (!autoConnect) return

    let subscriptions: { navSubscription: string; overviewSubscription: string } | undefined

    const setupConnection = async () => {
      try {
        await wsClient.connect()

        // Setup subscriptions after connection
        subscriptions = subscribeToDashboard()
      } catch (error) {
        console.error('Dashboard WebSocket connection failed:', error)
      }
    }

    setupConnection()

    // Cleanup on unmount
    return () => {
      if (subscriptions) {
        wsClient.unsubscribe(subscriptions.navSubscription)
        wsClient.unsubscribe(subscriptions.overviewSubscription)
      }
      wsClient.disconnect()
    }
  }, [autoConnect, wsClient, subscribeToDashboard])

  return {
    isConnected: wsClient.isConnected,
    connectionInfo: wsClient.getConnectionInfo(),
    subscribeToDashboard,
    refreshDashboard,
    sendCustomMessage
  }
}
