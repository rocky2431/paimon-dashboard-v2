import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckIcon,
  XIcon,
  ClockIcon,
  TriangleAlertIcon,
  UserIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { ApprovalQueueItem } from '@/types/approval-queue'

interface ApprovalQueueItemProps {
  item: ApprovalQueueItem
  onApprove: (itemId: string, notes?: string) => void
  onReject: (itemId: string, reason: string, notes?: string) => void
  disabled?: boolean
}

export function ApprovalQueueItem({ item, onApprove, onReject, disabled }: ApprovalQueueItemProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')

  const isOverdue = new Date(item.slaDeadline) < new Date()
  const timeToDeadline = new Date(item.slaDeadline).getTime() - new Date().getTime()
  const hoursToDeadline = Math.max(0, Math.floor(timeToDeadline / (1000 * 60 * 60)))

  const getPriorityColor = (priority: ApprovalQueueItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: ApprovalQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleQuickApprove = () => {
    onApprove(item.id)
  }

  const handleQuickReject = () => {
    if (!rejectReason.trim()) {
      return
    }
    onReject(item.id, rejectReason, rejectNotes)
    setRejectDialogOpen(false)
    setRejectReason('')
    setRejectNotes('')
  }

  return (
    <>
      <Card className={cn(
        "p-4 border-l-4 transition-all hover:shadow-md",
        isOverdue ? "border-l-red-500 bg-red-50/50" : "border-l-transparent"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold truncate">{item.title}</h4>
              <Badge className={getPriorityColor(item.priority)}>
                {item.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(item.status)}>
                {item.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{item.submittedBy.slice(-8)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(new Date(item.submittedAt), 'MMM dd, HH:mm')}</span>
              </div>
              {item.assignee && (
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  <span>Assigned to {item.assignee.slice(-8)}</span>
                </div>
              )}
            </div>

            {/* SLA Indicator */}
            <div className={cn(
              "flex items-center gap-2 text-sm",
              isOverdue ? "text-red-600" : hoursToDeadline < 2 ? "text-amber-600" : "text-muted-foreground"
            )}>
              {isOverdue ? (
                <>
                  <TriangleAlertIcon className="h-4 w-4" />
                  <span className="font-medium">OVERDUE</span>
                  <span>({format(new Date(item.slaDeadline), 'MMM dd, HH:mm')})</span>
                </>
              ) : hoursToDeadline < 2 ? (
                <>
                  <ClockIcon className="h-4 w-4" />
                  <span>Due in {hoursToDeadline}h</span>
                </>
              ) : (
                <>
                  <ClockIcon className="h-4 w-4" />
                  <span>Due in {hoursToDeadline}h</span>
                </>
              )}
            </div>

            {/* Item-specific metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {item.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={handleQuickApprove}
                  disabled={disabled}
                  className="gap-1"
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={disabled}
                  className="gap-1"
                >
                  <XIcon className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  View History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Assign to User
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Set Reminder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Approval Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject-notes">Additional Notes</Label>
              <Textarea
                id="reject-notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Enter any additional notes (optional)"
                rows={3}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Item Details</span>
              </div>
              <div className="mt-1 text-sm text-amber-700">
                <div><strong>Title:</strong> {item.title}</div>
                <div><strong>Submitted:</strong> {format(new Date(item.submittedAt), 'MMM dd, yyyy HH:mm')}</div>
                <div><strong>Priority:</strong> {item.priority}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleQuickReject}
              disabled={!rejectReason.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}