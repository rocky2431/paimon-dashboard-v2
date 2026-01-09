import { useCallback, useEffect, useRef, useState } from 'react'
import type { WebSocketConfig, ConnectionState, WebSocketMessage } from '../lib/websocket-types'
import { WebSocketClient } from '../lib/websocket-client'
import { useAuthStore } from '../stores'

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectOnFocus?: boolean
  getToken?: () => string | null
}

interface UseWebSocketReturn {
  client: WebSocketClient | null
  isConnected: boolean
  connectionState: ConnectionState
  connectionInfo: ReturnType<WebSocketClient['getConnectionInfo']> | null
  error: string | null
  send: (message: Partial<WebSocketMessage>) => Promise<void>
  sendWithResponse: <T = any>(
    message: Partial<WebSocketMessage>,
    timeout?: number
  ) => Promise<T>
  subscribe: (
    channel: string,
    handler: (data: any, message: WebSocketMessage) => void,
    params?: Record<string, any>
  ) => string
  unsubscribe: (subscriptionId: string) => void
  unsubscribeChannel: (channel: string) => void
  connect: () => Promise<void>
  disconnect: () => void
}

export function useWebSocket(url?: string, options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnectOnFocus = true
  } = options

  // Refs to maintain stable references
  const clientRef = useRef<WebSocketClient | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Get auth token from store
  const authToken = useAuthStore(state => state.token)

  // Create client instance
  useEffect(() => {
    if (!url) return

    const config: Partial<WebSocketConfig> = {
      getToken: () => authToken || options.getToken?.() || null,
      debug: import.meta.env.DEV
    }

    clientRef.current = new WebSocketClient(url, config)

    // Set up event listeners
    const client = clientRef.current

    const handleOpen = () => {
      setConnectionState('connected')
      setError(null)
    }

    const handleClose = () => {
      setConnectionState('disconnected')
    }

    const handleError = (err: Event | Error) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    }

    client.onOpen(handleOpen)
    client.onClose(handleClose)
    client.onError(handleError)

    // Auto connect if enabled
    if (autoConnect) {
      client.connect().catch(err => {
        console.error('Auto-connect failed:', err)
      })
    }

    return () => {
      client.destroy()
    }
  }, [url, authToken, autoConnect, options.getToken])

  // Handle page visibility changes
  useEffect(() => {
    if (!reconnectOnFocus || !clientRef.current) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !clientRef.current!.isConnected) {
        clientRef.current!.connect().catch(err => {
          console.error('Reconnect on focus failed:', err)
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [reconnectOnFocus])

  // Memoized methods
  const send = useCallback(async (message: Partial<WebSocketMessage>) => {
    if (!clientRef.current) {
      throw new Error('WebSocket client not initialized')
    }
    return clientRef.current.send(message)
  }, [])

  const sendWithResponse = useCallback(async <T = any>(
    message: Partial<WebSocketMessage>,
    timeout?: number
  ): Promise<T> => {
    if (!clientRef.current) {
      throw new Error('WebSocket client not initialized')
    }
    return clientRef.current.sendWithResponse<T>(message, timeout)
  }, [])

  const subscribe = useCallback((
    channel: string,
    handler: (data: any, message: WebSocketMessage) => void,
    params?: Record<string, any>
  ): string => {
    if (!clientRef.current) {
      throw new Error('WebSocket client not initialized')
    }
    return clientRef.current.subscribe(channel, handler, params)
  }, [])

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (!clientRef.current) return
    clientRef.current.unsubscribe(subscriptionId)
  }, [])

  const unsubscribeChannel = useCallback((channel: string) => {
    if (!clientRef.current) return
    clientRef.current.unsubscribeChannel(channel)
  }, [])

  const connect = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('WebSocket client not initialized')
    }
    return clientRef.current.connect()
  }, [])

  const disconnect = useCallback(() => {
    if (!clientRef.current) return
    clientRef.current.disconnect()
  }, [])

  return {
    client: clientRef.current,
    isConnected: clientRef.current?.isConnected || false,
    connectionState,
    connectionInfo: clientRef.current?.getConnectionInfo() || null,
    error,
    send,
    sendWithResponse,
    subscribe,
    unsubscribe,
    unsubscribeChannel,
    connect,
    disconnect
  }
}

// Hook for connection status
export function useWebSocketStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline
  }
}

// Hook for WebSocket subscription management
export function useWebSocketSubscription(
  ws: UseWebSocketReturn,
  channel: string,
  handler: (data: any, message: WebSocketMessage) => void,
  params?: Record<string, any>
) {
  const subscriptionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!ws.client || !ws.isConnected) return

    // Subscribe when connected
    subscriptionIdRef.current = ws.subscribe(channel, handler, params)

    return () => {
      // Unsubscribe on cleanup
      if (subscriptionIdRef.current) {
        ws.unsubscribe(subscriptionIdRef.current)
        subscriptionIdRef.current = null
      }
    }
  }, [ws.client, ws.isConnected, channel, handler, params])

  return subscriptionIdRef.current
}

// Higher-level hooks for specific channels
export function useFundNavUpdates(handler: (data: any, message: WebSocketMessage) => void) {
  const ws = useWebSocket()

  useWebSocketSubscription(ws, 'fund:nav', handler)
}

export function useApprovalNotifications(handler: (data: any, message: WebSocketMessage) => void) {
  const ws = useWebSocket()

  useWebSocketSubscription(ws, 'approval:new', handler)
}

export function useRiskAlerts(handler: (data: any, message: WebSocketMessage) => void) {
  const ws = useWebSocket()

  useWebSocketSubscription(ws, 'risk:alert', handler)
}