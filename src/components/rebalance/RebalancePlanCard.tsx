/**
 * RebalancePlanCard Component
 *
 * Displays rebalance plan with before/after preview of portfolio allocations
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Fuel,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RebalancePreview, RebalanceTrade } from '@/types/rebalancing'

export interface RebalancePlanCardProps {
  preview: RebalancePreview
  onExecute?: () => void
  onCancel?: () => void
  isExecuting?: boolean
  className?: string
}

// Time remaining until preview expires
function TimeRemaining({ expiresAt }: { expiresAt: string }) {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  const diffMins = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMins <= 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {diffMins} min remaining
    </Badge>
  )
}

// Trade row component
function TradeRow({ trade }: { trade: RebalanceTrade }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {trade.fromAsset}
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {trade.toAsset}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        ${(trade.fromAmount / 1000).toFixed(1)}K
      </TableCell>
      <TableCell className="text-right font-mono">
        ${(trade.toAmount / 1000).toFixed(1)}K
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground">
        {trade.estimatedPrice.toFixed(4)}
      </TableCell>
      <TableCell className="text-right">
        <span className={cn(
          'font-mono text-sm',
          trade.slippage > 0.5 ? 'text-orange-600' : 'text-green-600'
        )}>
          {trade.slippage.toFixed(2)}%
        </span>
      </TableCell>
    </TableRow>
  )
}

// Allocation comparison component
function AllocationComparison({ preview }: { preview: RebalancePreview }) {
  const { before, after } = preview.allocations

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Before */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Before</h4>
        <div className="space-y-2">
          {before.slice(0, 5).map(asset => (
            <div key={asset.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">{asset.symbol}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{asset.currentWeight.toFixed(1)}%</span>
                {asset.deviation !== 0 && (
                  <span className={cn(
                    'text-xs',
                    asset.deviation > 0 ? 'text-orange-600' : 'text-blue-600'
                  )}>
                    ({asset.deviation > 0 ? '+' : ''}{asset.deviation.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* After */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">After</h4>
        <div className="space-y-2">
          {after.slice(0, 5).map(asset => (
            <div key={asset.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">{asset.symbol}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-green-600">{asset.currentWeight.toFixed(1)}%</span>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RebalancePlanCard({
  preview,
  onExecute,
  onCancel,
  isExecuting = false,
  className,
}: RebalancePlanCardProps) {
  const totalFromAmount = preview.trades.reduce((sum, t) => sum + t.fromAmount, 0)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Rebalance Plan
              <TimeRemaining expiresAt={preview.expiresAt} />
            </CardTitle>
            <CardDescription>
              Review the proposed trades and impact before execution
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            ID: {preview.id.slice(-8)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Impact Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{preview.trades.length}</p>
            <p className="text-xs text-muted-foreground">Trades</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">${(totalFromAmount / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-muted-foreground">Volume</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{preview.estimatedGas.toFixed(3)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Est. Gas (ETH)</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{preview.impact.expectedDeviation.toFixed(1)}%</p>
            </div>
            <p className="text-xs text-muted-foreground">New Deviation</p>
          </div>
        </div>

        {/* Allocation Comparison */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Allocation Changes</h3>
          <AllocationComparison preview={preview} />
        </div>

        {/* Trades Table */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Proposed Trades</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade</TableHead>
                  <TableHead className="text-right">From Amount</TableHead>
                  <TableHead className="text-right">To Amount</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Slippage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.trades.map(trade => (
                  <TradeRow key={trade.id} trade={trade} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Warnings */}
        {preview.estimatedSlippage > 0.5 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Higher than expected slippage
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Total estimated slippage is {preview.estimatedSlippage.toFixed(2)}%. Consider splitting into smaller trades.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isExecuting}>
          Cancel
        </Button>
        <Button onClick={onExecute} disabled={isExecuting}>
          {isExecuting ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              Executing...
            </>
          ) : (
            <>
              Execute Rebalance
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
