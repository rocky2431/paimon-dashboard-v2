import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'

export interface WalletCredentials {
  address: string
  signature: string
  message: string
  nonce: string
}

export interface WalletAuthResult {
  success: boolean
  token?: string
  refreshToken?: string
  user?: {
    id?: string
    wallet_address: string
    role?: string
    roles?: string[]
    permissions?: string[]
  }
  error?: string
}

// Backend response types
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface UserInfoResponse {
  id: string
  wallet_address: string
  role: string
  permissions: string[]
  created_at: string
  last_login: string
}

class WalletAuthService {
  private readonly AUTH_MESSAGE_PREFIX = 'Paimon Admin Dashboard Authentication'
  private readonly MESSAGE_EXPIRY = 5 * 60 * 1000 // 5 minutes

  /**
   * Generate authentication message with nonce
   */
  generateAuthMessage(address: string, nonce: string): string {
    const timestamp = Date.now()
    return `${this.AUTH_MESSAGE_PREFIX}\n` +
           `Address: ${address}\n` +
           `Nonce: ${nonce}\n` +
           `Timestamp: ${timestamp}\n` +
           `Please sign this message to authenticate.`
  }

  /**
   * Request nonce from server for wallet signature authentication
   */
  async getNonce(address: string): Promise<{ nonce: string; message: string; expiresAt: number }> {
    const response = await apiClient.post<{
      nonce: string
      message: string
      expires_at: number
    }>(API_ENDPOINTS.AUTH.NONCE, {
      wallet_address: address.toLowerCase()
    })

    return {
      nonce: response.data.nonce,
      message: response.data.message,
      expiresAt: response.data.expires_at
    }
  }

  /**
   * Verify message format and timestamp
   */
  verifyMessageFormat(message: string): boolean {
    if (!message.startsWith(this.AUTH_MESSAGE_PREFIX)) {
      console.warn('[WalletAuthService] Invalid message prefix')
      return false
    }

    try {
      // Extract timestamp from message
      const timestampMatch = message.match(/Timestamp: (\d+)/)
      if (!timestampMatch) {
        console.warn('[WalletAuthService] Missing timestamp in message')
        return false
      }

      const timestamp = parseInt(timestampMatch[1])
      const now = Date.now()

      // Check if message is expired
      if (now - timestamp > this.MESSAGE_EXPIRY) {
        console.warn('[WalletAuthService] Message expired:', {
          messageAge: now - timestamp,
          maxAge: this.MESSAGE_EXPIRY
        })
        return false
      }

      return true
    } catch (error) {
      console.error('[WalletAuthService] verifyMessageFormat error:', error)
      return false
    }
  }

  /**
   * Authenticate with wallet signature
   * Backend uses /auth/login directly for wallet authentication
   */
  async authenticateWithWallet(
    address: string,
    signature: string,
    nonce: string
  ): Promise<WalletAuthResult> {
    try {
      // Login with wallet signature
      const tokenResponse = await apiClient.post<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        wallet_address: address.toLowerCase(),
        signature,
        nonce,
      })

      // Get user info after successful login
      const userResponse = await apiClient.get<UserInfoResponse>(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`
        }
      })

      return {
        success: true,
        token: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        user: {
          id: userResponse.data.id,
          wallet_address: userResponse.data.wallet_address,
          role: userResponse.data.role,
          permissions: userResponse.data.permissions,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Authentication failed',
      }
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfoResponse | null> {
    try {
      const response = await apiClient.get<UserInfoResponse>(API_ENDPOINTS.AUTH.ME)
      return response.data
    } catch (error: any) {
      // Log error for debugging
      console.error('[WalletAuthService] getCurrentUser failed:', {
        status: error.response?.status,
        message: error.message
      })
      // Return null for any error - allows callers to treat this as a safe check
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.warn('[WalletAuthService] Server error during getCurrentUser - returning null')
      }
      return null
    }
  }

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error: any) {
      // Ignore logout errors, clear local state anyway
      console.warn('Logout API call failed:', error)
    }
  }

  /**
   * Generate login URL with wallet parameters
   */
  generateLoginURL(address: string, signature: string, message: string): string {
    const params = new URLSearchParams({
      wallet: address.toLowerCase(),
      signature,
      message: btoa(message), // Base64 encode message
    })
    return `/login?${params.toString()}`
  }

  /**
   * Parse wallet parameters from URL
   */
  parseWalletParams(search: string): WalletCredentials | null {
    try {
      const params = new URLSearchParams(search)
      const wallet = params.get('wallet')
      const signature = params.get('signature')
      const encodedMessage = params.get('message')

      if (!wallet || !signature || !encodedMessage) {
        console.debug('[WalletAuthService] Missing wallet params:', {
          hasWallet: !!wallet,
          hasSignature: !!signature,
          hasMessage: !!encodedMessage
        })
        return null
      }

      return {
        address: wallet,
        signature,
        message: atob(encodedMessage),
        nonce: '', // Will be extracted from message
      }
    } catch (error) {
      console.error('[WalletAuthService] parseWalletParams error:', error)
      return null
    }
  }
}

// Create singleton instance
export const walletAuthService = new WalletAuthService()

export default walletAuthService