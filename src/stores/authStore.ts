import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types (per backend API - wallet-based authentication)
export interface User {
  id?: string
  email?: string
  name?: string
  avatar?: string
  role?: 'admin' | 'operator' | 'viewer'
  roles?: ('admin' | 'operator' | 'viewer')[]
  permissions?: string[]
  walletAddress?: string
  wallet_address?: string // Backend API format
  authMethod?: 'jwt' | 'wallet' | 'dual'
}

export interface AuthState {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  theme: 'light' | 'dark'

  // Actions
  login: (user: User, token: string, refreshToken?: string) => Promise<void>
  logout: () => void
  refreshTokens: (newToken: string, newRefreshToken?: string) => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearAuth: () => void
}

// Auth Store with persistence
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        theme: 'light',

      // Actions
      login: async (user: User, token: string, refreshToken?: string) => {
        set(
          {
            isLoading: true,
            error: null,
          },
          false,
          'auth/login:start'
        )

        try {
          // Store tokens in memory only (no localStorage for security)
          set(
            {
              user,
              token,
              refreshToken: refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            false,
            'auth/login:success'
          )
        } catch (error) {
          set(
            {
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            },
            false,
            'auth/login:error'
          )
        }
      },

      logout: () => {
        localStorage.removeItem('paimon-auth')
        set(
          {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            theme: 'light',
          },
          false,
          'auth/logout'
        )
      },

      refreshTokens: async (newToken: string, newRefreshToken?: string) => {
        const currentState = get()

        if (!currentState.isAuthenticated) {
          return
        }

        set(
          {
            token: newToken,
            refreshToken: newRefreshToken || currentState.refreshToken,
            error: null,
          },
          false,
          'auth/refreshTokens'
        )
      },

      setUser: (user: User | null) => {
        set(
          {
            user,
            isAuthenticated: !!user,
          },
          false,
          'auth/setUser'
        )
      },

      setLoading: (loading: boolean) => {
        set(
          {
            isLoading: loading,
          },
          false,
          'auth/setLoading'
        )
      },

      setError: (error: string | null) => {
        set(
          {
            error,
            isLoading: false,
          },
          false,
          'auth/setError'
        )
      },

      clearError: () => {
        set(
          {
            error: null,
          },
          false,
          'auth/clearError'
        )
      },

      setToken: (token: string | null) => {
        set(
          {
            token,
            isAuthenticated: !!token,
          },
          false,
          'auth/setToken'
        )
      },

      clearAuth: () => {
        localStorage.removeItem('paimon-auth')
        set(
          {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            theme: 'light',
          },
          false,
          'auth/clearAuth'
        )
      },
    }),
    {
      name: 'paimon-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  ),
  {
    name: 'auth-store',
    enabled: import.meta.env.DEV,
  }
  )
)

// Selectors for optimized re-renders
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthToken = () => useAuthStore((state) => state.token)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

// Combined selectors
export const useAuthState = () =>
  useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
  }))

export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    refreshTokens: state.refreshTokens,
    setUser: state.setUser,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }))