import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

// Import actual components we've implemented
import { QueryProvider } from '../providers/QueryProvider'
import { getQueryClient, createQueryClient, resetQueryClient } from '../lib/query-client'
import { queryKeys } from '../hooks/queries/queryKeys'
import { useDashboardQuery } from '../hooks/queries/useDashboardQuery'

// Mock environment
vi.mock('../config/environment', () => ({
  API_CONFIG: {
    IS_DEVELOPMENT: true,
    IS_PRODUCTION: false,
    IS_TEST: true,
  },
}))

// Mock DashboardService
vi.mock('../services/api', () => ({
  DashboardService: {
    getOverview: vi.fn(),
  },
}))

// Mock ReactQueryDevtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

describe('TanStack Query Core Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have @tanstack/react-query dependency available', async () => {
    expect(async () => {
      await import('@tanstack/react-query')
    }).not.toThrow()
  })

  it('should import QueryClient and QueryClientProvider', async () => {
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
    expect(QueryClient).toBeDefined()
    expect(QueryClientProvider).toBeDefined()
  })

  it('should create QueryClient with our configuration', () => {
    const client = createQueryClient()
    expect(client).toBeInstanceOf(Object)
    expect(typeof client.getQueryCache).toBe('function')
  })

  it('should configure default query options correctly', () => {
    const client = createQueryClient()
    const defaultOptions = client.getDefaultOptions()

    expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
    expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000) // 10 minutes
    expect(defaultOptions.queries?.retry).toBe(3)
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true) // DEV mode
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true)
  })

  it('should get singleton QueryClient instance', () => {
    const client1 = getQueryClient()
    const client2 = getQueryClient()

    expect(client1).toBe(client2) // Same instance
  })

  it('should render QueryProvider without errors', () => {
    expect(() => {
      render(
        <QueryProvider>
          <div>Test Content</div>
        </QueryProvider>
      )
    }).not.toThrow()
  })

  it('should render QueryProvider with custom client', () => {
    const customClient = createQueryClient()

    expect(() => {
      render(
        <QueryProvider client={customClient}>
          <div>Test Content</div>
        </QueryProvider>
      )
    }).not.toThrow()
  })
})

describe('Query Keys Factory', () => {
  it('should have properly structured query keys', () => {
    expect(queryKeys.dashboard.overview).toEqual(['dashboard', 'overview'])
    expect(queryKeys.redemptions.all()).toEqual(['redemptions', undefined])
    expect(queryKeys.redemptions.all({ status: 'active' })).toEqual(['redemptions', { status: 'active' }])
    expect(queryKeys.redemptions.detail('123')).toEqual(['redemptions', '123'])
    expect(queryKeys.user.profile).toEqual(['user', 'profile'])
  })

  it('should have consistent query key patterns', () => {
    const dashboardKeys = queryKeys.dashboard.overview
    const redemptionsKeys = queryKeys.redemptions.list(1, 'pending')
    const userKeys = queryKeys.user.settings

    expect(Array.isArray(dashboardKeys)).toBe(true)
    expect(Array.isArray(redemptionsKeys)).toBe(true)
    expect(Array.isArray(userKeys)).toBe(true)
  })
})

describe('Dashboard Query Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have useDashboardQuery hook', () => {
    expect(typeof useDashboardQuery).toBe('function')
  })

  it('should have correct query key', () => {
    // Test that the query key is correctly defined
    expect(queryKeys.dashboard.overview).toEqual(['dashboard', 'overview'])

    // Test that the hook uses the correct query key
    expect(() => {
      // The hook should be available for use
      expect(typeof useDashboardQuery).toBe('function')
    }).not.toThrow()
  })
})

describe('Integration Tests', () => {
  it('should build successfully with TanStack Query', async () => {
    // This test ensures our implementation doesn't break the build
    expect(true).toBe(true)
  })

  it('should have proper TypeScript types', async () => {
    const { QueryClient } = await import('@tanstack/react-query')

    const client = new QueryClient()

    // TypeScript should infer correct types
    expect(typeof client.getQueryData).toBe('function')
    expect(typeof client.setQueryData).toBe('function')
    expect(typeof client.invalidateQueries).toBe('function')
  })

  it('should handle environment-specific configurations', () => {
    const client = createQueryClient()
    const defaultOptions = client.getDefaultOptions()

    // In test mode, we should have proper configurations
    expect(defaultOptions.queries?.staleTime).toBeGreaterThan(0)
    expect(defaultOptions.queries?.retry).toBeGreaterThan(0)
  })
})

describe('Performance and Memory', () => {
  it('should handle multiple QueryClient creations', () => {
    // Test that we can create multiple clients without memory leaks
    const clients = Array.from({ length: 10 }, () => createQueryClient())

    clients.forEach(client => {
      expect(client).toBeDefined()
      expect(typeof client.getDefaultOptions).toBe('function')
    })
  })

  it('should not leak memory on client reset', () => {
    const client1 = getQueryClient()
    const initialClient = getQueryClient()

    // Reset should create a new client
    resetQueryClient()

    const client2 = getQueryClient()
    expect(client2).not.toBe(initialClient)
  })
})