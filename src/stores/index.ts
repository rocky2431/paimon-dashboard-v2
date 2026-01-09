// Barrel export for all stores and types

// Auth Store
export { useAuthStore } from './authStore'
export type { User, AuthState } from './authStore'
export {
  useAuthUser,
  useAuthToken,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuthState,
  useAuthActions,
} from './authStore'

// UI Store
export { useUIStore } from './uiStore'
export type { Theme, UIState } from './uiStore'
export {
  useTheme,
  useSidebarState,
  useMobileState,
  useLayoutDensity,
  useNotificationsEnabled,
  useReducedMotion,
  useUIState,
  useUIActions,
} from './uiStore'

// Notifications Store
export { useNotificationsStore } from './notificationsStore'
export type { Notification, NotificationType, NotificationsState } from './notificationsStore'
export {
  useNotifications,
  useUnreadNotifications,
  useNotificationsCount,
  useUnreadCount,
  useNotificationsConfig,
  useNotificationsState,
  useNotificationsActions,
  notify,
} from './notificationsStore'

// Re-export for convenience
export { createNotification as createNotification } from './notificationsStore'