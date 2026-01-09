import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number | null // milliseconds, null for manual close only
  timestamp: number
  read?: boolean
  action?: {
    label: string
    handler: () => void
  }
}

export interface NotificationsState {
  // State
  notifications: Notification[]
  maxNotifications: number
  defaultDuration: number

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  updateNotification: (id: string, updates: Partial<Notification>) => void

  // Convenience methods
  success: (title: string, message: string, options?: Partial<Notification>) => void
  error: (title: string, message: string, options?: Partial<Notification>) => void
  warning: (title: string, message: string, options?: Partial<Notification>) => void
  info: (title: string, message: string, options?: Partial<Notification>) => void

  // Configuration
  setMaxNotifications: (max: number) => void
  setDefaultDuration: (duration: number) => void
}

// Generate unique ID
const generateId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Default values
const defaultMaxNotifications = 5
const defaultDuration = 5000 // 5 seconds

// Notifications Store
export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      maxNotifications: defaultMaxNotifications,
      defaultDuration: defaultDuration,

      // Core actions
      addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = generateId()
        const timestamp = Date.now()
        const duration = notification.duration ?? get().defaultDuration

        const newNotification: Notification = {
          ...notification,
          id,
          timestamp,
          read: false,
        }

        set(
          (state) => {
            // Remove oldest notifications if we exceed max
            const updatedNotifications = [...state.notifications]
            if (updatedNotifications.length >= state.maxNotifications) {
              updatedNotifications.splice(0, updatedNotifications.length - state.maxNotifications + 1)
            }
            updatedNotifications.push(newNotification)
            return { notifications: updatedNotifications }
          },
          false,
          'notifications/add'
        )

        // Auto-remove if duration is set
        if (duration && duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, duration)
        }
      },

      removeNotification: (id: string) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'notifications/remove'
        )
      },

      clearNotifications: () => {
        set(
          { notifications: [] },
          false,
          'notifications/clear'
        )
      },

      markAsRead: (id: string) => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }),
          false,
          'notifications/markAsRead'
        )
      },

      markAllAsRead: () => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          }),
          false,
          'notifications/markAllAsRead'
        )
      },

      updateNotification: (id: string, updates: Partial<Notification>) => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, ...updates } : n
            ),
          }),
          false,
          'notifications/update'
        )
      },

      // Convenience methods
      success: (title: string, message: string, options?: Partial<Notification>) => {
        get().addNotification({
          type: 'success',
          title,
          message,
          ...options,
        })
      },

      error: (title: string, message: string, options?: Partial<Notification>) => {
        get().addNotification({
          type: 'error',
          title,
          message,
          duration: null, // Errors don't auto-dismiss by default
          ...options,
        })
      },

      warning: (title: string, message: string, options?: Partial<Notification>) => {
        get().addNotification({
          type: 'warning',
          title,
          message,
          ...options,
        })
      },

      info: (title: string, message: string, options?: Partial<Notification>) => {
        get().addNotification({
          type: 'info',
          title,
          message,
          ...options,
        })
      },

      // Configuration
      setMaxNotifications: (max: number) => {
        set(
          { maxNotifications: Math.max(1, max) },
          false,
          'notifications/setMaxNotifications'
        )

        // Trim existing notifications if needed
        const state = get()
        if (state.notifications.length > max) {
          set(
            (prevState) => ({
              notifications: prevState.notifications.slice(-max),
            }),
            false,
            'notifications/trimExcess'
          )
        }
      },

      setDefaultDuration: (duration: number) => {
        set(
          { defaultDuration: Math.max(0, duration) },
          false,
          'notifications/setDefaultDuration'
        )
      },
    }),
    {
      name: 'notifications-store',
      enabled: import.meta.env.DEV,
    }
  )
)

// Selectors for optimized re-renders
export const useNotifications = () => useNotificationsStore((state) => state.notifications)
export const useUnreadNotifications = () =>
  useNotificationsStore((state) => state.notifications.filter((n) => !n.read))
export const useNotificationsCount = () => useNotificationsStore((state) => state.notifications.length)
export const useUnreadCount = () =>
  useNotificationsStore((state) => state.notifications.filter((n) => !n.read).length)
export const useNotificationsConfig = () =>
  useNotificationsStore((state) => ({
    maxNotifications: state.maxNotifications,
    defaultDuration: state.defaultDuration,
  }))

// Combined selectors
export const useNotificationsState = () =>
  useNotificationsStore((state) => ({
    notifications: state.notifications,
    maxNotifications: state.maxNotifications,
    defaultDuration: state.defaultDuration,
  }))

export const useNotificationsActions = () =>
  useNotificationsStore((state) => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    updateNotification: state.updateNotification,
    success: state.success,
    error: state.error,
    warning: state.warning,
    info: state.info,
    setMaxNotifications: state.setMaxNotifications,
    setDefaultDuration: state.setDefaultDuration,
  }))

// Utility functions for external usage
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  options?: Partial<Notification>
) => {
  useNotificationsStore.getState().addNotification({
    type,
    title,
    message,
    ...options,
  })
}

export const notify = {
  success: (title: string, message: string, options?: Partial<Notification>) =>
    createNotification('success', title, message, options),
  error: (title: string, message: string, options?: Partial<Notification>) =>
    createNotification('error', title, message, options),
  warning: (title: string, message: string, options?: Partial<Notification>) =>
    createNotification('warning', title, message, options),
  info: (title: string, message: string, options?: Partial<Notification>) =>
    createNotification('info', title, message, options),
}