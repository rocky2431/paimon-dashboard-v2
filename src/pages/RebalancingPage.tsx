/**
 * RebalancingPage
 *
 * Portfolio rebalancing status view with deviation charts,
 * last rebalance info, and next scheduled rebalance display
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Settings,
  History,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DeviationChart, DeviationBarChart } from '@/components/charts'
import { RebalancePlanCard, ExecutionModal, type ExecutionStatus } from '@/components/rebalance'
import {
  useRebalancingDeviation,
  useRebalancingStats,
  useRebalancingHistory,
  useRebalancingTriggers,
  useEvaluateRebalance,
  useTriggerManualRebalance,
  useExecuteRebalance,
} from '@/services/rebalancing-api'
import type { AssetAllocation, DeviationSummary, RebalanceHistoryItem, RebalanceTrigger, RebalancePreview } from '@/types/rebalancing'

// Status badge component
function StatusBadge({ status }: { status: DeviationSummary['status'] }) {
  const config = {
    balanced: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
    minor_deviation: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', icon: AlertTriangle },
    needs_rebalance: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: AlertTriangle },
    critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertTriangle },
  }[status]

  const Icon = config.icon
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <Badge className={cn('flex items-center gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

// Action badge for allocation table
function ActionBadge({ action }: { action?: 'buy' | 'sell' | 'hold' }) {
  if (!action || action === 'hold') {
    return <Badge variant="secondary" className="text-xs">Hold</Badge>
  }

  return (
    <Badge
      className={cn(
        'text-xs',
        action === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      )}
    >
      {action.toUpperCase()}
    </Badge>
  )
}

// Stat card component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{value}</span>
              {trend && (
                <>
                  {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                  {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-400" />}
                </>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Allocation table component
function AllocationTable({
  allocations,
  onAssetClick,
}: {
  allocations: AssetAllocation[]
  onAssetClick?: (asset: AssetAllocation) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">Current</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Deviation</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allocations.map(asset => (
          <TableRow
            key={asset.id}
            className={cn('cursor-pointer hover:bg-muted/50', onAssetClick && 'cursor-pointer')}
            onClick={() => onAssetClick?.(asset)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-semibold">
                  {asset.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">{asset.tier}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono">
              ${(asset.currentValue / 1000000).toFixed(2)}M
            </TableCell>
            <TableCell className="text-right font-mono">
              {asset.currentWeight.toFixed(1)}%
            </TableCell>
            <TableCell className="text-right font-mono text-muted-foreground">
              {asset.targetWeight.toFixed(1)}%
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  'font-mono font-medium',
                  asset.deviation > 0 ? 'text-orange-600' :
                    asset.deviation < 0 ? 'text-blue-600' : 'text-green-600'
                )}
              >
                {asset.deviation > 0 ? '+' : ''}{asset.deviation.toFixed(1)}%
              </span>
            </TableCell>
            <TableCell className="text-center">
              <ActionBadge action={asset.action} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// History table component
function HistoryTable({ items }: { items: RebalanceHistoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead className="text-right">Trades</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-mono text-sm">
              {new Date(item.executedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
              {item.trigger}
            </TableCell>
            <TableCell className="text-right font-mono">{item.trades}</TableCell>
            <TableCell className="text-right font-mono">
              ${(item.totalVolume / 1000000).toFixed(2)}M
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  'text-xs',
                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                )}
              >
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function RebalancingPage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetAllocation | null>(null)
  const [rebalancePreview, setRebalancePreview] = useState<RebalancePreview | null>(null)
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  })

  // Data fetching
  const { data: deviationData, isLoading: deviationLoading, refetch: refetchDeviation } = useRebalancingDeviation()
  const { data: stats, isLoading: statsLoading } = useRebalancingStats()
  const { data: historyData, isLoading: historyLoading } = useRebalancingHistory()
  const { data: triggers } = useRebalancingTriggers()
  const evaluateMutation = useEvaluateRebalance()
  const triggerMutation = useTriggerManualRebalance()
  const executeMutation = useExecuteRebalance()

  const handleRefresh = () => {
    refetchDeviation()
    toast.success('Rebalancing data refreshed')
  }

  const handleEvaluate = async () => {
    try {
      const result = await evaluateMutation.mutateAsync()
      if (result.needsRebalance) {
        toast.warning(`Rebalance recommended: ${result.reason}`)
      } else {
        toast.success('Portfolio is within tolerance')
      }
    } catch {
      toast.error('Failed to evaluate rebalancing need')
    }
  }

  const handleTriggerRebalance = async () => {
    try {
      const preview = await triggerMutation.mutateAsync()
      setRebalancePreview(preview)
      toast.success('Rebalance plan generated')
    } catch {
      toast.error('Failed to generate rebalance plan')
    }
  }

  const handleExecuteRebalance = () => {
    if (rebalancePreview) {
      setShowExecutionModal(true)
    }
  }

  const handleConfirmExecution = async () => {
    if (!rebalancePreview) return

    try {
      setExecutionStatus({ stage: 'signing', progress: 0, message: 'Waiting for wallet signature...' })

      // Simulate signing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setExecutionStatus({ stage: 'executing', progress: 25, message: 'Executing trades...' })

      // Execute the rebalance
      const result = await executeMutation.mutateAsync(rebalancePreview.id)

      // Simulate progress
      setExecutionStatus({ stage: 'executing', progress: 75, message: 'Finalizing...' })
      await new Promise(resolve => setTimeout(resolve, 500))

      if (result.success) {
        setExecutionStatus({
          stage: 'completed',
          progress: 100,
          message: 'Rebalance completed successfully',
          txHash: result.txHash,
        })
        toast.success('Rebalance executed successfully!')
        setRebalancePreview(null)
      } else {
        throw new Error('Execution failed')
      }
    } catch (error) {
      setExecutionStatus({
        stage: 'failed',
        progress: 0,
        message: 'Execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      toast.error('Rebalance execution failed')
    }
  }

  const handleCancelPreview = () => {
    setRebalancePreview(null)
    toast.info('Rebalance plan cancelled')
  }

  const handleAssetClick = (asset: AssetAllocation) => {
    setSelectedAsset(asset)
    toast.info(`Selected ${asset.name}: ${asset.deviation > 0 ? '+' : ''}${asset.deviation.toFixed(1)}% deviation`)
  }

  // Find next scheduled rebalance
  const nextScheduled = triggers?.find((t: RebalanceTrigger) => t.type === 'schedule' && t.nextScheduled)?.nextScheduled
  const lastRebalance = historyData?.items[0]

  // Loading state
  if (deviationLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading rebalancing data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rebalancing Operations</h1>
          <p className="text-muted-foreground">
            Monitor portfolio allocation and trigger rebalancing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEvaluate}
            disabled={evaluateMutation.isPending}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Evaluate
          </Button>
          <Button
            size="sm"
            onClick={handleTriggerRebalance}
            disabled={triggerMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            {triggerMutation.isPending ? 'Generating...' : 'Trigger Rebalance'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Deviation"
          value={`${deviationData?.summary.totalDeviation.toFixed(1)}%`}
          description={`Max: ${deviationData?.summary.maxDeviation.toFixed(1)}%`}
          icon={BarChart3}
          trend={deviationData?.summary.totalDeviation && deviationData.summary.totalDeviation > 5 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Assets Out of Balance"
          value={`${deviationData?.summary.assetsOutOfBalance}/${deviationData?.summary.totalAssets}`}
          icon={AlertTriangle}
        />
        <StatCard
          title="Last Rebalance"
          value={lastRebalance ? new Date(lastRebalance.executedAt).toLocaleDateString() : 'Never'}
          description={lastRebalance?.type ? `Type: ${lastRebalance.type}` : undefined}
          icon={History}
        />
        <StatCard
          title="Next Scheduled"
          value={nextScheduled ? new Date(nextScheduled).toLocaleDateString() : 'Not set'}
          description={nextScheduled ? new Date(nextScheduled).toLocaleTimeString() : undefined}
          icon={Calendar}
        />
      </div>

      {/* Status Banner */}
      {deviationData?.summary && (
        <Card className={cn(
          'border-l-4',
          deviationData.summary.status === 'balanced' ? 'border-l-green-500' :
            deviationData.summary.status === 'minor_deviation' ? 'border-l-amber-500' :
              deviationData.summary.status === 'needs_rebalance' ? 'border-l-orange-500' :
                'border-l-red-500'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge status={deviationData.summary.status} />
                <span className="text-sm text-muted-foreground">
                  Last checked: {new Date(deviationData.summary.lastChecked).toLocaleString()}
                </span>
              </div>
              {deviationData.summary.status !== 'balanced' && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Thresholds
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current vs Target Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Current vs Target Allocation</CardTitle>
                <CardDescription>
                  Compare current portfolio weights against target allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deviationData?.allocations && (
                  <DeviationChart
                    data={deviationData.allocations}
                    height={350}
                    onAssetClick={handleAssetClick}
                  />
                )}
              </CardContent>
            </Card>

            {/* Deviation Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Deviation Analysis</CardTitle>
                <CardDescription>
                  View deviation from target for each asset (5% threshold)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deviationData?.allocations && (
                  <DeviationBarChart
                    data={deviationData.allocations}
                    height={350}
                    threshold={5}
                    onAssetClick={handleAssetClick}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalRebalances}</p>
                    <p className="text-sm text-muted-foreground">Total Rebalances</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{stats.averageFrequency.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Avg Days Between</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">${(stats.totalVolumeTraded / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocations</CardTitle>
              <CardDescription>
                Detailed view of current portfolio allocations and deviations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviationData?.allocations && (
                <AllocationTable
                  allocations={deviationData.allocations}
                  onAssetClick={handleAssetClick}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Rebalancing History</CardTitle>
              <CardDescription>
                Past rebalancing operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading history...
                </div>
              ) : historyData?.items ? (
                <HistoryTable items={historyData.items} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No rebalancing history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Asset Detail (could be expanded to a drawer) */}
      {selectedAsset && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selected: {selectedAsset.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold">${(selectedAsset.currentValue / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-lg font-semibold">{selectedAsset.currentWeight.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Weight</p>
                <p className="text-lg font-semibold">{selectedAsset.targetWeight.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deviation</p>
                <p className={cn(
                  'text-lg font-semibold',
                  selectedAsset.deviation > 0 ? 'text-orange-600' :
                    selectedAsset.deviation < 0 ? 'text-blue-600' : 'text-green-600'
                )}>
                  {selectedAsset.deviation > 0 ? '+' : ''}{selectedAsset.deviation.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rebalance Plan Card */}
      {rebalancePreview && (
        <RebalancePlanCard
          preview={rebalancePreview}
          onExecute={handleExecuteRebalance}
          onCancel={handleCancelPreview}
          isExecuting={executeMutation.isPending}
        />
      )}

      {/* Execution Modal */}
      <ExecutionModal
        open={showExecutionModal}
        onOpenChange={setShowExecutionModal}
        preview={rebalancePreview}
        onConfirm={handleConfirmExecution}
        executionStatus={executionStatus}
      />
    </div>
  )
}
