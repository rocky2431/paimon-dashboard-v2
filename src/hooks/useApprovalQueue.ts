import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalQueueApi } from '@/services/approval-queue-api'
import type { ApprovalQueueFilters } from '@/types/approval-queue'
import { toast } from 'sonner'

// Query keys
export const approvalQueueKeys = {
  all: ['approval-queue'] as const,
  lists: () => [...approvalQueueKeys.all, 'list'] as const,
  list: (filters?: ApprovalQueueFilters) => [...approvalQueueKeys.lists(), filters] as const
}

/**
 * Hook for fetching approval queue data
 */
export function useApprovalQueue(filters?: ApprovalQueueFilters) {
  return useQuery({
    queryKey: approvalQueueKeys.list(filters),
    queryFn: () => approvalQueueApi.getApprovalQueue(filters),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  })
}

/**
 * Hook for quick approve action
 */
export function useQuickApprove() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, notes }: { itemId: string; notes?: string }) =>
      approvalQueueApi.quickApprove(itemId, notes),
    onSuccess: () => {
      toast.success('Item approved successfully')
      queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
    },
    onError: (error) => {
      toast.error('Failed to approve item')
      console.error('Quick approve error:', error)
    }
  })
}

/**
 * Hook for quick reject action
 */
export function useQuickReject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, reason, notes }: { itemId: string; reason: string; notes?: string }) =>
      approvalQueueApi.quickReject(itemId, reason, notes),
    onSuccess: () => {
      toast.success('Item rejected successfully')
      queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
    },
    onError: (error) => {
      toast.error('Failed to reject item')
      console.error('Quick reject error:', error)
    }
  })
}

/**
 * Hook for assigning items
 */
export function useAssignItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, assigneeId }: { itemId: string; assigneeId: string }) =>
      approvalQueueApi.assignItem(itemId, assigneeId),
    onSuccess: () => {
      toast.success('Item assigned successfully')
      queryClient.invalidateQueries({ queryKey: approvalQueueKeys.lists() })
    },
    onError: (error) => {
      toast.error('Failed to assign item')
      console.error('Assign item error:', error)
    }
  })
}
