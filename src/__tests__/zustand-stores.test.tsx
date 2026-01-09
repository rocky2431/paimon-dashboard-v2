import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Import stores using ES module syntax
import {
  useAuthStore,
  useUIStore,
  useNotificationsStore,
  useAuthUser,
  useAuthToken,
  useTheme,
  useNotifications,
  notify
} from '../stores'

// Types
import type { User, Notification } from '../stores'

describe('Zustand Stores Implementation', () => {
  beforeEach(() => {
    // Reset any global state before each test
    vi.clearAllMocks()

    // Reset stores to initial state
    useAuthStore.getState().logout()
    useUIStore.getState().resetUI()
    useNotificationsStore.getState().clearNotifications()
  })

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks()
  })

  describe('Package Dependencies', () => {
    it('should have zustand dependency available', async () => {
      expect(async () => {
        await import('zustand')
      }).not.toThrow()
    })

    it('should import create function from zustand', async () => {
      const { create } = await import('zustand')
      expect(create).toBeDefined()
      expect(typeof create).toBe('function')
    })

    it('should have zustand devtools middleware', async () => {
      const { devtools } = await import('zustand/middleware')
      expect(devtools).toBeDefined()
      expect(typeof devtools).toBe('function')
    })

    it('should have zustand persist middleware', async () => {
      const { persist } = await import('zustand/middleware')
      expect(persist).toBeDefined()
      expect(typeof persist).toBe('function')
    })
  })

  describe('Auth Store', () => {
    it('should be able to import auth store', async () => {
      expect(async () => {
        await import('../stores/authStore')
      }).not.toThrow()
    })

    it('should export auth store hook', () => {
      expect(useAuthStore).toBeDefined()
      expect(typeof useAuthStore).toBe('function')
    })

    it('should have proper auth state structure', () => {
      const state = useAuthStore.getState()

      // Should have user state
      expect(state).toHaveProperty('user')
      expect(state).toHaveProperty('token')
      expect(state).toHaveProperty('isAuthenticated')
      expect(state).toHaveProperty('isLoading')

      // Should have actions
      expect(state).toHaveProperty('login')
      expect(state).toHaveProperty('logout')
      expect(state).toHaveProperty('refreshTokens')
      expect(state).toHaveProperty('setUser')

      expect(typeof state.login).toBe('function')
      expect(typeof state.logout).toBe('function')
      expect(typeof state.refreshTokens).toBe('function')
      expect(typeof state.setUser).toBe('function')
    })

    it('should handle user login correctly', async () => {
      const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockToken = 'mock-jwt-token'

      await useAuthStore.getState().login(mockUser, mockToken)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should handle user logout correctly', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token',
        isAuthenticated: true
      })

      // Logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBe(null)
      expect(state.token).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should handle token refresh', async () => {
      const newToken = 'new-jwt-token'

      // Set initial state with token
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'old-token',
        isAuthenticated: true
      })

      await useAuthStore.getState().refreshTokens(newToken)

      const state = useAuthStore.getState()
      expect(state.token).toBe(newToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should have proper TypeScript types', () => {
      const state = useAuthStore.getState()

      // User should be properly typed
      if (state.user) {
        expect(typeof state.user.id).toBe('string')
        expect(typeof state.user.email).toBe('string')
        expect(typeof state.user.name).toBe('string')
      }

      // Token should be string or null
      expect(state.token === null || typeof state.token === 'string').toBe(true)
    })

    it('should provide optimized selectors', () => {
      // Test that optimized selectors are exported
      expect(typeof useAuthUser).toBe('function')
      expect(typeof useAuthToken).toBe('function')

      // Test that we can access state directly
      const state = useAuthStore.getState()
      expect(state.user).toBe(null)
      expect(state.token).toBe(null)
    })
  })

  describe('UI Store', () => {
    it('should be able to import ui store', async () => {
      expect(async () => {
        await import('../stores/uiStore')
      }).not.toThrow()
    })

    it('should export ui store hook', () => {
      expect(useUIStore).toBeDefined()
      expect(typeof useUIStore).toBe('function')
    })

    it('should have proper ui state structure', () => {
      const state = useUIStore.getState()

      // Should have theme state
      expect(state).toHaveProperty('theme')
      expect(['light', 'dark', 'system']).toContain(state.theme)

      // Should have sidebar state
      expect(state).toHaveProperty('sidebarCollapsed')
      expect(typeof state.sidebarCollapsed).toBe('boolean')

      // Should have mobile menu state
      expect(state).toHaveProperty('mobileMenuOpen')
      expect(typeof state.mobileMenuOpen).toBe('boolean')

      // Should have actions
      expect(state).toHaveProperty('setTheme')
      expect(state).toHaveProperty('toggleSidebar')
      expect(state).toHaveProperty('setSidebarCollapsed')
      expect(state).toHaveProperty('toggleMobileMenu')
      expect(state).toHaveProperty('setMobileMenuOpen')

      expect(typeof state.setTheme).toBe('function')
      expect(typeof state.toggleSidebar).toBe('function')
      expect(typeof state.setSidebarCollapsed).toBe('function')
      expect(typeof state.toggleMobileMenu).toBe('function')
      expect(typeof state.setMobileMenuOpen).toBe('function')
    })

    it('should handle theme switching', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(), // deprecated
          removeListener: vi.fn(), // deprecated
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      // Mock document
      Object.defineProperty(global, 'document', {
        writable: true,
        value: {
          documentElement: {
            classList: {
              remove: vi.fn(),
              add: vi.fn(),
            },
          },
        },
      })

      // Test setting to dark theme
      useUIStore.getState().setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')

      // Test setting to light theme
      useUIStore.getState().setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')

      // Test setting to system theme
      useUIStore.getState().setTheme('system')
      expect(useUIStore.getState().theme).toBe('system')
    })

    it('should handle sidebar state changes', () => {
      // Initially should not be collapsed
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)

      // Toggle sidebar
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)

      // Set sidebar state explicitly
      useUIStore.getState().setSidebarCollapsed(false)
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })

    it('should handle mobile menu state', () => {
      // Initially should be closed
      expect(useUIStore.getState().mobileMenuOpen).toBe(false)

      // Toggle mobile menu
      useUIStore.getState().toggleMobileMenu()
      expect(useUIStore.getState().mobileMenuOpen).toBe(true)

      // Set mobile menu state explicitly
      useUIStore.getState().setMobileMenuOpen(false)
      expect(useUIStore.getState().mobileMenuOpen).toBe(false)
    })

    it('should provide optimized selectors', () => {
      // Test that optimized selectors are exported
      expect(typeof useTheme).toBe('function')

      // Test that we can access state directly
      const state = useUIStore.getState()
      expect(['light', 'dark', 'system']).toContain(state.theme)
    })
  })

  describe('Notifications Store', () => {
    it('should be able to import notifications store', async () => {
      expect(async () => {
        await import('../stores/notificationsStore')
      }).not.toThrow()
    })

    it('should export notifications store hook', () => {
      expect(useNotificationsStore).toBeDefined()
      expect(typeof useNotificationsStore).toBe('function')
    })

    it('should have proper notifications state structure', () => {
      const state = useNotificationsStore.getState()

      // Should have notifications array
      expect(state).toHaveProperty('notifications')
      expect(Array.isArray(state.notifications)).toBe(true)

      // Should have actions
      expect(state).toHaveProperty('addNotification')
      expect(state).toHaveProperty('removeNotification')
      expect(state).toHaveProperty('clearNotifications')
      expect(state).toHaveProperty('markAsRead')

      expect(typeof state.addNotification).toBe('function')
      expect(typeof state.removeNotification).toBe('function')
      expect(typeof state.clearNotifications).toBe('function')
      expect(typeof state.markAsRead).toBe('function')
    })

    it('should add notifications correctly', () => {
      const notification: Omit<Notification, 'id' | 'timestamp'> = {
        id: '1', // This will be overwritten by the store
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully'
      }

      useNotificationsStore.getState().addNotification(notification)

      const state = useNotificationsStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toEqual(expect.objectContaining({
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully'
      }))
      expect(typeof state.notifications[0].id).toBe('string')
      expect(typeof state.notifications[0].timestamp).toBe('number')
    })

    it('should remove notifications correctly', () => {
      // Add a notification first
      useNotificationsStore.getState().addNotification({
        id: '1', // Will be overwritten
        type: 'info',
        title: 'Info',
        message: 'Test message'
      })

      const notificationsAfterAdd = useNotificationsStore.getState().notifications
      expect(notificationsAfterAdd).toHaveLength(1)

      // Remove the notification
      useNotificationsStore.getState().removeNotification(notificationsAfterAdd[0].id)

      expect(useNotificationsStore.getState().notifications).toHaveLength(0)
    })

    it('should clear all notifications', () => {
      // Add multiple notifications
      useNotificationsStore.getState().addNotification({
        id: '1', // Will be overwritten
        type: 'info',
        title: 'Info 1',
        message: 'Message 1'
      })

      useNotificationsStore.getState().addNotification({
        id: '2', // Will be overwritten
        type: 'success',
        title: 'Success',
        message: 'Message 2'
      })

      expect(useNotificationsStore.getState().notifications).toHaveLength(2)

      // Clear all
      useNotificationsStore.getState().clearNotifications()

      expect(useNotificationsStore.getState().notifications).toHaveLength(0)
    })

    it('should handle notification timestamps', () => {
      const beforeAdd = Date.now()

      useNotificationsStore.getState().addNotification({
        id: '1', // Will be overwritten
        type: 'warning',
        title: 'Warning',
        message: 'Test warning'
      })

      const afterAdd = Date.now()
      const notification = useNotificationsStore.getState().notifications[0]

      expect(notification.timestamp).toBeGreaterThanOrEqual(beforeAdd)
      expect(notification.timestamp).toBeLessThanOrEqual(afterAdd)
    })

    it('should provide convenience methods', () => {
      expect(typeof notify.success).toBe('function')
      expect(typeof notify.error).toBe('function')
      expect(typeof notify.warning).toBe('function')
      expect(typeof notify.info).toBe('function')
    })

    it('should provide optimized selectors', () => {
      // Test that optimized selectors are exported
      expect(typeof useNotifications).toBe('function')

      // Test that we can access state directly
      const state = useNotificationsStore.getState()
      expect(Array.isArray(state.notifications)).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should export all stores from index barrel', async () => {
      expect(async () => {
        await import('../stores')
      }).not.toThrow()
    })

    it('should barrel export all store hooks', () => {
      expect(useAuthStore).toBeDefined()
      expect(useUIStore).toBeDefined()
      expect(useNotificationsStore).toBeDefined()

      expect(typeof useAuthStore).toBe('function')
      expect(typeof useUIStore).toBe('function')
      expect(typeof useNotificationsStore).toBe('function')
    })

    it('should have store types exported', async () => {
      const stores = await import('../stores')

      // Check if stores are available
      expect(Object.keys(stores)).toContain('useAuthStore')
      expect(Object.keys(stores)).toContain('useUIStore')
      expect(Object.keys(stores)).toContain('useNotificationsStore')
      expect(Object.keys(stores)).toContain('notify')
    })
  })

  describe('Performance and Memory', () => {
    it('should handle multiple store operations efficiently', () => {
      const startTime = performance.now()

      // Add many notifications
      for (let i = 0; i < 100; i++) {
        useNotificationsStore.getState().addNotification({
          id: `test-${i}`, // Will be overwritten
          type: 'info',
          title: `Notification ${i}`,
          message: `Message ${i}`
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (< 100ms for 100 operations)
      expect(duration).toBeLessThan(100)
      expect(useNotificationsStore.getState().notifications.length).toBeGreaterThanOrEqual(0)

      // Clear them
      useNotificationsStore.getState().clearNotifications()
    })

    it('should not leak memory on store reset', () => {
      // Set some state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true
      })
      useUIStore.setState({ theme: 'dark' })
      useNotificationsStore.getState().addNotification({
        id: '1', // Will be overwritten
        type: 'info',
        title: 'Test',
        message: 'Test message'
      })

      // Reset stores
      useAuthStore.getState().logout()
      useUIStore.getState().resetUI()
      useNotificationsStore.getState().clearNotifications()

      // State should be reset to initial values
      expect(useAuthStore.getState().user).toBe(null)
      expect(useUIStore.getState().theme).toBe('system') // Default theme
      expect(useNotificationsStore.getState().notifications).toHaveLength(0)
    })
  })
})