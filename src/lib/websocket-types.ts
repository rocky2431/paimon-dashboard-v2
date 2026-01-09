// WebSocket message types and interfaces

export interface WebSocketMessage {
  id?: string
  type: string
  channel?: string
  timestamp: number
  data: any
  error?: string
}

export interface WebSocketResponse extends WebSocketMessage {
  success: boolean
  result?: any
}

// Specific message types
export interface PingMessage extends WebSocketMessage {
  type: 'ping'
}

export interface PongMessage extends WebSocketMessage {
  type: 'pong'
  timestamp: number
}

export interface SubscribeMessage extends WebSocketMessage {
  type: 'subscribe'
  channel: string
  params?: Record<string, any>
}

export interface UnsubscribeMessage extends WebSocketMessage {
  type: 'unsubscribe'
  channel: string
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error'
  error: string
  code?: string
  details?: any
}

// Authentication messages
export interface AuthMessage extends WebSocketMessage {
  type: 'auth'
  token: string
}

// Risk monitoring messages
export interface RiskAlertMessage extends WebSocketMessage {
  type: 'risk:alert'
  channel: 'risk:alerts'
  data: {
    action: 'created' | 'updated' | 'resolved' | 'acknowledged' | 'dismissed'
    alert: any
    timestamp: string
  }
}

export interface RiskMetricMessage extends WebSocketMessage {
  type: 'risk:metric'
  channel: 'risk:metrics'
  data: {
    action: 'updated'
    metric: any
    timestamp: string
  }
}

export interface RiskTrendMessage extends WebSocketMessage {
  type: 'risk:trend'
  channel: 'risk:trends'
  data: {
    action: 'updated'
    trend: any
    timestamp: string
  }
}

export interface AuthResponseMessage extends WebSocketResponse {
  type: 'auth_response'
  user?: {
    id: string
    email: string
    name: string
  }
}

// Channel-specific message types
export interface FundNavUpdateMessage extends WebSocketMessage {
  type: 'fund_nav_update'
  channel: 'fund:nav'
  fundId: string
  nav: number
  changePercent: number
  timestamp: number
}

export interface ApprovalNotificationMessage extends WebSocketMessage {
  type: 'approval_notification'
  channel: 'approval:new'
  approvalType: 'redemption' | 'rebalance' | 'risk_alert'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  approvalId: string
  title: string
  description: string
  requiresAction: boolean
  actionUrl?: string
}

export interface RiskAlertMessage extends WebSocketMessage {
  type: 'risk:alert'
  channel: 'risk:alerts'
  alertId: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
}

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// WebSocket configuration
export interface WebSocketConfig {
  url: string
  protocols?: string[]
  getToken?: () => string | null
  maxRetries?: number
  retryDelay?: number
  maxRetryDelay?: number
  heartbeatInterval?: number
  heartbeatTimeout?: number
  connectTimeout?: number
  messageTimeout?: number
  enableCompression?: boolean
  debug?: boolean
}

// Event handlers
export type WebSocketEventHandler<T = any> = (data: T, event: MessageEvent) => void
export type WebSocketErrorHandler = (error: Event | Error) => void
export type WebSocketCloseHandler = (event: CloseEvent) => void
export type WebSocketOpenHandler = (event: Event) => void

// Subscription interface
export interface WebSocketSubscription {
  channel: string
  handler: WebSocketEventHandler
  params?: Record<string, any>
  isActive: boolean
  id: string
}

// Connection info
export interface ConnectionInfo {
  isConnected: boolean
  connectionState: ConnectionState
  url: string
  lastError: string | null
  reconnectAttempts: number
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
}

// Message validation
export interface MessageValidator {
  validate(message: any): WebSocketMessage | null
  isValid(message: WebSocketMessage): boolean
}

// Channel configuration
export interface ChannelConfig {
  name: string
  requiresAuth?: boolean
  rateLimit?: number
  maxSubscribers?: number
  persist?: boolean
}

// Export all message types for easy usage
export type WSMessage = WebSocketMessage
export type WSPing = PingMessage
export type WSPong = PongMessage
export type WSSubscribe = SubscribeMessage
export type WSUnsubscribe = UnsubscribeMessage
export type WSError = ErrorMessage
export type WSAuth = AuthMessage
export type WSAuthResponse = AuthResponseMessage
export type WSFundNavUpdate = FundNavUpdateMessage
export type WSApprovalNotification = ApprovalNotificationMessage
export type WSRiskAlert = RiskAlertMessage