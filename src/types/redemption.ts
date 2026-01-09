/**
 * Redemption Management Type Definitions
 */

export interface Redemption {
  id: string
  userId: string
  amount: number
  currency: string
  status: RedemptionStatus
  channel: RedemptionChannel
  requestDate: string
  processedDate?: string
  completedDate?: string
  fee?: number
  netAmount?: number
  walletAddress?: string
  transactionHash?: string
  reason?: string
  notes?: string
  metadata?: Record<string, any>
}

export const RedemptionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

export type RedemptionStatus = typeof RedemptionStatus[keyof typeof RedemptionStatus]

export const RedemptionChannel = {
  WALLET: 'wallet',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTO: 'crypto',
  INTERNAL: 'internal'
} as const

export type RedemptionChannel = typeof RedemptionChannel[keyof typeof RedemptionChannel]

export interface RedemptionFilters {
  status?: RedemptionStatus[]
  channel?: RedemptionChannel[]
  dateRange?: {
    start: string
    end: string
  }
  userId?: string
  amountRange?: {
    min: number
    max: number
  }
  search?: string
}

export interface RedemptionListResponse {
  redemptions: Redemption[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RedemptionStats {
  totalRequests: number
  pendingRequests: number
  processingRequests: number
  completedRequests: number
  rejectedRequests: number
  totalAmount: number
  pendingAmount: number
  completedAmount: number
  averageProcessingTime: number // in hours
}