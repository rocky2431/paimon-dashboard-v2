/**
 * Query Keys Factory - Centralized query key management
 *
 * This file provides type-safe query keys for all TanStack Query operations.
 * Using a centralized approach prevents typos and ensures consistency.
 */

export const queryKeys = {
  // Dashboard queries
  dashboard: {
    overview: ['dashboard', 'overview'],
    metrics: ['dashboard', 'metrics'],
  },

  // Redemption queries
  redemptions: {
    all: (filters?: Record<string, any>) => ['redemptions', filters],
    detail: (id: string) => ['redemptions', id],
    list: (page?: number, status?: string) => ['redemptions', { page, status }],
  },

  // Risk monitoring queries
  risk: {
    monitoring: ['risk', 'monitoring'],
    alerts: (filters?: Record<string, any>) => ['risk', 'alerts', filters],
    reports: (type?: string, timeframe?: string) => ['risk', 'reports', { type, timeframe }],
  },

  // Rebalancing queries
  rebalance: {
    status: ['rebalance', 'status'],
    plans: (active?: boolean) => ['rebalance', 'plans', { active }],
    history: (limit?: number) => ['rebalance', 'history', { limit }],
  },

  // Reports queries
  reports: {
    all: (filters?: Record<string, any>) => ['reports', filters],
    detail: (id: string) => ['reports', id],
    download: (id: string) => ['reports', id, 'download'],
  },

  // User queries
  user: {
    profile: ['user', 'profile'],
    settings: ['user', 'settings'],
    notifications: (unreadOnly?: boolean) => ['user', 'notifications', { unreadOnly }],
  },

  // Authentication queries
  auth: {
    current: ['auth', 'current'],
    permissions: ['auth', 'permissions'],
  },
} as const

export type QueryKey = any

/**
 * Helper function to create dynamic query keys
 */
export const createQueryKey = (baseKey: string[], params?: Record<string, any>) => {
  return params ? [...baseKey, params] : baseKey
}

/**
 * Helper function to check if a query key matches a pattern
 */
export const matchesQueryKey = (queryKey: unknown[], pattern: unknown[]): boolean => {
  if (queryKey.length < pattern.length) return false

  return pattern.every((key, index) => {
    if (typeof key === 'string' && key.startsWith(':')) {
      // Dynamic parameter, skip check
      return true
    }
    return queryKey[index] === key
  })
}