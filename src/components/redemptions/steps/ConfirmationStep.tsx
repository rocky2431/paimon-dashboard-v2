import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  ShieldIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Redemption } from '@/types/redemption'

interface ConfirmationStepProps {
  redemption: Redemption
  decision: 'approve' | 'reject'
  reason: string
  notes: string
  onSubmit: () => void
  onPrevious: () => void
  isSubmitting: boolean
}

export function ConfirmationStep({
  redemption,
  decision,
  reason,
  notes,
  onSubmit,
  onPrevious,
  isSubmitting,
}: ConfirmationStepProps) {
  const isApproval = decision === 'approve'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={cn(
          "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4",
          isApproval ? "bg-green-100" : "bg-red-100"
        )}>
          {isApproval ? (
            <CheckIcon className="h-6 w-6 text-green-600" />
          ) : (
            <XIcon className="h-6 w-6 text-red-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Confirm {isApproval ? 'Approval' : 'Rejection'}
        </h3>
        <p className="text-muted-foreground">
          Please review the details below before confirming your decision
        </p>
      </div>

      {/* Decision Summary */}
      <Card className={cn(
        "p-6 border-l-4",
        isApproval
          ? "bg-green-50 border-green-300"
          : "bg-red-50 border-red-300"
      )}>
        <div className="flex items-center gap-3 mb-4">
          {isApproval ? (
            <CheckIcon className="h-5 w-5 text-green-600" />
          ) : (
            <XIcon className="h-5 w-5 text-red-600" />
          )}
          <div>
            <div className="font-semibold">
              {isApproval ? 'APPROVAL CONFIRMED' : 'REJECTION CONFIRMED'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isApproval
                ? 'This redemption will be processed and funds will be transferred'
                : 'This redemption will be cancelled and the user will be notified'
              }
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Redemption Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Amount</span>
            </div>
            <div className="text-xl font-bold">
              {redemption.currency} {redemption.amount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              ID: {redemption.id.slice(-8)}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">User</span>
            </div>
            <div className="font-mono text-sm">
              {redemption.userId.slice(-8)}
            </div>
            <Badge variant="outline">
              {redemption.channel.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Action Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Action Details</span>
        </div>

        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Decision</span>
              <Badge className={cn(
                isApproval ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {decision.toUpperCase()}
              </Badge>
            </div>

            {!isApproval && reason && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Reason</span>
                <span className="text-sm text-right max-w-[60%]">{reason}</span>
              </div>
            )}

            {notes && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Additional Notes</span>
                <span className="text-sm text-right max-w-[60%]">{notes}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Request Date</span>
              <span className="text-sm">
                {format(new Date(redemption.requestDate), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm">
                {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Warnings */}
      {isApproval && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-medium text-amber-900 mb-1">Important Notice</div>
              <div className="text-sm text-amber-800">
                Once approved, this action cannot be undone. The redemption will enter processing status
                and the user will receive {redemption.currency} {redemption.amount.toLocaleString()}.
                Please ensure all details are correct before proceeding.
              </div>
            </div>
          </div>
        </Card>
      )}

      {!isApproval && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <ShieldIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900 mb-1">User Notification</div>
              <div className="text-sm text-blue-800">
                The user will be automatically notified of this decision via email and in-app notifications.
                The reason provided will be shared with the user to help them understand the decision.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Audit Trail */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Audit Trail</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• This action will be logged in the system audit trail</div>
          <div>• Administrator: Current user session</div>
          <div>• Timestamp: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</div>
          <div>• IP Address: Will be recorded automatically</div>
        </div>
      </Card>

      {/* Confirmation Checkbox - Additional Safety */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <input
          type="checkbox"
          id="final-confirmation"
          className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
          defaultChecked={true}
        />
        <label htmlFor="final-confirmation" className="text-sm">
          I confirm that I have reviewed all the details above and want to proceed with this {decision}
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Previous
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "gap-2",
            isApproval
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              {isApproval ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Approve Redemption
                </>
              ) : (
                <>
                  <XIcon className="h-4 w-4" />
                  Reject Redemption
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}