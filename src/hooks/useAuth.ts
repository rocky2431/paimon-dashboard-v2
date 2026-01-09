import { useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, type User } from '../stores'
import { simpleAuthService, type WalletLoginCredentials } from '../services/auth-simple'

export interface UseAuthReturn {
  // Authentication state
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  requestNonce: (walletAddress: string) => Promise<{ nonce: string; message: string; expires_at: string }>
  login: (credentials: WalletLoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string>
  updateUser: (user: User) => void

  // Convenience methods
  hasRole: (role: string) => boolean
  isAdmin: boolean
  isOperator: boolean
  isViewer: boolean
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const location = useLocation()

  // Get auth state from Zustand store
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    clearAuth,
    setLoading
  } = useAuthStore()

  // Request nonce for wallet signature (step 1 of wallet auth flow)
  const requestNonce = useCallback(async (walletAddress: string) => {
    return simpleAuthService.requestNonce(walletAddress)
  }, [])

  // Login method (step 2 of wallet auth flow - after user signs nonce)
  const login = useCallback(async (credentials: WalletLoginCredentials): Promise<void> => {
    try {
      setLoading(true)

      // Call simpleAuthService login with wallet credentials
      const response = await simpleAuthService.login(credentials)

      // Update Zustand store with wallet-based user
      setUser({
        id: response.user.id,
        wallet_address: response.user.wallet_address,
        walletAddress: response.user.wallet_address,
        roles: response.user.roles as any,
        role: response.user.roles[0]?.toLowerCase() as any || 'viewer',
        permissions: response.user.permissions,
        authMethod: 'wallet'
      })
      setToken(response.access_token)
      setLoading(false)

      // Navigate to intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: any) {
      setLoading(false)
      throw error // Let component handle error display
    }
  }, [navigate, location.state, setUser, setToken, setLoading])

  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await simpleAuthService.logout()
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      // Clear store state regardless of API call success
      clearAuth()
      setLoading(false)

      // Navigate to login
      navigate('/login', { replace: true })
    }
  }, [navigate, clearAuth, setLoading])

  // Refresh token method (simplified)
  const refreshToken = useCallback(async (): Promise<string> => {
    // For simplified auth, we'll verify current token instead
    const isValid = await simpleAuthService.verifyToken()
    if (!isValid) {
      await logout()
      throw new Error('Token verification failed')
    }
    return token || ''
  }, [logout, token])

  // Update user method
  const updateUser = useCallback((userData: User): void => {
    setUser(userData)
  }, [setUser])

  // Role checking methods (supports both single role and roles array)
  const hasRole = useCallback((role: string): boolean => {
    if (user?.roles && Array.isArray(user.roles)) {
      return user.roles.some(r => r === role)
    }
    return user?.role === role
  }, [user])

  // Memoized role values to prevent infinite render loops
  const isAdminValue = useMemo(() => hasRole('admin'), [hasRole])
  const isOperatorValue = useMemo(() => hasRole('operator') || isAdminValue, [hasRole, isAdminValue])
  const isViewerValue = useMemo(() => hasRole('viewer') || isOperatorValue, [hasRole, isOperatorValue])

  // Note: No storage initialization - user must re-authenticate each session for security

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    requestNonce,
    login,
    logout,
    refreshToken,
    updateUser,
    hasRole,
    isAdmin: isAdminValue,
    isOperator: isOperatorValue,
    isViewer: isViewerValue,
  }
}

// Hook for authentication state in components that need quick access
export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    user,
    isLoggedIn: isAuthenticated && !isLoading,
    isGuest: !isAuthenticated && !isLoading,
  }
}

// Hook for role-based access control
export function usePermissions() {
  const { hasRole, isAdmin, isOperator, isViewer, user } = useAuth()

  return {
    canViewDashboard: isViewer,
    canManageUsers: isAdmin,
    canApproveTransactions: isOperator,
    canAccessReports: isViewer,
    canManageSettings: isAdmin,
    canViewSensitiveData: isOperator,
    hasRole,
    isAdmin,
    isOperator,
    isViewer,
    user,
  }
}

// Hook for authentication navigation
export function useAuthNavigation() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: { pathname: window.location.pathname } }
      })
    }
  }, [navigate, isAuthenticated, isLoading])

  const redirectToDashboard = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, isAuthenticated])

  const redirectToLogin = useCallback(() => {
    navigate('/login', { replace: true })
  }, [navigate])

  return {
    requireAuth,
    redirectToDashboard,
    redirectToLogin,
  }
}