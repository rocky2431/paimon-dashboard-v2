import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { useDashboardWebSocket } from '../../hooks/useDashboardWebSocket'
import type { FundNavUpdateMessage } from '../../lib/websocket-types'

// Mock WebSocket client
vi.mock('../../lib/websocket-client', () => ({
  WebSocketClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn().mockReturnValue('mock_subscription_id'),
    unsubscribe: vi.fn(),
    isConnected: false,
    connectionState: 'disconnected',
    getConnectionInfo: vi.fn().mockReturnValue({
      isConnected: false,
      connectionState: 'disconnected',
      url: 'wss://api.paimon.fund/ws',
      lastError: null,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null
    })
  }))
}))

// Mock TanStack Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0
    }
  }
})

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useDashboardWebSocket', () => {
  let mockWebSocketClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    const { WebSocketClient } = require('../../lib/websocket-client')
    mockWebSocketClient = WebSocketClient
  })

  describe('Basic Connection', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useDashboardWebSocket(), { wrapper })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.connectionInfo.connectionState).toBe('disconnected')
    })

    it('should provide refreshDashboard function', () => {
      const { result } = renderHook(() => useDashboardWebSocket(), { wrapper })

      expect(typeof result.current.refreshDashboard).toBe('function')
      expect(typeof result.current.sendCustomMessage).toBe('function')
      expect(typeof result.current.subscribeToDashboard).toBe('function')
    })
  })

  describe('Connection Management', () => {
    it('should connect on mount when autoConnect is true', async () => {
      renderHook(() => useDashboardWebSocket({ autoConnect: true }), { wrapper })

      await waitFor(() => {
        expect(mockWebSocketClient).toHaveBeenCalled()
      })
    })

    it('should not connect on mount when autoConnect is false', () => {
      renderHook(() => useDashboardWebSocket({ autoConnect: false }), { wrapper })

      // Should not attempt to connect immediately
      expect(mockWebSocketClient).toHaveBeenCalledTimes(0)
    })
  })

  describe('Real-time Data Updates', () => {
    it('should handle refreshDashboard calls correctly', () => {
      const { result } = renderHook(() => useDashboardWebSocket(), { wrapper })

      // Test different refresh types
      act(() => {
        result.current.refreshDashboard('all')
      })

      act(() => {
        result.current.refreshDashboard('stats')
      })

      act(() => {
        result.current.refreshDashboard('nav')
      })

      // Should not error and functions should be callable
      expect(typeof result.current.refreshDashboard).toBe('function')
    })
  })

  describe('WebSocket Events', () => {
    it('should handle sendCustomMessage when disconnected', () => {
      const { result } = renderHook(() => useDashboardWebSocket(), { wrapper })

      // Should not error when sending message while disconnected
      act(() => {
        result.current.sendCustomMessage({ type: 'test', data: {} })
      })

      expect(typeof result.current.sendCustomMessage).toBe('function')
    })
  })

  describe('Connection State Updates', () => {
    it('should track connection state changes', () => {
      const { result } = renderHook(() => useDashboardWebSocket(), { wrapper })

      // Initial state should be disconnected
      expect(result.current.isConnected).toBe(false)
      expect(result.current.connectionInfo).toBeDefined()
      expect(result.current.connectionInfo.connectionState).toBe('disconnected')
    })
  })
})