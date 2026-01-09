import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'

export interface WalletLoginCredentials {
  wallet_address: string
  signature: string
  nonce: string
}

export interface NonceResponse {
  nonce: string
  message: string
  expires_at: string
}

// Raw response from backend (no user object, info is in JWT)
export interface AuthResponseRaw {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

// Parsed user info from JWT
export interface JwtPayload {
  sub: string
  wallet_address: string
  roles: string[]
  permissions: string[]
  exp: number
  iat: number
  type: string
}

// Normalized response for frontend use
export interface AuthResponse {
  user: {
    id: string
    wallet_address: string
    roles: string[]
    permissions: string[]
  }
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

// Parse JWT payload without verification (verification done by backend)
function parseJwt(token: string): JwtPayload {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export interface CurrentUser {
  id: string
  wallet_address: string
  name?: string
  roles: string[]
  created_at: string
}

export class SimpleAuthService {
  async requestNonce(walletAddress: string): Promise<NonceResponse> {
    try {
      console.log('[SimpleAuthService] Requesting nonce for wallet:', walletAddress)
      const response = await apiClient.post<NonceResponse>(API_ENDPOINTS.AUTH.NONCE, {
        wallet_address: walletAddress
      })
      console.log('[SimpleAuthService] Nonce received')
      return response.data
    } catch (error: any) {
      console.error('[SimpleAuthService] Nonce request failed:', error)
      throw this.handleError(error, 'Failed to request login nonce')
    }
  }

  async login(credentials: WalletLoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[SimpleAuthService] Attempting wallet login for:', credentials.wallet_address)
      const response = await apiClient.post<AuthResponseRaw>(API_ENDPOINTS.AUTH.LOGIN, {
        wallet_address: credentials.wallet_address,
        signature: credentials.signature,
        nonce: credentials.nonce
      })
      console.log('[SimpleAuthService] Login successful')

      // Parse user info from JWT token
      const jwtPayload = parseJwt(response.data.access_token)

      // Return normalized response
      return {
        user: {
          id: jwtPayload.sub,
          wallet_address: jwtPayload.wallet_address,
          roles: jwtPayload.roles,
          permissions: jwtPayload.permissions,
        },
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
      }
    } catch (error: any) {
      console.error('[SimpleAuthService] Login failed:', error)
      throw this.handleError(error, 'Wallet login failed')
    }
  }

  async getCurrentUser(): Promise<CurrentUser> {
    try {
      const response = await apiClient.get<CurrentUser>(API_ENDPOINTS.AUTH.ME)
      return response.data
    } catch (error: any) {
      console.error('[SimpleAuthService] Get current user failed:', error)
      throw this.handleError(error, 'Failed to get user info')
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      })
      return response.data
    } catch (error: any) {
      console.error('[SimpleAuthService] Token refresh failed:', error)
      throw this.handleError(error, 'Token refresh failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    } catch (error) {
      console.warn('Logout API call failed:', error)
    }
  }

  // Verify token by calling /auth/me
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.ME)
      return true
    } catch (error: any) {
      // Log for debugging - distinguish auth failures from server errors
      const status = error.response?.status
      if (status === 401 || status === 403) {
        console.debug('[SimpleAuthService] Token verification failed - unauthorized')
      } else {
        console.warn('[SimpleAuthService] Token verification error:', {
          status,
          message: error.message
        })
      }
      return false
    }
  }

  // Centralized error handling
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          return new Error(data?.message || 'Invalid request data')
        case 401:
          return new Error(data?.message || 'Authentication failed')
        case 403:
          return new Error(data?.message || 'Access denied')
        case 404:
          return new Error('Endpoint not found')
        case 500:
          return new Error('Server error occurred')
        default:
          return new Error(`${defaultMessage}: ${error.message || 'Unknown error'}`)
      }
    } else if (error.code === 'ECONNREFUSED') {
      return new Error('Cannot connect to server')
    } else {
      return new Error('Network error. Please check your connection.')
    }
  }
}

export const simpleAuthService = new SimpleAuthService()
export default simpleAuthService