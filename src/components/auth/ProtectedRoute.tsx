import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string[]
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requireRole = [],
  fallbackPath = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Simple check: if authenticated and user exists, no need for complex validation
    // Token validation and refresh are handled by API client interceptors
    setIsCheckingAuth(false)
  }, [isAuthenticated])

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading...</span>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    )
  }

  // Check role requirements
  if (requireRole.length > 0 && user && !requireRole.includes(user.role || '')) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          reason: 'insufficient_permissions',
          requiredRoles: requireRole,
          userRole: user.role || 'unknown'
        }}
        replace
      />
    )
  }

  // User is authenticated and has required permissions
  return <>{children}</>
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for route protection
export function useProtectedRoute(requireRole: string[] = []) {
  const location = useLocation()
  const { isAuthenticated, user, isLoading } = useAuth()

  const isAuthorized = React.useMemo(() => {
    if (!isAuthenticated || !user) return false
    if (requireRole.length === 0) return true
    return requireRole.includes(user.role || '')
  }, [isAuthenticated, user, requireRole])

  const needsAuth = !isAuthenticated
  const needsRole = isAuthenticated && user && requireRole.length > 0 && !requireRole.includes(user.role || '')

  return {
    isAuthorized,
    needsAuth,
    needsRole,
    isLoading,
    user,
    location,
    requireRole,
  }
}

// Default loading component
export const DefaultAuthLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-lg text-gray-600">Authenticating...</p>
    </div>
  </div>
)

// Unauthorized page component
export const UnauthorizedPage: React.FC<{
  requiredRoles?: string[]
  userRole?: string
}> = ({ requiredRoles = [], userRole }) => {
  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>

        {requiredRoles.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Required roles:</strong> {requiredRoles.join(', ')}
            </p>
            {userRole && (
              <p className="text-sm text-gray-600">
                <strong>Your role:</strong> {userRole}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute