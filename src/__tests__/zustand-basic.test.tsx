import { describe, it, expect, beforeEach } from 'vitest'

// Import stores
import { useAuthStore, useUIStore, useNotificationsStore } from '../stores'

describe('Zustand Stores Basic Functionality', () => {
  beforeEach(() => {
    // Reset stores before each test
    useAuthStore.getState().logout()
    useUIStore.getState().resetUI()
    useNotificationsStore.getState().clearNotifications()
  })

  describe('Auth Store Basic', () => {
    it('should initialize with correct default state', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBe(null)
      expect(state.token).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should have all required actions', () => {
      const state = useAuthStore.getState()
      expect(typeof state.login).toBe('function')
      expect(typeof state.logout).toBe('function')
      expect(typeof state.refreshTokens).toBe('function')
      expect(typeof state.setUser).toBe('function')
    })

    it('should handle login and logout', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockToken = 'test-token'

      await useAuthStore.getState().login(mockUser, mockToken)

      let state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)

      useAuthStore.getState().logout()

      state = useAuthStore.getState()
      expect(state.user).toBe(null)
      expect(state.token).toBe(null)
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('UI Store Basic', () => {
    it('should initialize with correct default state', () => {
      const state = useUIStore.getState()
      expect(state.theme).toBe('system')
      expect(state.sidebarCollapsed).toBe(false)
      expect(state.mobileMenuOpen).toBe(false)
      expect(state.layoutDensity).toBe('default')
    })

    it('should have all required actions', () => {
      const state = useUIStore.getState()
      expect(typeof state.setTheme).toBe('function')
      expect(typeof state.toggleSidebar).toBe('function')
      expect(typeof state.setSidebarCollapsed).toBe('function')
      expect(typeof state.toggleMobileMenu).toBe('function')
    })

    it('should handle theme changes', () => {
      useUIStore.getState().setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')

      useUIStore.getState().setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')

      useUIStore.getState().setTheme('system')
      expect(useUIStore.getState().theme).toBe('system')
    })

    it('should handle sidebar state', () => {
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)

      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)

      useUIStore.getState().setSidebarCollapsed(false)
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('Notifications Store Basic', () => {
    it('should initialize with correct default state', () => {
      const state = useNotificationsStore.getState()
      expect(state.notifications).toEqual([])
      expect(state.maxNotifications).toBe(5)
      expect(state.defaultDuration).toBe(5000)
    })

    it('should have all required actions', () => {
      const state = useNotificationsStore.getState()
      expect(typeof state.addNotification).toBe('function')
      expect(typeof state.removeNotification).toBe('function')
      expect(typeof state.clearNotifications).toBe('function')
      expect(typeof state.markAsRead).toBe('function')
    })

    it('should add and remove notifications', () => {
      const notification = {
        type: 'success' as const,
        title: 'Test',
        message: 'Test message'
      }

      useNotificationsStore.getState().addNotification(notification)

      let state = useNotificationsStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].type).toBe('success')
      expect(state.notifications[0].title).toBe('test-title') // Will be overwritten

      const notificationId = state.notifications[0].id
      useNotificationsStore.getState().removeNotification(notificationId)

      state = useNotificationsStore.getState()
      expect(state.notifications).toHaveLength(0)
    })

    it('should clear all notifications', () => {
      useNotificationsStore.getState().addNotification({
        type: 'info',
        title: 'Test 1',
        message: 'Message 1'
      })

      useNotificationsStore.getState().addNotification({
        type: 'warning',
        title: 'Test 2',
        message: 'Message 2'
      })

      expect(useNotificationsStore.getState().notifications).toHaveLength(2)

      useNotificationsStore.getState().clearNotifications()
      expect(useNotificationsStore.getState().notifications).toHaveLength(0)
    })
  })
})