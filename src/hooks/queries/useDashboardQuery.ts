import { useQuery } from '@tanstack/react-query'
import { DashboardService } from '../../services/api'

export const DASHBOARD_QUERY_KEY = ['dashboard', 'overview']

/**
 * Hook for fetching dashboard overview data
 * @param options - Additional query options
 * @returns Query result with data, loading state, and error
 */
export const useDashboardQuery = (options?: {
  enabled?: boolean
  refetchInterval?: number
}) => {
  const { enabled = true, refetchInterval } = options || {}

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => DashboardService.getOverview(),
    enabled,
    refetchInterval,
    // Custom error handling
    meta: {
      errorMessage: 'Failed to load dashboard data',
    },
  })
}