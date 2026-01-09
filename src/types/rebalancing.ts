/**
 * Rebalancing Types
 *
 * Type definitions for portfolio rebalancing data structures and API responses
 */

// Asset allocation types
export interface AssetAllocation {
  id: string
  name: string
  symbol: string
  currentValue: number
  currentWeight: number
  targetWeight: number
  deviation: number
  deviationPercent: number
  action?: 'buy' | 'sell' | 'hold'
  tier?: 'T0' | 'T1' | 'T2'
}

// Deviation summary
export interface DeviationSummary {
  totalDeviation: number
  maxDeviation: number
  assetsOutOfBalance: number
  totalAssets: number
  status: 'balanced' | 'minor_deviation' | 'needs_rebalance' | 'critical'
  lastChecked: string
}

// Rebalance status
export interface RebalanceStatus {
  id: string
  status: 'idle' | 'evaluating' | 'pending_approval' | 'executing' | 'completed' | 'failed'
  progress?: number
  message?: string
  startedAt?: string
  completedAt?: string
  executedBy?: string
}

// Rebalance history item
export interface RebalanceHistoryItem {
  id: string
  type: 'manual' | 'automatic' | 'scheduled'
  trigger: string
  status: 'completed' | 'failed' | 'cancelled'
  executedAt: string
  executedBy?: string
  trades: number
  totalVolume: number
  gasUsed?: number
  notes?: string
}

// Trigger configuration
export interface RebalanceTrigger {
  id: string
  name: string
  type: 'threshold' | 'schedule' | 'manual'
  enabled: boolean
  threshold?: number
  schedule?: string
  lastTriggered?: string
  nextScheduled?: string
}

// Rebalancing dashboard data
export interface RebalancingDashboard {
  deviation: DeviationSummary
  allocations: AssetAllocation[]
  currentStatus: RebalanceStatus
  lastRebalance?: RebalanceHistoryItem
  nextScheduled?: string
  triggers: RebalanceTrigger[]
}

// Rebalance preview (before execution)
export interface RebalancePreview {
  id: string
  createdAt: string
  expiresAt: string
  allocations: {
    before: AssetAllocation[]
    after: AssetAllocation[]
  }
  trades: RebalanceTrade[]
  estimatedGas: number
  estimatedSlippage: number
  impact: {
    portfolioValue: number
    expectedDeviation: number
  }
}

// Individual trade in rebalance plan
export interface RebalanceTrade {
  id: string
  fromAsset: string
  toAsset: string
  fromAmount: number
  toAmount: number
  estimatedPrice: number
  slippage: number
  route?: string[]
}

// Rebalancing stats
export interface RebalancingStats {
  totalRebalances: number
  averageFrequency: number // days
  averageDeviation: number
  successRate: number
  lastMonthRebalances: number
  totalVolumeTraded: number
}

// API response types
export interface RebalancingDeviationResponse {
  success: boolean
  data: {
    summary: DeviationSummary
    allocations: AssetAllocation[]
  }
  timestamp: string
}

export interface RebalancingStatsResponse {
  success: boolean
  data: RebalancingStats
  timestamp: string
}

export interface RebalancingHistoryResponse {
  success: boolean
  data: {
    items: RebalanceHistoryItem[]
    total: number
    page: number
    pageSize: number
  }
  timestamp: string
}

// Query keys for TanStack Query
export const REBALANCING_QUERY_KEYS = {
  all: ['rebalancing'] as const,
  deviation: () => [...REBALANCING_QUERY_KEYS.all, 'deviation'] as const,
  stats: () => [...REBALANCING_QUERY_KEYS.all, 'stats'] as const,
  history: (page?: number) => [...REBALANCING_QUERY_KEYS.all, 'history', page] as const,
  preview: (id?: string) => [...REBALANCING_QUERY_KEYS.all, 'preview', id] as const,
  triggers: () => [...REBALANCING_QUERY_KEYS.all, 'triggers'] as const,
} as const
