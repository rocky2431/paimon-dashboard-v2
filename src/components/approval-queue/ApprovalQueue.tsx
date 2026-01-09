import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  TriangleAlertIcon,
  RefreshCwIcon,
  SearchIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { useApprovalQueue, useQuickApprove, useQuickReject } from '@/hooks/useApprovalQueue'
import { useApprovalNotifications } from '@/hooks/useApprovalNotifications'
import { ApprovalQueueStats } from './ApprovalQueueStats'
import { ApprovalQueueItem } from './ApprovalQueueItem'
import { cn } from '@/lib/utils'
import type { ApprovalQueueFilters } from '@/types/approval-queue'

interface ApprovalQueueProps {
  className?: string
}

export function ApprovalQueue({ className }: ApprovalQueueProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filters, setFilters] = useState<ApprovalQueueFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: queueData, isLoading, error, refetch } = useApprovalQueue({
    ...filters,
    search: searchTerm
  })

  const quickApproveMutation = useQuickApprove()
  const quickRejectMutation = useQuickReject()

  // Real-time notifications integration
  const { isConnected, connectionState } = useApprovalNotifications()

  const handleQuickApprove = (itemId: string, notes?: string) => {
    quickApproveMutation.mutate({ itemId, notes })
  }

  const handleQuickReject = (itemId: string, reason: string, notes?: string) => {
    quickRejectMutation.mutate({ itemId, reason, notes })
  }

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: type === 'all' ? undefined : [type as any]
    }))
    setActiveTab(type)
  }

  const handlePriorityFilter = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: priority === 'all' ? undefined : [priority as any]
    }))
  }

  const isLoadingAction = quickApproveMutation.isPending || quickRejectMutation.isPending

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircleIcon className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Failed to load approval queue</h3>
            <p className="text-sm">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  const stats = queueData?.stats
  const groups = queueData?.groups || []

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approval Queue</h2>
          <p className="text-muted-foreground">
            Manage pending approvals and requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className={cn(
              'text-xs',
              isConnected ? 'text-green-600' : 'text-gray-600'
            )}>
              {connectionState === 'connected' ? 'Live' :
               connectionState === 'connecting' ? 'Connecting...' :
               connectionState === 'reconnecting' ? 'Reconnecting...' :
               'Offline'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <ApprovalQueueStats stats={stats} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Priority Filter */}
          <Select onValueChange={handlePriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Queue Groups */}
      <Tabs value={activeTab} onValueChange={handleTypeFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All Items
            {queueData?.total && (
              <Badge variant="secondary" className="ml-2">
                {queueData.total}
              </Badge>
            )}
          </TabsTrigger>
          {groups.map((group) => (
            <TabsTrigger key={group.type} value={group.type}>
              {group.label}
              <Badge variant="secondary" className="ml-2">
                {group.count}
              </Badge>
              {group.slaOverdueCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {group.slaOverdueCount}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading approval queue...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups
                .filter(group => activeTab === 'all' || group.type === activeTab)
                .map((group) => (
                  <Card key={group.type} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{group.label}</h3>
                        <Badge variant="outline">{group.count} items</Badge>
                        <Badge variant="secondary">
                          Avg: {group.avgProcessingTime}h
                        </Badge>
                      </div>
                      {group.slaOverdueCount > 0 && (
                        <div className="flex items-center gap-2 text-destructive">
                          <TriangleAlertIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {group.slaOverdueCount} overdue
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {group.items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No {group.label.toLowerCase()} items pending
                        </div>
                      ) : (
                        group.items.map((item) => (
                          <ApprovalQueueItem
                            key={item.id}
                            item={item}
                            onApprove={handleQuickApprove}
                            onReject={handleQuickReject}
                            disabled={isLoadingAction}
                          />
                        ))
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}