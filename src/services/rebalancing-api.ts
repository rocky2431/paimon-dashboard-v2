/**
 * Rebalancing API Service
 *
 * API client and React Query hooks for rebalancing operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'
import {
  REBALANCING_QUERY_KEYS,
  type AssetAllocation,
  type DeviationSummary,
  type RebalancingStats,
  type RebalanceHistoryItem,
  type RebalanceTrigger,
  type RebalancePreview,
} from '../types/rebalancing'

// Mock data for development
const mockDeviationData: { summary: DeviationSummary; allocations: AssetAllocation[] } = {
  summary: {
    totalDeviation: 8.5,
    maxDeviation: 4.2,
    assetsOutOfBalance: 3,
    totalAssets: 8,
    status: 'minor_deviation',
    lastChecked: new Date().toISOString(),
  },
  allocations: [
    {
      id: '1',
      name: 'USDC',
      symbol: 'USDC',
      currentValue: 2500000,
      currentWeight: 25.0,
      targetWeight: 20.0,
      deviation: 5.0,
      deviationPercent: 25.0,
      action: 'sell',
      tier: 'T0',
    },
    {
      id: '2',
      name: 'USDT',
      symbol: 'USDT',
      currentValue: 1800000,
      currentWeight: 18.0,
      targetWeight: 20.0,
      deviation: -2.0,
      deviationPercent: -10.0,
      action: 'buy',
      tier: 'T0',
    },
    {
      id: '3',
      name: 'DAI',
      symbol: 'DAI',
      currentValue: 1200000,
      currentWeight: 12.0,
      targetWeight: 15.0,
      deviation: -3.0,
      deviationPercent: -20.0,
      action: 'buy',
      tier: 'T1',
    },
    {
      id: '4',
      name: 'Aave USDC',
      symbol: 'aUSDC',
      currentValue: 1500000,
      currentWeight: 15.0,
      targetWeight: 15.0,
      deviation: 0.0,
      deviationPercent: 0.0,
      action: 'hold',
      tier: 'T1',
    },
    {
      id: '5',
      name: 'Compound USDC',
      symbol: 'cUSDC',
      currentValue: 1000000,
      currentWeight: 10.0,
      targetWeight: 10.0,
      deviation: 0.0,
      deviationPercent: 0.0,
      action: 'hold',
      tier: 'T1',
    },
    {
      id: '6',
      name: 'ETH',
      symbol: 'ETH',
      currentValue: 800000,
      currentWeight: 8.0,
      targetWeight: 8.0,
      deviation: 0.0,
      deviationPercent: 0.0,
      action: 'hold',
      tier: 'T2',
    },
    {
      id: '7',
      name: 'stETH',
      symbol: 'stETH',
      currentValue: 700000,
      currentWeight: 7.0,
      targetWeight: 7.0,
      deviation: 0.0,
      deviationPercent: 0.0,
      action: 'hold',
      tier: 'T2',
    },
    {
      id: '8',
      name: 'wBTC',
      symbol: 'wBTC',
      currentValue: 500000,
      currentWeight: 5.0,
      targetWeight: 5.0,
      deviation: 0.0,
      deviationPercent: 0.0,
      action: 'hold',
      tier: 'T2',
    },
  ],
}

const mockStats: RebalancingStats = {
  totalRebalances: 24,
  averageFrequency: 7.5,
  averageDeviation: 3.2,
  successRate: 95.8,
  lastMonthRebalances: 4,
  totalVolumeTraded: 15800000,
}

const mockHistory: RebalanceHistoryItem[] = [
  {
    id: '1',
    type: 'automatic',
    trigger: 'Threshold exceeded (5%)',
    status: 'completed',
    executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    executedBy: 'System',
    trades: 3,
    totalVolume: 450000,
    gasUsed: 0.025,
  },
  {
    id: '2',
    type: 'scheduled',
    trigger: 'Weekly schedule',
    status: 'completed',
    executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    executedBy: 'System',
    trades: 5,
    totalVolume: 680000,
    gasUsed: 0.042,
  },
  {
    id: '3',
    type: 'manual',
    trigger: 'Manual trigger by admin',
    status: 'completed',
    executedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    executedBy: 'admin@paimon.fund',
    trades: 4,
    totalVolume: 520000,
    gasUsed: 0.035,
    notes: 'Pre-market adjustment',
  },
]

const mockTriggers: RebalanceTrigger[] = [
  {
    id: '1',
    name: 'Deviation Threshold',
    type: 'threshold',
    enabled: true,
    threshold: 5.0,
    lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Weekly Schedule',
    type: 'schedule',
    enabled: true,
    schedule: '0 0 * * 0', // Every Sunday at midnight
    lastTriggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Critical Deviation',
    type: 'threshold',
    enabled: true,
    threshold: 10.0,
  },
]

// API functions
async function fetchDeviation() {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockDeviationData
  }
  const response = await apiClient.get(API_ENDPOINTS.REBALANCING.DEVIATION)
  return response.data.data
}

async function fetchStats() {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockStats
  }
  const response = await apiClient.get(API_ENDPOINTS.REBALANCING.STATS)
  return response.data.data
}

async function fetchHistory(page = 1, pageSize = 10) {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      items: mockHistory,
      total: mockHistory.length,
      page,
      pageSize,
    }
  }
  const response = await apiClient.get(API_ENDPOINTS.REBALANCING.HISTORY_TRIGGERS, {
    params: { page, pageSize },
  })
  return response.data.data
}

async function fetchTriggers() {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTriggers
  }
  const response = await apiClient.get(API_ENDPOINTS.REBALANCING.CONFIG_TRIGGERS)
  return response.data.data
}

async function triggerManualRebalance(): Promise<RebalancePreview> {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: `preview-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      allocations: {
        before: mockDeviationData.allocations,
        after: mockDeviationData.allocations.map(a => ({
          ...a,
          currentWeight: a.targetWeight,
          deviation: 0,
          deviationPercent: 0,
          action: 'hold' as const,
        })),
      },
      trades: [
        {
          id: '1',
          fromAsset: 'USDC',
          toAsset: 'DAI',
          fromAmount: 300000,
          toAmount: 299700,
          estimatedPrice: 0.999,
          slippage: 0.1,
        },
        {
          id: '2',
          fromAsset: 'USDC',
          toAsset: 'USDT',
          fromAmount: 200000,
          toAmount: 199800,
          estimatedPrice: 0.999,
          slippage: 0.1,
        },
      ],
      estimatedGas: 0.045,
      estimatedSlippage: 0.1,
      impact: {
        portfolioValue: 10000000,
        expectedDeviation: 0.5,
      },
    }
  }
  const response = await apiClient.post(API_ENDPOINTS.REBALANCING.TRIGGER_MANUAL)
  return response.data.data
}

async function evaluateRebalance() {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      needsRebalance: true,
      reason: 'USDC allocation exceeds target by 5%',
      recommendation: 'Sell USDC, Buy DAI and USDT',
    }
  }
  const response = await apiClient.post(API_ENDPOINTS.REBALANCING.TRIGGER_EVALUATE)
  return response.data.data
}

interface ExecuteRebalanceResult {
  success: boolean
  txHash: string
  executedTrades: number
  totalVolume: number
  gasUsed: number
}

async function executeRebalance(previewId: string): Promise<ExecuteRebalanceResult> {
  if (import.meta.env.DEV) {
    // Simulate execution with progress
    await new Promise(resolve => setTimeout(resolve, 2000))
    return {
      success: true,
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      executedTrades: 2,
      totalVolume: 500000,
      gasUsed: 0.042,
    }
  }
  const response = await apiClient.post(API_ENDPOINTS.REBALANCING.EXECUTE, { previewId })
  return response.data.data
}

// React Query hooks
export function useRebalancingDeviation() {
  return useQuery({
    queryKey: REBALANCING_QUERY_KEYS.deviation(),
    queryFn: fetchDeviation,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

export function useRebalancingStats() {
  return useQuery({
    queryKey: REBALANCING_QUERY_KEYS.stats(),
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRebalancingHistory(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: REBALANCING_QUERY_KEYS.history(page),
    queryFn: () => fetchHistory(page, pageSize),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useRebalancingTriggers() {
  return useQuery({
    queryKey: REBALANCING_QUERY_KEYS.triggers(),
    queryFn: fetchTriggers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTriggerManualRebalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerManualRebalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REBALANCING_QUERY_KEYS.deviation() })
      queryClient.invalidateQueries({ queryKey: REBALANCING_QUERY_KEYS.history() })
    },
  })
}

export function useEvaluateRebalance() {
  return useMutation({
    mutationFn: evaluateRebalance,
  })
}

export function useExecuteRebalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: executeRebalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REBALANCING_QUERY_KEYS.deviation() })
      queryClient.invalidateQueries({ queryKey: REBALANCING_QUERY_KEYS.history() })
      queryClient.invalidateQueries({ queryKey: REBALANCING_QUERY_KEYS.stats() })
    },
  })
}
