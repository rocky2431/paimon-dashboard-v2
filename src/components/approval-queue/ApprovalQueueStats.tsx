import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClockIcon,
  CheckCircleIcon,
  TriangleAlertIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApprovalQueueStats } from '@/types/approval-queue'

interface ApprovalQueueStatsProps {
  stats: ApprovalQueueStats
}

export function ApprovalQueueStats({ stats }: ApprovalQueueStatsProps) {
  const getOverduePercentage = () => {
    const total = stats.totalPending + stats.totalInReview
    return total > 0 ? Math.round((stats.overdueCount / total) * 100) : 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Items */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.totalPending}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClockIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* In Review */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">In Review</p>
            <p className="text-2xl font-bold">{stats.totalInReview}</p>
          </div>
          <div className="p-2 bg-amber-100 rounded-lg">
            <UsersIcon className="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </Card>

      {/* Overdue */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold">{stats.overdueCount}</p>
            <p className="text-xs text-muted-foreground">
              {getOverduePercentage()}% of total
            </p>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            stats.overdueCount > 0 ? "bg-red-100" : "bg-green-100"
          )}>
            <TriangleAlertIcon className={cn(
              "h-5 w-5",
              stats.overdueCount > 0 ? "text-red-600" : "text-green-600"
            )} />
          </div>
        </div>
        {stats.overdueCount > 0 && (
          <Badge variant="destructive" className="mt-2">
            Requires attention
          </Badge>
        )}
      </Card>

      {/* Processing Time */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
            <p className="text-2xl font-bold">{stats.avgTimeToApprove}h</p>
            <div className="flex items-center gap-1 text-xs">
              {stats.todayProcessed > stats.weeklyProcessed / 7 ? (
                <>
                  <TrendingUpIcon className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Fast</span>
                </>
              ) : (
                <>
                  <TrendingDownIcon className="h-3 w-3 text-amber-600" />
                  <span className="text-amber-600">Slow</span>
                </>
              )}
            </div>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {stats.todayProcessed} today • {stats.weeklyProcessed} this week
        </div>
      </Card>
    </div>
  )
}