import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { redemptionApi } from '@/services/redemption-api'
import type { RedemptionFilters } from '@/types/redemption'

// Query keys for redemption data
export const REDEMPTION_QUERY_KEYS = {
  all: ['redemptions'] as const,
  lists: () => [...REDEMPTION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: RedemptionFilters) => [...REDEMPTION_QUERY_KEYS.lists(), filters] as const,
  details: () => [...REDEMPTION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REDEMPTION_QUERY_KEYS.details(), id] as const,
  stats: () => [...REDEMPTION_QUERY_KEYS.all, 'stats'] as const,
}

/**
 * Hook for fetching redemption list with filters
 */
export function useRedemptionList(filters: RedemptionFilters = {}) {
  return useQuery({
    queryKey: REDEMPTION_QUERY_KEYS.list(filters),
    queryFn: () => redemptionApi.getRedemptions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching redemption statistics
 */
export function useRedemptionStats() {
  return useQuery({
    queryKey: REDEMPTION_QUERY_KEYS.stats(),
    queryFn: () => redemptionApi.getRedemptionStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching single redemption details
 */
export function useRedemptionDetail(id: string) {
  return useQuery({
    queryKey: REDEMPTION_QUERY_KEYS.detail(id),
    queryFn: () => redemptionApi.getRedemptionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for approving redemption
 * POST /redemptions/{id}/approve with optional comment
 */
export function useApproveRedemption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      comment
    }: {
      id: string
      comment?: string
    }) => redemptionApi.approveRedemption(id, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.stats() })
    },
  })
}

/**
 * Hook for rejecting redemption
 * POST /redemptions/{id}/reject with required reason
 */
export function useRejectRedemption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      reason
    }: {
      id: string
      reason: string
    }) => redemptionApi.rejectRedemption(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.stats() })
    },
  })
}

/**
 * Hook for settling/processing redemption
 * POST /redemptions/{id}/settle with no parameters
 */
export function useProcessRedemption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => redemptionApi.processRedemption(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.stats() })
    },
  })
}

/**
 * Hook for bulk operations on redemptions
 */
export function useBulkRedemptionAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ids,
      action,
      data
    }: {
      ids: string[]
      action: 'approve' | 'reject' | 'process'
      data?: any
    }) => redemptionApi.bulkRedemptionAction(ids, action, data),
    onSuccess: () => {
      // Invalidate all redemption queries
      queryClient.invalidateQueries({ queryKey: REDEMPTION_QUERY_KEYS.all })
    },
  })
}