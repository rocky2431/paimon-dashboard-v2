import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Stepper } from '@/components/ui/stepper'
import { ReviewStep } from './steps/ReviewStep'
import { DecisionStep } from './steps/DecisionStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import { useRedemptionDetail } from '@/hooks/useRedemptions'
import { useApproveRedemption, useRejectRedemption } from '@/hooks/useRedemptions'
import { toast } from 'sonner'

interface ApprovalWorkflowProps {
  redemptionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function ApprovalWorkflow({
  redemptionId,
  open,
  onOpenChange,
  onComplete
}: ApprovalWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { data: redemption } = useRedemptionDetail(redemptionId!)
  const approveMutation = useApproveRedemption()
  const rejectMutation = useRejectRedemption()

  const steps = [
    {
      id: 'review',
      title: 'Review Details',
      description: 'Verify redemption information',
      status: 'pending' as const
    },
    {
      id: 'decision',
      title: 'Make Decision',
      description: 'Approve or reject request',
      status: 'pending' as const
    },
    {
      id: 'confirmation',
      title: 'Confirm Action',
      description: 'Review and confirm',
      status: 'pending' as const
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!redemption || !decision) return

    try {
      if (decision === 'approve') {
        await approveMutation.mutateAsync({ id: redemption.id, comment: notes || undefined })
        toast.success('Redemption approved successfully')
      } else {
        await rejectMutation.mutateAsync({
          id: redemption.id,
          reason: reason || 'No reason provided'
        })
        toast.success('Redemption rejected successfully')
      }
      onComplete?.()
      onOpenChange(false)
      resetWorkflow()
    } catch (error) {
      toast.error(`Failed to ${decision} redemption`)
    }
  }

  const resetWorkflow = () => {
    setCurrentStep(0)
    setDecision(null)
    setReason('')
    setNotes('')
  }

  const handleClose = () => {
    onOpenChange(false)
    resetWorkflow()
  }

  
  const isLoadingAction = approveMutation.isPending || rejectMutation.isPending

  if (!redemptionId || !redemption) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redemption Approval Workflow</DialogTitle>
          <DialogDescription>
            Process redemption request ID: {redemption.id}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="py-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <ReviewStep
              redemption={redemption}
              onNext={handleNext}
            />
          )}
          {currentStep === 1 && (
            <DecisionStep
              redemption={redemption}
              decision={decision}
              onDecisionChange={setDecision}
              reason={reason}
              onReasonChange={setReason}
              notes={notes}
              onNotesChange={setNotes}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 2 && (
            <ConfirmationStep
              redemption={redemption}
              decision={decision!}
              reason={reason}
              notes={notes}
              onSubmit={handleSubmit}
              onPrevious={handlePrevious}
              isSubmitting={isLoadingAction}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}