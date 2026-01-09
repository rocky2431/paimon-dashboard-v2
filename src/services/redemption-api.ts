import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/environment'
import type {
  Redemption,
  RedemptionFilters,
  RedemptionListResponse,
  RedemptionStats
} from '@/types/redemption'

/**
 * Redemption API service
 */
export const redemptionApi = {
  /**
   * Get redemption list with filters
   */
  async getRedemptions(filters: RedemptionFilters = {}): Promise<RedemptionListResponse> {
    const params = new URLSearchParams()

    // Add filter parameters
    if (filters.status?.length) {
      params.append('status', filters.status.join(','))
    }
    if (filters.channel?.length) {
      params.append('channel', filters.channel.join(','))
    }
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start)
      params.append('endDate', filters.dateRange.end)
    }
    if (filters.userId) {
      params.append('userId', filters.userId)
    }
    if (filters.amountRange) {
      params.append('minAmount', filters.amountRange.min.toString())
      params.append('maxAmount', filters.amountRange.max.toString())
    }
    if (filters.search) {
      params.append('search', filters.search)
    }

    // Add pagination parameters
    params.append('page', '1')
    params.append('pageSize', '50')

    const response = await apiClient.get(`${API_ENDPOINTS.REDEMPTIONS.LIST}?${params.toString()}`)
    return response.data
  },

  /**
   * Get pending approvals for redemptions
   */
  async getPendingApprovals(): Promise<RedemptionListResponse> {
    const response = await apiClient.get(API_ENDPOINTS.REDEMPTIONS.PENDING_APPROVALS)
    return response.data
  },

  /**
   * Get redemption statistics
   */
  async getRedemptionStats(): Promise<RedemptionStats> {
    const response = await apiClient.get(API_ENDPOINTS.REDEMPTIONS.STATS)
    return response.data
  },

  /**
   * Get single redemption by ID
   */
  async getRedemptionById(id: string): Promise<Redemption> {
    const response = await apiClient.get(API_ENDPOINTS.REDEMPTIONS.DETAIL(id))
    return response.data
  },

  /**
   * Approve redemption
   * POST /redemptions/{id}/approve with optional comment
   */
  async approveRedemption(id: string, comment?: string): Promise<Redemption> {
    const response = await apiClient.post(
      API_ENDPOINTS.REDEMPTIONS.APPROVE(id),
      comment ? { comment } : {}
    )
    return response.data
  },

  /**
   * Reject redemption
   * POST /redemptions/{id}/reject with required reason
   */
  async rejectRedemption(id: string, reason: string): Promise<Redemption> {
    const response = await apiClient.post(API_ENDPOINTS.REDEMPTIONS.REJECT(id), { reason })
    return response.data
  },

  /**
   * Settle redemption
   * POST /redemptions/{id}/settle with no parameters
   */
  async processRedemption(id: string): Promise<Redemption> {
    const response = await apiClient.post(API_ENDPOINTS.REDEMPTIONS.SETTLE(id), {})
    return response.data
  },

  /**
   * Bulk redemption actions
   * Note: Backend doesn't have bulk endpoint, using sequential calls
   */
  async bulkRedemptionAction(
    ids: string[],
    action: 'approve' | 'reject' | 'process',
    data?: { comment?: string; reason?: string }
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    // Sequential calls since backend doesn't support bulk
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        if (action === 'approve') {
          return apiClient.post(
            API_ENDPOINTS.REDEMPTIONS.APPROVE(id),
            data?.comment ? { comment: data.comment } : {}
          )
        } else if (action === 'reject') {
          return apiClient.post(
            API_ENDPOINTS.REDEMPTIONS.REJECT(id),
            { reason: data?.reason || 'Bulk rejection' }
          )
        } else {
          return apiClient.post(API_ENDPOINTS.REDEMPTIONS.SETTLE(id), {})
        }
      })
    )

    const success = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error')

    return { success, failed, errors: errors.length > 0 ? errors : undefined }
  },

  /**
   * Export redemptions data
   * Uses reports API for export functionality
   */
  async exportRedemptions(
    filters: RedemptionFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    // Generate report via reports API
    const reportResponse = await apiClient.post(API_ENDPOINTS.REPORTS.GENERATE, {
      report_type: 'redemptions',
      format,
      filters
    })

    // Download the generated report
    const downloadResponse = await apiClient.get(
      API_ENDPOINTS.REPORTS.DOWNLOAD(reportResponse.data.report_id),
      { responseType: 'blob' }
    )
    return downloadResponse.data
  }
}
