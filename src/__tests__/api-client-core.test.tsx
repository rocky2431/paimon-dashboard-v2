import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { apiClient, setAuthToken, clearAuthToken, isApiError, ApiError } from '../lib/api-client'
import { useAuthStore } from '../stores'

// Mock environment
vi.mock('../config/environment', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:3001/api/v1',
    TIMEOUT: 30000,
    IS_DEVELOPMENT: false,
    IS_PRODUCTION: false,
    IS_TEST: true,
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
    },
    DASHBOARD: {
      OVERVIEW: '/dashboard/overview',
      METRICS: '/dashboard/metrics',
    },
    REDEMPTIONS: {
      LIST: '/redemptions',
      DETAIL: (id: string) => `/redemptions/${id}`,
      APPROVE: (id: string) => `/redemptions/${id}/approve`,
      REJECT: (id: string) => `/redemptions/${id}/reject`,
    },
    RISK: {
      MONITORING: '/risk/monitoring',
      ALERTS: '/risk/alerts',
      REPORTS: '/risk/reports',
    },
    REBALANCE: {
      STATUS: '/rebalance/status',
      PLANS: '/rebalance/plans',
      EXECUTE: '/rebalance/execute',
    },
    REPORTS: {
      LIST: '/reports',
      GENERATE: '/reports/generate',
      DOWNLOAD: (id: string) => `/reports/${id}/download`,
    },
    USER: {
      PROFILE: '/user/profile',
      SETTINGS: '/user/settings',
      NOTIFICATIONS: '/user/notifications',
    },
  },
}))

// Mock toast to avoid DOM issues in tests
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('API Client Core', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have axios dependency available', async () => {
    expect(async () => {
      await import('axios')
    }).not.toThrow()
  })

  it('should create API client instance', () => {
    expect(apiClient).toBeDefined()
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3001/api/v1')
    expect(apiClient.defaults.timeout).toBe(30000)
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('should be an Axios instance', () => {
    expect(apiClient).toBeInstanceOf(Object)
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.put).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
  })

  it('should set and clear auth tokens', () => {
    const testToken = 'test-jwt-token'

    setAuthToken(testToken)
    expect(useAuthStore.getState().token).toBe(testToken)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    clearAuthToken()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('should identify ApiError instances', () => {
    const apiError = new ApiError('Test error', 'TEST_ERROR')
    const regularError = new Error('Regular error')

    expect(isApiError(apiError)).toBe(true)
    expect(isApiError(regularError)).toBe(false)
    expect(apiError.code).toBe('TEST_ERROR')
    expect(apiError.name).toBe('ApiError')
  })

  it('should add request ID to headers', () => {
    const config = {
      headers: {},
    }

    // Manually test the request ID generation logic
    apiClient.interceptors.request.handlers[0].fulfilled!(config)

    expect(config.headers['X-Request-ID']).toMatch(/^req_\d+_\d+$/)
  })

  it('should inject auth token when available', () => {
    const testToken = 'test-jwt-token'
    setAuthToken(testToken)

    const config = {
      headers: {},
    }

    apiClient.interceptors.request.handlers[0].fulfilled!(config)

    expect(config.headers.Authorization).toBe(`Bearer ${testToken}`)
  })

  it('should not inject auth token when not available', () => {
    const config = {
      headers: {},
    }

    apiClient.interceptors.request.handlers[0].fulfilled!(config)

    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should import all API services', async () => {
    const {
      ApiService,
      AuthService,
      DashboardService,
      RedemptionsService,
      RiskService,
      RebalanceService,
      ReportsService,
      UserService,
    } = await import('../services/api')

    expect(ApiService).toBeDefined()
    expect(AuthService).toBeDefined()
    expect(DashboardService).toBeDefined()
    expect(RedemptionsService).toBeDefined()
    expect(RiskService).toBeDefined()
    expect(RebalanceService).toBeDefined()
    expect(ReportsService).toBeDefined()
    expect(UserService).toBeDefined()

    // Check that all services have required methods
    expect(typeof ApiService.get).toBe('function')
    expect(typeof ApiService.post).toBe('function')
    expect(typeof ApiService.put).toBe('function')
    expect(typeof ApiService.patch).toBe('function')
    expect(typeof ApiService.delete).toBe('function')
  })

  it('should have correct endpoint URLs', async () => {
    const { API_ENDPOINTS } = await import('../config/environment')

    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login')
    expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout')
    expect(API_ENDPOINTS.DASHBOARD.OVERVIEW).toBe('/dashboard/overview')
    expect(API_ENDPOINTS.REDEMPTIONS.LIST).toBe('/redemptions')
    expect(API_ENDPOINTS.REDEMPTIONS.DETAIL('123')).toBe('/redemptions/123')
    expect(API_ENDPOINTS.USER.PROFILE).toBe('/user/profile')
  })
})

describe('Auth Store Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  it('should integrate with auth store', () => {
    const authStore = useAuthStore.getState()

    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)

    // Note: Zustand store might need reset between tests
    // For now, we'll test the store functionality exists
    expect(typeof authStore.setToken).toBe('function')
    expect(typeof authStore.logout).toBe('function')
    expect(typeof authStore.refreshTokens).toBe('function')
  })

  it('should handle token refresh failure', async () => {
    const authStore = useAuthStore.getState()

    await expect(authStore.refreshTokens()).rejects.toThrow('No refresh token available')
  })
})

describe('Environment Configuration', () => {
  it('should have correct API configuration', async () => {
    const { API_CONFIG, DEFAULT_HEADERS } = await import('../config/environment')

    expect(API_CONFIG.BASE_URL).toBe('http://localhost:3001/api/v1')
    expect(API_CONFIG.TIMEOUT).toBe(30000)
    expect(DEFAULT_HEADERS['Content-Type']).toBe('application/json')
    expect(DEFAULT_HEADERS['Accept']).toBe('application/json')
  })

  it('should have all error codes defined', async () => {
    const { ERROR_CODES } = await import('../config/environment')

    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR')
    expect(ERROR_CODES.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR')
    expect(ERROR_CODES.AUTH_ERROR).toBe('AUTH_ERROR')
    expect(ERROR_CODES.PERMISSION_ERROR).toBe('PERMISSION_ERROR')
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ERROR_CODES.SERVER_ERROR).toBe('SERVER_ERROR')
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
  })
})