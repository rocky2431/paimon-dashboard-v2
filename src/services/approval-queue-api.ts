import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/environment'
import type {
  ApprovalQueueResponse,
  ApprovalQueueFilters
} from '@/types/approval-queue'

/**
 * Approval Queue API Service
 */
export const approvalQueueApi = {
  /**
   * Get approval queue data
   */
  async getApprovalQueue(filters?: ApprovalQueueFilters): Promise<ApprovalQueueResponse> {
    const response = await apiClient.get(API_ENDPOINTS.APPROVALS.LIST, { params: filters })
    return response.data
  },

  /**
   * Get pending approvals
   */
  async getPendingApprovals(): Promise<ApprovalQueueResponse> {
    const response = await apiClient.get(API_ENDPOINTS.APPROVALS.PENDING)
    return response.data
  },

  /**
   * Quick approve an item
   * Backend uses /approvals/{id}/action with action type
   */
  async quickApprove(itemId: string, notes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.APPROVALS.ACTION(itemId), {
      action: 'approve',
      notes
    })
  },

  /**
   * Quick reject an item
   * Backend uses /approvals/{id}/action with action type
   */
  async quickReject(itemId: string, reason: string, notes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.APPROVALS.ACTION(itemId), {
      action: 'reject',
      reason,
      notes
    })
  },

  /**
   * Assign item to user
   * Note: Backend doesn't have assign endpoint - throws error
   */
  async assignItem(_itemId: string, _assigneeId: string): Promise<void> {
    throw new Error('Item assignment not supported by backend API')
  },

  /**
   * Cancel an approval ticket
   */
  async cancelApproval(itemId: string, notes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.APPROVALS.CANCEL(itemId), { notes })
  },

  /**
   * Get approval statistics
   */
  async getApprovalStats(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.APPROVALS.STATS)
    return response.data
  }
}
