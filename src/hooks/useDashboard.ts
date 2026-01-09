import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { DASHBOARD_QUERY_KEYS, type DashboardStats } from '../types/dashboard'

// GC time in milliseconds (5 minutes for stats, 10 minutes for historical data)
const STATS_GC_TIME = 5 * 60 * 1000
const HISTORICAL_GC_TIME = 10 * 60 * 1000
const EVENTS_GC_TIME = 2 * 60 * 1000

// Stale time in milliseconds (1 minute for stats, 5 minutes for historical)
const STATS_STALE_TIME = 1 * 60 * 1000
const HISTORICAL_STALE_TIME = 5 * 60 * 1000
const EVENTS_STALE_TIME = 30 * 1000

/**
 * Hook for fetching complete dashboard data
 */
export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.all,
    queryFn: dashboardService.fetchDashboardData,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchOnWindowFocus: true,
    refetchInterval: STATS_STALE_TIME, // Auto-refresh every minute
  })
}

/**
 * Hook for fetching dashboard statistics only
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(),
    queryFn: dashboardService.fetchDashboardStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchOnWindowFocus: true,
    refetchInterval: STATS_STALE_TIME,
  })
}

/**
 * Hook for fetching liquidity distribution
 */
export function useLiquidityDistribution() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.liquidity(),
    queryFn: dashboardService.fetchLiquidityDistribution,
    staleTime: HISTORICAL_STALE_TIME,
    gcTime: HISTORICAL_GC_TIME,
    refetchOnWindowFocus: false, // Don't refetch on focus for historical data
  })
}

/**
 * Hook for fetching NAV history
 * @param days - Number of days of history to fetch (default: 30)
 */
export function useNAVHistory(days = 30) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.navHistory(days),
    queryFn: () => dashboardService.fetchNAVHistory(days),
    staleTime: HISTORICAL_STALE_TIME,
    gcTime: HISTORICAL_GC_TIME,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for fetching recent events
 */
export function useRecentEvents(limit = 10) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentEvents(limit),
    queryFn: () => dashboardService.fetchRecentEvents(limit),
    staleTime: EVENTS_STALE_TIME,
    gcTime: EVENTS_GC_TIME,
    refetchOnWindowFocus: true,
    refetchInterval: EVENTS_STALE_TIME,
  })
}

/**
 * Hook for real-time dashboard updates
 * This would typically be integrated with WebSocket
 */
export function useRealtimeDashboard() {
  const queryClient = useQueryClient()

  // Function to update dashboard stats in real-time
  const updateStats = (newStats: Partial<DashboardStats>) => {
    queryClient.setQueryData(
      DASHBOARD_QUERY_KEYS.stats(),
      (oldStats: DashboardStats | undefined) => {
        if (!oldStats) return newStats as DashboardStats
        return { ...oldStats, ...newStats }
      }
    )
  }

  // Function to add new event to the list
  const addRecentEvent = (newEvent: any) => {
    queryClient.setQueryData(
      DASHBOARD_QUERY_KEYS.recentEvents(),
      (oldEvents: any[] | undefined) => {
        if (!oldEvents) return [newEvent]
        return [newEvent, ...oldEvents.slice(0, 9)] // Keep only 10 most recent
      }
    )
  }

  // Function to invalidate specific queries
  const refreshData = (type: 'all' | 'stats' | 'liquidity' | 'nav' | 'events' = 'all') => {
    switch (type) {
      case 'all':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all })
        break
      case 'stats':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats() })
        break
      case 'liquidity':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.liquidity() })
        break
      case 'nav':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.navHistory() })
        break
      case 'events':
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.recentEvents() })
        break
    }
  }

  return {
    updateStats,
    addRecentEvent,
    refreshData
  }
}

/**
 * Hook for dashboard data loading and error states
 */
export function useDashboardState() {
  const statsQuery = useDashboardStats()
  const liquidityQuery = useLiquidityDistribution()
  const navQuery = useNAVHistory()
  const eventsQuery = useRecentEvents()

  const isLoading = statsQuery.isLoading ||
                   liquidityQuery.isLoading ||
                   navQuery.isLoading ||
                   eventsQuery.isLoading

  const isError = statsQuery.isError ||
                  liquidityQuery.isError ||
                  navQuery.isError ||
                  eventsQuery.isError

  const isInitialLoading = statsQuery.fetchStatus === 'fetching' ||
                           liquidityQuery.fetchStatus === 'fetching' ||
                           navQuery.fetchStatus === 'fetching' ||
                           eventsQuery.fetchStatus === 'fetching'

  const error = statsQuery.error ||
                liquidityQuery.error ||
                navQuery.error ||
                eventsQuery.error

  const refetchAll = () => {
    statsQuery.refetch()
    liquidityQuery.refetch()
    navQuery.refetch()
    eventsQuery.refetch()
  }

  return {
    isLoading,
    isError,
    isInitialLoading,
    error,
    refetchAll,
    statsQuery,
    liquidityQuery,
    navQuery,
    eventsQuery
  }
}