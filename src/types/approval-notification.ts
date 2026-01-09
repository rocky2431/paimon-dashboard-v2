/**
 * Approval Notification Type Definitions
 * Real-time WebSocket notification system for approval queue updates
 */

import type { ApprovalQueueItem } from './approval-queue'

export interface ApprovalNotificationMessage {
  id: string
  type: 'approval:new' | 'approval:updated' | 'approval:assigned' | 'approval:status_changed'
  timestamp: string
  data: ApprovalNotificationData
}

export interface ApprovalNotificationData {
  item: ApprovalQueueItem
  changeType?: 'created' | 'approved' | 'rejected' | 'assigned' | 'status_updated'
  previousStatus?: ApprovalQueueItem['status']
  newStatus?: ApprovalQueueItem['status']
  assignedTo?: string
  reason?: string
  notes?: string
}

export interface ApprovalNotificationSettings {
  enabled: boolean
  soundEnabled: boolean
  showPreview: boolean
  autoHideDelay: number // in milliseconds, 0 = manual close only
  groupSimilar: boolean
  maxVisible: number
}

export interface ApprovalToastNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: string
  itemId?: string
  actionUrl?: string
  actions?: ToastAction[]
  autoHide?: boolean
  duration?: number
}

export interface ToastAction {
  label: string
  action: 'view' | 'approve' | 'reject' | 'assign' | 'dismiss'
  primary?: boolean
  destructive?: boolean
}

export interface NotificationSubscription {
  id: string
  channels: string[]
  active: boolean
  lastMessage?: ApprovalNotificationMessage
  createdAt: string
}

export interface NotificationStats {
  totalReceived: number
  totalDisplayed: number
  lastReceived?: string
  subscriptionCount: number
  activeConnections: number
}

// WebSocket message envelope for approval notifications
export interface ApprovalWebSocketMessage {
  channel: 'approval:new' | 'approval:updated' | 'approval:assigned'
  message: ApprovalNotificationMessage
  signature?: string // for message integrity verification
}

// Notification queue management
export interface NotificationQueue {
  pending: ApprovalToastNotification[]
  displayed: ApprovalToastNotification[]
  dismissed: ApprovalToastNotification[]
  settings: ApprovalNotificationSettings
}

// Connection status for real-time features
export interface NotificationConnectionStatus {
  connected: boolean
  connecting: boolean
  error?: string
  lastConnected?: string
  reconnectAttempts: number
  subscriptions: NotificationSubscription[]
}