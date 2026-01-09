import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { WebSocketClient } from '../lib/websocket-client'
import type { WebSocketConfig, WebSocketMessage } from '../lib/websocket-types'
import { useAuthStore } from '../stores'
import { API_CONFIG } from '../config/environment'

interface WebSocketContextValue {
  client: WebSocketClient | null
  isConnected: boolean
  connectionState: string
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  send: (message: Partial<WebSocketMessage>) => Promise<void>
  subscribe: (
    channel: string,
    handler: (data: any, message: WebSocketMessage) => void,
    params?: Record<string, any>
  ) => string
  unsubscribe: (subscriptionId: string) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
  config?: Partial<WebSocketConfig>
  autoConnect?: boolean
}

export function WebSocketProvider({
  children,
  url = API_CONFIG.WS_URL,
  config = {},
  autoConnect = API_CONFIG.WS_ENABLED
}: WebSocketProviderProps) {
  const clientRef = useRef<WebSocketClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Get auth token from store
  const authToken = useAuthStore(state => state.token)

  // Create and configure client
  useEffect(() => {
    const wsConfig: Partial<WebSocketConfig> = {
      getToken: () => authToken,
      debug: import.meta.env.DEV,
      maxRetries: 5,
      retryDelay: 1000,
      heartbeatInterval: 30000,
      ...config
    }

    const client = new WebSocketClient(url, wsConfig)
    clientRef.current = client

    // Set up event listeners
    const handleOpen = () => {
      setIsConnected(true)
      setConnectionState('connected')
      setError(null)
    }

    const handleClose = () => {
      setIsConnected(false)
      setConnectionState('disconnected')
    }

    const handleError = (err: Event | Error) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsConnected(false)
    }

    client.onOpen(handleOpen)
    client.onClose(handleClose)
    client.onError(handleError)

    // Auto connect if enabled
    if (autoConnect) {
      client.connect().catch(err => {
        console.error('WebSocket auto-connect failed:', err)
      })
    }

    return () => {
      client.destroy()
    }
  }, [url, authToken, config, autoConnect])

  // Memoized context value
  const contextValue: WebSocketContextValue = {
    client: clientRef.current,
    isConnected,
    connectionState,
    error,
    connect: async () => {
      if (!clientRef.current) {
        throw new Error('WebSocket client not initialized')
      }
      return clientRef.current.connect()
    },
    disconnect: () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
      }
    },
    send: async (message: Partial<WebSocketMessage>) => {
      if (!clientRef.current) {
        throw new Error('WebSocket client not initialized')
      }
      return clientRef.current.send(message)
    },
    subscribe: (
      channel: string,
      handler: (data: any, message: WebSocketMessage) => void,
      params?: Record<string, any>
    ) => {
      if (!clientRef.current) {
        throw new Error('WebSocket client not initialized')
      }
      return clientRef.current.subscribe(channel, handler, params)
    },
    unsubscribe: (subscriptionId: string) => {
      if (clientRef.current) {
        clientRef.current.unsubscribe(subscriptionId)
      }
    }
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}

// Hook for connection status display
export function useWebSocketStatus() {
  const { isConnected, connectionState, error } = useWebSocketContext()

  return {
    isConnected,
    connectionState,
    error,
    statusText: getStatusText(connectionState, error),
    statusColor: getStatusColor(connectionState, error)
  }
}

function getStatusText(state: string, error: string | null): string {
  switch (state) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'reconnecting':
      return 'Reconnecting...'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return error || 'Connection error'
    default:
      return 'Unknown'
  }
}

function getStatusColor(state: string, _error: string | null): string {
  switch (state) {
    case 'connected':
      return 'text-green-600'
    case 'connecting':
    case 'reconnecting':
      return 'text-yellow-600'
    case 'disconnected':
      return 'text-gray-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Connection status component
export function WebSocketStatusIndicator() {
  const { statusText, statusColor, isConnected } = useWebSocketStatus()

  return (
    <div className={`flex items-center space-x-2 text-sm ${statusColor}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-gray-400'
      }`} />
      <span>{statusText}</span>
    </div>
  )
}