import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '../stores'
import { API_CONFIG, DEFAULT_HEADERS, ERROR_CODES } from '../config/environment'
import { toast } from 'sonner'

// Custom error classes for better error handling
export class ApiError extends Error {
  public readonly code: string
  public readonly status: number | null
  public readonly data: any

  constructor(message: string, code: string, status: number | null = null, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.data = data
  }
}

// Request ID counter for tracking
let requestIdCounter = 0

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${++requestIdCounter}`
}

// Format error messages based on status code
const formatErrorMessage = (error: AxiosError): string => {
  const { response, message } = error

  if (!response) {
    return message || 'Network error occurred'
  }

  const { status, data } = response

  switch (status) {
    case 400:
      return (data as any)?.message || 'Bad request'
    case 401:
      return 'Authentication required'
    case 403:
      return 'Access forbidden'
    case 404:
      return 'Resource not found'
    case 422:
      if ((data as any)?.errors) {
        // Format validation errors
        const errors = Object.values((data as any).errors).flat() as string[]
        return errors.join(', ')
      }
      return (data as any)?.message || 'Validation error'
    case 429:
      return 'Too many requests, please try again later'
    case 500:
      return 'Server error occurred'
    case 502:
      return 'Server temporarily unavailable'
    case 503:
      return 'Service unavailable'
    default:
      return (data as any)?.message || `Request failed with status ${status}`
  }
}

// Determine error code based on error type
const getErrorCode = (error: AxiosError): string => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ERROR_CODES.TIMEOUT_ERROR
    }
    return ERROR_CODES.NETWORK_ERROR
  }

  const { status } = error.response

  switch (status) {
    case 401:
      return ERROR_CODES.AUTH_ERROR
    case 403:
      return ERROR_CODES.PERMISSION_ERROR
    case 422:
      return ERROR_CODES.VALIDATION_ERROR
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.SERVER_ERROR
    default:
      return ERROR_CODES.UNKNOWN_ERROR
  }
}

// Create Axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: DEFAULT_HEADERS,
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const startTime = performance.now()

      // Add request ID for tracking
      config.headers = config.headers || {}
      config.headers['X-Request-ID'] = generateRequestId()

      // Inject JWT token if available
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Log request in development
      if (API_CONFIG.IS_DEVELOPMENT) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          headers: {
            ...config.headers,
            // Hide sensitive headers in logs
            Authorization: config.headers.Authorization ? '[REDACTED]' : undefined,
          },
          data: config.data,
          requestId: config.headers['X-Request-ID'],
        })
      }

      // Add request start time for performance tracking
      config.metadata = { startTime }
      return config
    },
    (error) => {
      console.error('❌ Request Interceptor Error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const startTime = response.config.metadata?.startTime
      const duration = startTime ? performance.now() - startTime : 0

      // Log response in development
      if (API_CONFIG.IS_DEVELOPMENT) {
        console.log('✅ API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: `${response.config.baseURL}${response.config.url}`,
          requestId: response.config.headers?.['X-Request-ID'],
          duration: `${duration.toFixed(2)}ms`,
          data: response.data,
        })
      }

      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      // Log error in development
      if (API_CONFIG.IS_DEVELOPMENT) {
        console.error('❌ API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: `${error.config?.baseURL}${error.config?.url}`,
          requestId: error.config?.headers?.['X-Request-ID'],
          message: error.message,
          data: error.response?.data,
        })
      }

      // Handle 401 Unauthorized - logout user (token refresh not implemented)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const authStore = useAuthStore.getState()
        authStore.logout()

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      // Show error toast for user feedback
      if (!API_CONFIG.IS_TEST && typeof window !== 'undefined') {
        const errorMessage = formatErrorMessage(error)
        toast.error(errorMessage)
      }

      // Create custom API error
      const apiError = new ApiError(
        formatErrorMessage(error),
        getErrorCode(error),
        error.response?.status || null,
        error.response?.data
      )

      return Promise.reject(apiError)
    }
  )

  return client
}

// Create and export API client instance
export const apiClient = createApiClient()

// Export utility functions
export const setAuthToken = (token: string) => {
  useAuthStore.getState().setToken(token)
}

export const clearAuthToken = () => {
  const authStore = useAuthStore.getState()
  authStore.logout()
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError
}

// Extend AxiosRequestConfig type to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
}