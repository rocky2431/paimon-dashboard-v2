import { useState, useMemo } from 'react'
import DataTable from '@/components/ui/DataTable'
import { type ColumnDef } from '@tanstack/react-table'
import { FilterBar } from '@/components/redemptions/FilterBar'
import { DetailDrawer } from '@/components/redemptions/DetailDrawer'
import { ApprovalWorkflow } from '@/components/redemptions/ApprovalWorkflow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRedemptionList, useApproveRedemption, useRejectRedemption, useProcessRedemption } from '@/hooks/useRedemptions'
import { redemptionApi } from '@/services/redemption-api'
import {
  EyeIcon,
  DownloadIcon,
  CheckIcon,
  XIcon,
  PlayIcon,
  MoreHorizontalIcon,
  SettingsIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type {
  Redemption,
  RedemptionFilters,
  RedemptionStatus
} from '@/types/redemption'

function RedemptionList() {
  const [filters, setFilters] = useState<RedemptionFilters>({})
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedRedemptionId, setSelectedRedemptionId] = useState<string | null>(null)
  const [workflowRedemptionId, setWorkflowRedemptionId] = useState<string | null>(null)

  // Data fetching
  const { data: redemptionData, isLoading, error, refetch } = useRedemptionList(filters)
  const approveMutation = useApproveRedemption()
  const rejectMutation = useRejectRedemption()
  const processMutation = useProcessRedemption()

  const redemptions = redemptionData?.redemptions || []
  const total = redemptionData?.total || 0

  // Handle row selection
  const handleSelectionChange = (selectedRows: unknown[]) => {
    const selectedIds = selectedRows.map((row: any) => row.id)
    setSelectedRows(selectedIds)
  }

  // Handle bulk actions
  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        selectedRows.map(id => approveMutation.mutateAsync({ id }))
      )
      toast.success(`Approved ${selectedRows.length} redemption(s)`)
      setSelectedRows([])
    } catch (error) {
      toast.error('Failed to approve redemptions')
    }
  }

  const handleBulkReject = async () => {
    // In a real implementation, you'd show a dialog to get the rejection reason
    const reason = 'Bulk rejection'
    try {
      await Promise.all(
        selectedRows.map(id => rejectMutation.mutateAsync({ id, reason }))
      )
      toast.success(`Rejected ${selectedRows.length} redemption(s)`)
      setSelectedRows([])
    } catch (error) {
      toast.error('Failed to reject redemptions')
    }
  }

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await redemptionApi.exportRedemptions(filters, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `redemptions_${format}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Exported redemptions as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export redemptions')
    }
  }

  // Table columns definition
  const columns = useMemo<ColumnDef<Redemption>[]>(() => [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      enableSorting: false,
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-xs">{(row.getValue('id') as string).slice(-8)}</span>
      )
    },
    {
      id: 'userId',
      header: 'User ID',
      accessorKey: 'userId',
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-xs">{(row.getValue('userId') as string).slice(-8)}</span>
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const redemption = row.original
        return (
          <div className="text-right">
            <div className="font-medium">
              {redemption.currency} {redemption.amount.toLocaleString()}
            </div>
            {redemption.fee && (
              <div className="text-xs text-muted-foreground">
                Fee: {redemption.currency} {redemption.fee}
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const status = row.original.status
        const variant = getStatusVariant(status)
        return (
          <Badge variant={variant}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        )
      }
    },
    {
      id: 'channel',
      header: 'Channel',
      accessorKey: 'channel',
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const channel = row.original.channel
        return (
          <Badge variant="outline">
            {channel.replace('_', ' ').toUpperCase()}
          </Badge>
        )
      }
    },
    {
      id: 'requestDate',
      header: 'Request Date',
      accessorKey: 'requestDate',
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {format(new Date(row.original.requestDate), 'MMM dd, yyyy HH:mm')}
        </div>
      )
    },
    {
      id: 'processedDate',
      header: 'Processed Date',
      accessorKey: 'processedDate',
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const date = row.original.processedDate
        return date ? (
          <div className="text-sm">
            {format(new Date(date), 'MMM dd, yyyy HH:mm')}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: { row: any }) => {
        const redemption = row.original
        const canApprove = redemption.status === 'pending'
        const canReject = redemption.status === 'pending'
        const canProcess = redemption.status === 'approved'
        const canStartWorkflow = redemption.status === 'pending'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canStartWorkflow && (
                <DropdownMenuItem
                  onClick={() => setWorkflowRedemptionId(redemption.id)}
                  className="font-medium"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Start Workflow
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setSelectedRedemptionId(redemption.id)}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canApprove && (
                <DropdownMenuItem
                  onClick={() => approveMutation.mutate({ id: redemption.id })}
                  disabled={approveMutation.isPending}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}
              {canReject && (
                <DropdownMenuItem
                  onClick={() => {
                    const reason = 'Rejected via list view'
                    rejectMutation.mutate({ id: redemption.id, reason })
                  }}
                  disabled={rejectMutation.isPending}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              )}
              {canProcess && (
                <DropdownMenuItem
                  onClick={() => processMutation.mutate({ id: redemption.id })}
                  disabled={processMutation.isPending}
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Process
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Redemptions</h1>
          <p className="text-muted-foreground">
            Manage and track redemption requests ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <DownloadIcon className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedRows.length} redemption(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={approveMutation.isPending}
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
                disabled={rejectMutation.isPending}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Reject Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <DataTable
          columns={columns as any}
          data={redemptions}
          loading={isLoading}
          error={error?.message}
          emptyMessage="No redemption requests found"
          pagination={{
            enabled: true
          }}
          search
          rowSelection={{
            enabled: true,
            onSelectionChange: handleSelectionChange
          }}
          hoverable
          striped
          showRowNumbers
        />
      </Card>

      {/* Detail Drawer */}
      <DetailDrawer
        redemptionId={selectedRedemptionId}
        open={!!selectedRedemptionId}
        onOpenChange={(open) => !open && setSelectedRedemptionId(null)}
      />

      {/* Approval Workflow */}
      <ApprovalWorkflow
        redemptionId={workflowRedemptionId}
        open={!!workflowRedemptionId}
        onOpenChange={(open) => !open && setWorkflowRedemptionId(null)}
        onComplete={() => refetch()}
      />
    </div>
  )
}

// Helper function to get status badge variant
function getStatusVariant(status: RedemptionStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'approved':
      return 'default'
    case 'processing':
      return 'outline'
    case 'completed':
      return 'default'
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default RedemptionList