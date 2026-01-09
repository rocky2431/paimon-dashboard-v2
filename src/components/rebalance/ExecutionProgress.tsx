/**
 * ExecutionProgress Component
 *
 * Displays real-time progress of rebalance execution with trade status
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RebalanceTrade } from '@/types/rebalancing'

export interface TradeExecution {
  trade: RebalanceTrade
  status: 'pending' | 'executing' | 'completed' | 'failed'
  txHash?: string
  error?: string
  executedAt?: string
}

export interface ExecutionProgressProps {
  trades: TradeExecution[]
  overallProgress: number
  status: 'idle' | 'executing' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  className?: string
}

function TradeStatusIcon({ status }: { status: TradeExecution['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    case 'executing':
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />
  }
}

function TradeRow({ execution }: { execution: TradeExecution }) {
  const { trade, status, txHash, error } = execution

  return (
    <div className={cn(
      'flex items-center gap-4 p-3 rounded-lg border transition-colors',
      status === 'executing' && 'border-primary bg-primary/5',
      status === 'completed' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
      status === 'failed' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
      status === 'pending' && 'border-muted'
    )}>
      <TradeStatusIcon status={status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{trade.fromAsset}</Badge>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">{trade.toAsset}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-muted-foreground">
            ${(trade.fromAmount / 1000).toFixed(1)}K → ${(trade.toAmount / 1000).toFixed(1)}K
          </span>
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className={cn(
            'text-xs capitalize',
            status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            status === 'executing' && 'bg-primary/20 text-primary',
            status === 'failed' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {status}
        </Badge>
        {txHash && (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}

export function ExecutionProgress({
  trades,
  overallProgress,
  status,
  startedAt,
  completedAt,
  className,
}: ExecutionProgressProps) {
  const completedCount = trades.filter(t => t.status === 'completed').length
  const failedCount = trades.filter(t => t.status === 'failed').length

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Execution Progress
            <Badge
              variant="secondary"
              className={cn(
                status === 'executing' && 'bg-primary/20 text-primary',
                status === 'completed' && 'bg-green-100 text-green-800',
                status === 'failed' && 'bg-red-100 text-red-800'
              )}
            >
              {status === 'executing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {status}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount}/{trades.length} trades
            {failedCount > 0 && (
              <span className="text-red-600 ml-2">({failedCount} failed)</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Time Info */}
        {(startedAt || completedAt) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {startedAt && (
              <span>Started: {new Date(startedAt).toLocaleTimeString()}</span>
            )}
            {completedAt && (
              <span>Completed: {new Date(completedAt).toLocaleTimeString()}</span>
            )}
          </div>
        )}

        {/* Trade List */}
        <div className="space-y-2">
          {trades.map((execution, index) => (
            <TradeRow key={execution.trade.id || index} execution={execution} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
