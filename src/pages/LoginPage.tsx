import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import MainLayout from '../components/layout/MainLayout'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const from = location.state?.from?.pathname || searchParams.get('redirect') || '/dashboard'
  const message = searchParams.get('message')

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleLoginSuccess = () => {
    // Navigation is handled by the LoginForm via useAuth hook
  }

  const handleLoginError = (error: Error) => {
    // Error is already handled by the LoginForm component
    console.error('Login failed:', error)
  }

  return (
    <MainLayout hideNavigation={true}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to Paimon
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Admin Dashboard
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default LoginPage