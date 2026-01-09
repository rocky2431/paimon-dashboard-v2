import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Timeline } from './Timeline'
import {
  useApproveRedemption,
  useRejectRedemption,
  useProcessRedemption,
  useRedemptionDetail,
} from '@/hooks/useRedemptions'
import {
  CheckIcon,
  XIcon,
  PlayIcon,
  AlertCircleIcon,
  CopyIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { RedemptionStatus } from '@/types/redemption'

interface DetailDrawerProps {
  redemptionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetailDrawer({ redemptionId, open, onOpenChange }: DetailDrawerProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processNotes, setProcessNotes] = useState('')
  const [transactionHash, setTransactionHash] = useState('')

  const { data: redemption, error, isLoading } = useRedemptionDetail(redemptionId!)
  const approveMutation = useApproveRedemption()
  const rejectMutation = useRejectRedemption()
  const processMutation = useProcessRedemption()

  if (!redemptionId) return null

  const handleApprove = async () => {
    if (!redemption) return

    try {
      await approveMutation.mutateAsync({ id: redemption.id })
      toast.success('Redemption approved successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to approve redemption')
    }
  }

  const handleReject = async () => {
    if (!redemption || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await rejectMutation.mutateAsync({
        id: redemption.id,
        reason: rejectReason
      })
      toast.success('Redemption rejected successfully')
      setRejectDialogOpen(false)
      onOpenChange(false)
      setRejectReason('')
      setProcessNotes('')
    } catch (error) {
      toast.error('Failed to reject redemption')
    }
  }

  const handleProcess = async () => {
    if (!redemption) return

    try {
      await processMutation.mutateAsync({ id: redemption.id })
      toast.success('Redemption processing initiated')
      setProcessDialogOpen(false)
      onOpenChange(false)
      setProcessNotes('')
      setTransactionHash('')
    } catch (error) {
      toast.error('Failed to process redemption')
    }
  }

  const canApprove = redemption?.status === 'pending'
  const canReject = redemption?.status === 'pending'
  const canProcess = redemption?.status === 'approved'

  const getStatusColor = (status: RedemptionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (error) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load redemption details</h3>
            <p className="text-muted-foreground text-center mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading redemption details...</p>
              </div>
            </div>
          ) : redemption ? (
            <div className="space-y-6">
              {/* Header */}
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Redemption Details</span>
                  <Badge className={cn('ml-2', getStatusColor(redemption.status))}>
                    {redemption.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  ID: {redemption.id} • Requested on {format(new Date(redemption.requestDate), 'MMM dd, yyyy HH:mm')}
                </SheetDescription>
              </SheetHeader>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                      <div className="text-xl font-bold">
                        {redemption.currency} {redemption.amount.toLocaleString()}
                      </div>
                      {redemption.netAmount && (
                        <div className="text-sm text-muted-foreground">
                          Net: {redemption.currency} {redemption.netAmount.toLocaleString()}
                        </div>
                      )}
                      {redemption.fee && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {redemption.currency} {redemption.fee.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Channel</Label>
                      <Badge variant="outline">
                        {redemption.channel.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </Card>
                </div>

                {/* User Information */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">User Information</Label>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{redemption.userId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(redemption.userId)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Wallet Address */}
                {redemption.walletAddress && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Wallet Address</Label>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">
                          {redemption.walletAddress.slice(0, 8)}...{redemption.walletAddress.slice(-8)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(redemption.walletAddress!)}
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://etherscan.io/address/${redemption.walletAddress}`, '_blank')}
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Transaction Hash */}
                {redemption.transactionHash && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm break-all">
                          {redemption.transactionHash}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(redemption.transactionHash || '')}
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://etherscan.io/tx/${redemption.transactionHash}`, '_blank')}
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Request Date</Label>
                      <div>
                        {format(new Date(redemption.requestDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(redemption.requestDate), 'HH:mm:ss')}
                      </div>
                    </div>
                  </Card>

                  {redemption.processedDate && (
                    <Card className="p-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Processed Date</Label>
                        <div>
                          {format(new Date(redemption.processedDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(redemption.processedDate), 'HH:mm:ss')}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Notes */}
                {redemption.notes && (
                  <Card className="p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                      <p className="text-sm">{redemption.notes}</p>
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                <Timeline redemption={redemption} />

                {/* Actions */}
                {(canApprove || canReject || canProcess) && (
                  <>
                    <Separator />
                    <SheetFooter className="flex-col sm:flex-row gap-2">
                      {canApprove && (
                        <Button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                          className="gap-2"
                        >
                          <CheckIcon className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      {canReject && (
                        <Button
                          variant="destructive"
                          onClick={() => setRejectDialogOpen(true)}
                          disabled={rejectMutation.isPending}
                          className="gap-2"
                        >
                          <XIcon className="h-4 w-4" />
                          Reject
                        </Button>
                      )}
                      {canProcess && (
                        <Button
                          onClick={() => setProcessDialogOpen(true)}
                          disabled={processMutation.isPending}
                          className="gap-2"
                        >
                          <PlayIcon className="h-4 w-4" />
                          Process
                        </Button>
                      )}
                    </SheetFooter>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Redemption</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this redemption request.
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
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                placeholder="Enter any additional notes (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Redemption</DialogTitle>
            <DialogDescription>
              Start processing this approved redemption request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-hash">Transaction Hash</Label>
              <Input
                id="transaction-hash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter transaction hash (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process-notes">Processing Notes</Label>
              <Textarea
                id="process-notes"
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                placeholder="Enter processing notes (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={processMutation.isPending}
            >
              Start Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}