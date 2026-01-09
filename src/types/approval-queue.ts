/**
 * Approval Queue Type Definitions
 */

export interface ApprovalQueueItem {
  id: string
  type: 'redemption' | 'rebalance' | 'risk_alert' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt: string
  slaDeadline: string
  assignee?: string
  metadata: Record<string, any>
}

export interface ApprovalQueueGroup {
  type: ApprovalQueueItem['type']
  label: string
  count: number
  items: ApprovalQueueItem[]
  slaOverdueCount: number
  avgProcessingTime: number // in hours
}

export interface ApprovalQueueStats {
  totalPending: number
  totalInReview: number
  overdueCount: number
  avgTimeToApprove: number // in hours
  todayProcessed: number
  weeklyProcessed: number
}

export interface ApprovalQueueFilters {
  type?: ApprovalQueueItem['type'][]
  priority?: ApprovalQueueItem['priority'][]
  assignee?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface ApprovalQueueResponse {
  groups: ApprovalQueueGroup[]
  stats: ApprovalQueueStats
  total: number
}