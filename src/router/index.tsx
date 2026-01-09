import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Suspense } from 'react'
import MainLayout from '../components/layout/MainLayout'
import LoadingFallback from '../components/common/LoadingFallback'
import ErrorBoundary from '../components/common/ErrorBoundary'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RedemptionList = lazy(() => import('../pages/RedemptionList'))
const RedemptionDetail = lazy(() => import('../pages/RedemptionDetail'))
const RiskMonitoringPage = lazy(() => import('../pages/RiskMonitoringPage'))
const RebalancingPage = lazy(() => import('../pages/RebalancingPage'))
const ReportsCenterPage = lazy(() => import('../pages/ReportsCenterPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const NotFound = lazy(() => import('../pages/NotFound'))

const router = createBrowserRouter([
  // Login route - public
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <ErrorBoundary fallback={<div>Login Error</div>}>Failed to load login page</ErrorBoundary>,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <MainLayout />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary fallback={<div>Router Error</div>}>Something went wrong with routing</ErrorBoundary>,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'redemptions',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <RedemptionList />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <RedemptionDetail />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'risk',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RiskMonitoringPage />
          </Suspense>
        ),
      },
      {
        path: 'rebalance',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RebalancingPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReportsCenterPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
])

export default router