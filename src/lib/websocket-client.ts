import type {
  WebSocketMessage,
  WebSocketConfig,
  ConnectionState,
  WebSocketSubscription,
  ConnectionInfo,
  WebSocketErrorHandler,
  WebSocketCloseHandler,
  WebSocketOpenHandler,
  PingMessage,
  PongMessage,
  ErrorMessage,
  AuthMessage,
  SubscribeMessage,
  UnsubscribeMessage
} from './websocket-types'

// Default configuration
const DEFAULT_CONFIG: Partial<WebSocketConfig> = {
  maxRetries: 5,
  retryDelay: 1000,
  maxRetryDelay: 30000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 5000,
  connectTimeout: 10000,
  messageTimeout: 5000,
  enableCompression: true,
  debug: false
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private _connectionState: ConnectionState = 'disconnected'
  private subscriptions: Map<string, WebSocketSubscription> = new Map()
  private reconnectAttempts: number = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private lastError: string | null = null
  private lastConnectedAt: number | null = null
  private lastDisconnectedAt: number | null = null
  private messageId: number = 0
  private pendingMessages: Map<string, {
    resolve: (value: any) => void
    reject: (error: Error) => void
    timeout: ReturnType<typeof setTimeout>
  }> = new Map()

  // Event handlers
  private onOpenHandlers: Set<WebSocketOpenHandler> = new Set()
  private onCloseHandlers: Set<WebSocketCloseHandler> = new Set()
  private onErrorHandlers: Set<WebSocketErrorHandler> = new Set()
  private onMessageHandlers: Set<(message: WebSocketMessage) => void> = new Set()

  constructor(url: string, config: Partial<WebSocketConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      url
    }

    // Bind methods
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)

    // Listen for network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }

    this.debug('WebSocket client initialized', { config: this.config })
  }

  // Public properties
  get url(): string {
    return this.config.url
  }

  get isConnected(): boolean {
    return this._connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): ConnectionState {
    return this._connectionState
  }

  get subscriptionsList(): Record<string, WebSocketSubscription> {
    return Object.fromEntries(this.subscriptions)
  }

  // Public methods
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      this.debug('Already connecting or connected')
      return
    }

    this.setConnectionState('connecting')
    this.debug('Connecting to WebSocket', { url: this.config.url })

    try {
      // Clear any existing connection
      this.clearConnection()

      // Get authentication token if available
      const token = this.config.getToken?.()
      const wsUrl = this.buildWebSocketUrl(token || undefined)

      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl, this.config.protocols)

      // Set up event handlers
      this.ws.onopen = this.handleOpen
      this.ws.onclose = this.handleClose
      this.ws.onerror = this.handleError
      this.ws.onmessage = this.handleMessage

      // Set connection timeout
      if (this.config.connectTimeout) {
        this.connectTimer = setTimeout(() => {
          this.debug('Connection timeout')
          this.handleError(new Error('Connection timeout'))
        }, this.config.connectTimeout)
      }

    } catch (error) {
      this.debug('Connection error', { error })
      this.handleError(error as Error)
    }
  }

  disconnect(): void {
    this.debug('Disconnecting WebSocket')
    this.setConnectionState('disconnected')
    this.clearConnection()
    this.clearReconnectTimer()
    this.clearHeartbeat()
  }

  async send(message: Partial<WebSocketMessage>): Promise<void> {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected')
    }

    const fullMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: message.type || 'message',
      data: message.data || {},
      timestamp: Date.now(),
      ...message
    }

    try {
      this.ws.send(JSON.stringify(fullMessage))
      this.debug('Message sent', { message: fullMessage })
    } catch (error) {
      this.debug('Send error', { error, message: fullMessage })
      throw error
    }
  }

  async sendWithResponse<T = any>(
    message: Partial<WebSocketMessage>,
    timeout: number = this.config.messageTimeout!
  ): Promise<T> {
    const messageId = this.generateMessageId()
    const fullMessage: WebSocketMessage = {
      id: messageId,
      type: message.type || 'message',
      data: message.data || {},
      timestamp: Date.now(),
      ...message
    }

    return new Promise<T>((resolve, reject) => {
      // Set up timeout
      const timeoutTimer = setTimeout(() => {
        this.pendingMessages.delete(messageId)
        reject(new Error(`Message timeout: ${messageId}`))
      }, timeout)

      // Store pending message
      this.pendingMessages.set(messageId, {
        resolve,
        reject,
        timeout: timeoutTimer
      })

      // Send message
      this.send(fullMessage).catch((error) => {
        this.pendingMessages.delete(messageId)
        clearTimeout(timeoutTimer)
        reject(error)
      })
    })
  }

  subscribe(
    channel: string,
    handler: (data: any, message: WebSocketMessage) => void,
    params?: Record<string, any>
  ): string {
    const subscriptionId = this.generateMessageId()

    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      channel,
      handler: handler as any,
      params,
      isActive: true
    }

    this.subscriptions.set(subscriptionId, subscription)

    // Send subscription message if connected
    if (this.isConnected) {
      this.sendSubscribeMessage(channel, params)
    }

    this.debug('Subscribed to channel', { channel, subscriptionId })
    return subscriptionId
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      this.debug('Subscription not found', { subscriptionId })
      return
    }

    subscription.isActive = false
    this.subscriptions.delete(subscriptionId)

    // Send unsubscribe message if connected
    if (this.isConnected) {
      this.sendUnsubscribeMessage(subscription.channel)
    }

    this.debug('Unsubscribed from channel', { channel: subscription.channel, subscriptionId })
  }

  unsubscribeChannel(channel: string): void {
    const subscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.channel === channel && sub.isActive)

    subscriptions.forEach(sub => {
      this.unsubscribe(sub.id)
    })
  }

  // Event handler methods
  onOpen(handler: WebSocketOpenHandler): void {
    this.onOpenHandlers.add(handler)
  }

  onClose(handler: WebSocketCloseHandler): void {
    this.onCloseHandlers.add(handler)
  }

  onError(handler: WebSocketErrorHandler): void {
    this.onErrorHandlers.add(handler)
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.onMessageHandlers.add(handler)
  }

  // Utility methods
  getConnectionInfo(): ConnectionInfo {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      url: this.config.url,
      lastError: this.lastError,
      reconnectAttempts: this.reconnectAttempts,
      lastConnectedAt: this.lastConnectedAt,
      lastDisconnectedAt: this.lastDisconnectedAt
    }
  }

  getToken(): string | null {
    return this.config.getToken?.() || null
  }

  handleNetworkChange(): void {
    if (typeof navigator === 'undefined') return

    const isOnline = navigator.onLine
    this.debug('Network status changed', { isOnline })

    if (isOnline && !this.isConnected) {
      this.scheduleReconnect()
    } else if (!isOnline && this.isConnected) {
      this.disconnect()
    }
  }

  // Private methods
  private get isConnecting(): boolean {
    return this._connectionState === 'connecting'
  }

  private setConnectionState(state: ConnectionState): void {
    const oldState = this._connectionState
    this._connectionState = state
    this.debug('Connection state changed', { oldState, newState: state })
  }

  private buildWebSocketUrl(token?: string): string {
    let url = this.config.url

    // Add token as query parameter if provided
    if (token) {
      const separator = url.includes('?') ? '&' : '?'
      url = `${url}${separator}token=${encodeURIComponent(token)}`
    }

    return url
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageId}`
  }

  private handleOpen(event: Event): void {
    this.debug('WebSocket connected', { event })
    this.clearConnectTimer()
    this.setConnectionState('connected')
    this.lastConnectedAt = Date.now()
    this.lastError = null
    this.reconnectAttempts = 0

    // Start heartbeat
    this.startHeartbeat()

    // Resubscribe to channels
    this.resubscribeAll()

    // Call open handlers
    this.onOpenHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        this.logError('Open handler error', { error })
      }
    })

    // Authenticate if token is available
    const token = this.config.getToken?.()
    if (token) {
      this.sendAuthMessage(token)
    }
  }

  private handleClose(event: CloseEvent): void {
    this.debug('WebSocket closed', { event })
    this.setConnectionState('disconnected')
    this.lastDisconnectedAt = Date.now()
    this.clearConnection()
    this.clearHeartbeat()

    // Process any pending messages
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout)
      reject(new Error('Connection closed'))
    })
    this.pendingMessages.clear()

    // Call close handlers
    this.onCloseHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        this.logError('Close handler error', { error })
      }
    })

    // Schedule reconnection if not explicitly disconnected
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  private handleError(error: Event | Error): void {
    this.logError('WebSocket error', { error })
    this.lastError = error instanceof Error ? error.message : 'Unknown error'

    // Call error handlers
    this.onErrorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (handlerError) {
        this.logError('Error handler error', { handlerError })
      }
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.debug('Message received', { message })

      // Handle special message types
      if (this.handleSpecialMessage(message)) {
        return
      }

      // Process pending messages
      if (message.id && this.pendingMessages.has(message.id)) {
        const { resolve, timeout } = this.pendingMessages.get(message.id)!
        clearTimeout(timeout)
        this.pendingMessages.delete(message.id)
        resolve(message)
        return
      }

      // Route to subscriptions
      if (message.channel) {
        const subscriptions = Array.from(this.subscriptions.values())
          .filter(sub => sub.isActive && sub.channel === message.channel)

        subscriptions.forEach(subscription => {
          try {
            subscription.handler(message.data, message as any)
          } catch (error) {
            this.logError('Subscription handler error', {
              subscriptionId: subscription.id,
              channel: subscription.channel,
              error
            })
          }
        })
      }

      // Call general message handlers
      this.onMessageHandlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          this.logError('Message handler error', { error })
        }
      })

    } catch (error) {
      this.logError('Message parse error', { error, data: event.data })
    }
  }

  private handleSpecialMessage(message: WebSocketMessage): boolean {
    switch (message.type) {
      case 'pong':
        this.handlePongMessage(message as PongMessage)
        return true

      case 'error':
        this.handleErrorMessage(message as ErrorMessage)
        return true

      default:
        return false
    }
  }

  private handlePongMessage(message: PongMessage): void {
    this.debug('Pong received', { timestamp: message.timestamp })
    this.clearHeartbeatTimeout()
  }

  private handleErrorMessage(message: ErrorMessage): void {
    this.debug('Error message received', { error: message.error, code: message.code })
    this.lastError = message.error
  }

  private handleOnline(): void {
    this.debug('Browser online')
    this.handleNetworkChange()
  }

  private handleOffline(): void {
    this.debug('Browser offline')
    this.handleNetworkChange()
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return

    this.debug('Starting heartbeat', { interval: this.config.heartbeatInterval })

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendPing()
      }
    }, this.config.heartbeatInterval)
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatTimeout()
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  private sendPing(): void {
    if (!this.isConnected) return

    const pingMessage: PingMessage = {
      type: 'ping',
      data: {},
      timestamp: Date.now()
    }

    this.send(pingMessage)
    this.debug('Ping sent')

    // Set up timeout for pong response
    if (this.config.heartbeatTimeout) {
      this.heartbeatTimeoutTimer = setTimeout(() => {
        this.debug('Heartbeat timeout')
        this.handleError(new Error('Heartbeat timeout'))
      }, this.config.heartbeatTimeout)
    }
  }

  private sendAuthMessage(token: string): void {
    const authMessage: AuthMessage = {
      type: 'auth',
      data: {},
      token,
      timestamp: Date.now()
    }

    this.send(authMessage)
    this.debug('Auth message sent')
  }

  private sendSubscribeMessage(channel: string, params?: Record<string, any>): void {
    const subscribeMessage: SubscribeMessage = {
      type: 'subscribe',
      data: {},
      channel,
      params,
      timestamp: Date.now()
    }

    this.send(subscribeMessage)
    this.debug('Subscribe message sent', { channel, params })
  }

  private sendUnsubscribeMessage(channel: string): void {
    const unsubscribeMessage: UnsubscribeMessage = {
      type: 'unsubscribe',
      data: {},
      channel,
      timestamp: Date.now()
    }

    this.send(unsubscribeMessage)
    this.debug('Unsubscribe message sent', { channel })
  }

  private resubscribeAll(): void {
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive)

    this.debug('Resubscribing to channels', { count: activeSubscriptions.length })

    activeSubscriptions.forEach(subscription => {
      this.sendSubscribeMessage(subscription.channel, subscription.params)
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxRetries || 0)) {
      this.debug('Max reconnect attempts reached')
      this.setConnectionState('error')
      return
    }

    if (this.reconnectTimer) return

    const delay = this.calculateReconnectDelay()
    this.debug('Scheduling reconnect', { attempt: this.reconnectAttempts + 1, delay })

    this.setConnectionState('reconnecting')
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private clearConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }
  }

  private calculateReconnectDelay(): number {
    const baseDelay = this.config.retryDelay || 1000
    const maxDelay = this.config.maxRetryDelay || 30000
    const backoff = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts), maxDelay)

    // Add jitter to prevent thundering herd
    return backoff + Math.random() * 1000
  }

  private clearConnection(): void {
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect')
      }

      this.ws = null
    }

    this.clearConnectTimer()
    this.clearHeartbeat()
  }

  private debug(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[WebSocket] ${message}`, data || '')
    }
  }

  private logError(message: string, data?: any): void {
    // Always log errors regardless of debug mode
    console.error(`[WebSocket] ${message}`, data || '')
  }

  // Cleanup
  destroy(): void {
    this.debug('Destroying WebSocket client')
    this.disconnect()

    // Clear event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }

    // Clear handlers
    this.onOpenHandlers.clear()
    this.onCloseHandlers.clear()
    this.onErrorHandlers.clear()
    this.onMessageHandlers.clear()
    this.subscriptions.clear()
  }
}