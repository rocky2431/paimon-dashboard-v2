import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  FileTextIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Redemption } from '@/types/redemption'

interface DecisionStepProps {
  redemption: Redemption
  decision: 'approve' | 'reject' | null
  onDecisionChange: (decision: 'approve' | 'reject' | null) => void
  reason: string
  onReasonChange: (reason: string) => void
  notes: string
  onNotesChange: (notes: string) => void
  onNext: () => void
  onPrevious: () => void
}

export function DecisionStep({
  redemption,
  decision,
  onDecisionChange,
  reason,
  onReasonChange,
  notes,
  onNotesChange,
  onNext,
  onPrevious,
}: DecisionStepProps) {
  const [rejectionReasons] = useState([
    'Insufficient user verification',
    'Invalid wallet address',
    'Amount exceeds daily/weekly limits',
    'Suspicious activity pattern',
    'Compliance violation',
    'Incomplete documentation',
    'Technical issue detected',
    'Other (please specify)'
  ])

  const handleReasonSelect = (selectedReason: string) => {
    if (selectedReason === 'Other (please specify)') {
      onReasonChange('')
    } else {
      onReasonChange(selectedReason)
    }
  }

  const isOtherReason = reason && !rejectionReasons.includes(reason)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Make Decision</h3>
        <p className="text-muted-foreground">
          Choose to approve or reject this redemption request
        </p>
      </div>

      {/* Amount Summary */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSignIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Request Amount</div>
              <div className="text-xl font-bold">
                {redemption.currency} {redemption.amount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>User ID: {redemption.userId.slice(-8)}</div>
            <div>Channel: {redemption.channel.replace('_', ' ')}</div>
          </div>
        </div>
      </Card>

      {/* Decision Selection */}
      <Card className="p-6">
        <Label className="text-base font-medium mb-4 block">Decision</Label>
        <RadioGroup
          value={decision || ''}
          onValueChange={(value) => onDecisionChange(value as 'approve' | 'reject')}
          className="space-y-4"
        >
          {/* Approve Option */}
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-green-50 transition-colors cursor-pointer">
            <RadioGroupItem value="approve" id="approve" />
            <Label
              htmlFor="approve"
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Approve</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Proceed with redemption processing
              </span>
            </Label>
          </div>

          {/* Reject Option */}
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-red-50 transition-colors cursor-pointer">
            <RadioGroupItem value="reject" id="reject" />
            <Label
              htmlFor="reject"
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="flex items-center gap-2">
                <XIcon className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Reject</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Cancel this redemption request
              </span>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Conditional Fields Based on Decision */}
      {decision === 'reject' && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangleIcon className="h-5 w-5 text-orange-600" />
              <Label className="text-base font-medium text-orange-900">
                Rejection Reason (Required)
              </Label>
            </div>

            {/* Quick Reason Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rejectionReasons.map((rejectionReason) => (
                <Button
                  key={rejectionReason}
                  variant={reason === rejectionReason ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleReasonSelect(rejectionReason)}
                  className={cn(
                    "justify-start h-auto py-2 px-3 text-left",
                    reason === rejectionReason && "bg-orange-600 hover:bg-orange-700"
                  )}
                >
                  {rejectionReason}
                </Button>
              ))}
            </div>

            {/* Custom Reason Input */}
            {isOtherReason && (
              <div className="mt-4">
                <Label htmlFor="custom-reason" className="text-sm font-medium">
                  Please specify reason
                </Label>
                <Input
                  id="custom-reason"
                  value={reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder="Enter rejection reason"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Additional Notes */}
      <Card className="p-6">
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Additional Notes (Optional)
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={
              decision === 'approve'
                ? "Add any notes about this approval (optional)"
                : "Provide additional context for the rejection (optional)"
            }
            rows={4}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground">
            Notes will be recorded in the redemption history and visible to other administrators.
          </div>
        </div>
      </Card>

      {/* Impact Summary */}
      {decision && (
        <Card className={cn(
          "p-4 border-l-4",
          decision === 'approve'
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        )}>
          <div className="flex items-start gap-3">
            {decision === 'approve' ? (
              <CheckIcon className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <XIcon className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div>
              <div className="font-medium mb-1">
                {decision === 'approve' ? 'Approval Impact:' : 'Rejection Impact:'}
              </div>
              <div className="text-sm text-muted-foreground">
                {decision === 'approve'
                  ? `The user will receive ${redemption.currency} ${redemption.amount.toLocaleString()} and the redemption will enter processing status.`
                  : 'The user will be notified of the rejection and the redemption will be cancelled. The user may submit a new request if needed.'
                }
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={
            !decision ||
            (decision === 'reject' && !reason.trim())
          }
        >
          Review Confirmation
        </Button>
      </div>
    </div>
  )
}