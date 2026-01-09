/**
 * ExecutionModal Component
 *
 * Modal for confirming and executing rebalance operations
 * Includes wallet signature confirmation step
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Loader2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RebalancePreview } from '@/types/rebalancing'

export interface ExecutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: RebalancePreview | null
  onConfirm: () => Promise<void>
  executionStatus?: ExecutionStatus
}

export interface ExecutionStatus {
  stage: 'idle' | 'confirming' | 'signing' | 'executing' | 'completed' | 'failed'
  progress: number
  message: string
  txHash?: string
  error?: string
}

type Step = 'review' | 'confirm' | 'sign' | 'execute' | 'complete'

const steps: { id: Step; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'sign', label: 'Sign' },
  { id: 'execute', label: 'Execute' },
  { id: 'complete', label: 'Complete' },
]

// Step indicator component
function StepIndicator({ currentStep, status }: { currentStep: Step; status?: ExecutionStatus }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex || (status?.stage === 'completed' && index <= currentIndex)
        const isCurrent = index === currentIndex
        const isFailed = status?.stage === 'failed' && isCurrent

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                  isCompleted && 'bg-green-600 border-green-600 text-white',
                  isCurrent && !isFailed && 'bg-primary border-primary text-primary-foreground',
                  isFailed && 'bg-red-600 border-red-600 text-white',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isFailed ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                'text-xs mt-1',
                (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2 mt-[-16px]',
                  index < currentIndex ? 'bg-green-600' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Review step content
function ReviewStep({ preview }: { preview: RebalancePreview }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Rebalance Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Trades</p>
            <p className="font-semibold">{preview.trades.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estimated Gas</p>
            <p className="font-semibold">{preview.estimatedGas.toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Slippage</p>
            <p className="font-semibold">{preview.estimatedSlippage.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">New Deviation</p>
            <p className="font-semibold text-green-600">{preview.impact.expectedDeviation.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Trades Preview</h4>
        <div className="space-y-2">
          {preview.trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{trade.fromAsset}</Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">{trade.toAsset}</Badge>
              </div>
              <span className="font-mono">${(trade.fromAmount / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Confirm step content
function ConfirmStep({
  confirmations,
  onToggle,
}: {
  confirmations: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  const checks = [
    { key: 'reviewed', label: 'I have reviewed all proposed trades and their impact' },
    { key: 'slippage', label: 'I understand the slippage tolerance and accept potential price variations' },
    { key: 'gas', label: 'I confirm sufficient funds are available for gas fees' },
    { key: 'irreversible', label: 'I understand this action is irreversible once executed' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Please confirm the following before proceeding
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            All confirmations are required to execute the rebalance
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map(check => (
          <div key={check.key} className="flex items-start space-x-3">
            <Checkbox
              id={check.key}
              checked={confirmations[check.key] || false}
              onCheckedChange={() => onToggle(check.key)}
            />
            <label
              htmlFor={check.key}
              className="text-sm leading-tight cursor-pointer"
            >
              {check.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sign step content
function SignStep({ status }: { status?: ExecutionStatus }) {
  const isWaiting = status?.stage === 'signing'

  return (
    <div className="text-center py-6">
      <div className={cn(
        'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
        isWaiting ? 'bg-primary/10 animate-pulse' : 'bg-muted'
      )}>
        <Wallet className={cn('h-8 w-8', isWaiting ? 'text-primary' : 'text-muted-foreground')} />
      </div>
      <h4 className="font-semibold mb-2">
        {isWaiting ? 'Waiting for Wallet Signature' : 'Sign Transaction'}
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        {isWaiting
          ? 'Please confirm the transaction in your wallet...'
          : 'Click below to sign the rebalance transaction with your wallet'
        }
      </p>
      {isWaiting && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Awaiting signature...
        </div>
      )}
    </div>
  )
}

// Execute step content
function ExecuteStep({ status }: { status?: ExecutionStatus }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <h4 className="font-semibold mb-2">Executing Rebalance</h4>
      <p className="text-sm text-muted-foreground mb-4">
        {status?.message || 'Processing trades...'}
      </p>
      <Progress value={status?.progress || 0} className="w-full max-w-xs mx-auto" />
      <p className="text-xs text-muted-foreground mt-2">
        {status?.progress || 0}% complete
      </p>
      {status?.txHash && (
        <p className="text-xs text-muted-foreground mt-4 font-mono">
          TX: {status.txHash.slice(0, 10)}...{status.txHash.slice(-8)}
        </p>
      )}
    </div>
  )
}

// Complete step content
function CompleteStep({ status }: { status?: ExecutionStatus }) {
  const isSuccess = status?.stage === 'completed'

  return (
    <div className="text-center py-6">
      <div className={cn(
        'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
        isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
      )}>
        {isSuccess ? (
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        ) : (
          <XCircle className="h-8 w-8 text-red-600" />
        )}
      </div>
      <h4 className="font-semibold mb-2">
        {isSuccess ? 'Rebalance Complete!' : 'Rebalance Failed'}
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        {isSuccess
          ? 'All trades have been executed successfully'
          : status?.error || 'An error occurred during execution'
        }
      </p>
      {isSuccess && status?.txHash && (
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://etherscan.io/tx/${status.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </Button>
      )}
    </div>
  )
}

export function ExecutionModal({
  open,
  onOpenChange,
  preview,
  onConfirm,
  executionStatus,
}: ExecutionModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('review')
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({})

  const allConfirmed = ['reviewed', 'slippage', 'gas', 'irreversible'].every(
    key => confirmations[key]
  )

  const handleToggleConfirmation = (key: string) => {
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNext = async () => {
    if (currentStep === 'review') {
      setCurrentStep('confirm')
    } else if (currentStep === 'confirm' && allConfirmed) {
      setCurrentStep('sign')
      // Trigger wallet signing
      try {
        await onConfirm()
        setCurrentStep('execute')
      } catch {
        // Stay on sign step if failed
      }
    }
  }

  const handleClose = () => {
    if (executionStatus?.stage !== 'executing') {
      setCurrentStep('review')
      setConfirmations({})
      onOpenChange(false)
    }
  }

  // Auto-advance based on execution status
  if (executionStatus?.stage === 'executing' && currentStep !== 'execute') {
    setCurrentStep('execute')
  }
  if ((executionStatus?.stage === 'completed' || executionStatus?.stage === 'failed') && currentStep !== 'complete') {
    setCurrentStep('complete')
  }

  if (!preview) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Execute Rebalance</DialogTitle>
          <DialogDescription>
            Follow the steps below to execute the rebalance operation
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} status={executionStatus} />

        <div className="min-h-[300px]">
          {currentStep === 'review' && <ReviewStep preview={preview} />}
          {currentStep === 'confirm' && (
            <ConfirmStep
              confirmations={confirmations}
              onToggle={handleToggleConfirmation}
            />
          )}
          {currentStep === 'sign' && <SignStep status={executionStatus} />}
          {currentStep === 'execute' && <ExecuteStep status={executionStatus} />}
          {currentStep === 'complete' && <CompleteStep status={executionStatus} />}
        </div>

        <DialogFooter>
          {currentStep === 'review' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Continue
              </Button>
            </>
          )}
          {currentStep === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('review')}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!allConfirmed}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Sign & Execute
              </Button>
            </>
          )}
          {currentStep === 'sign' && (
            <Button variant="outline" onClick={handleClose} disabled={executionStatus?.stage === 'signing'}>
              Cancel
            </Button>
          )}
          {currentStep === 'complete' && (
            <Button onClick={handleClose}>
              {executionStatus?.stage === 'completed' ? 'Done' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
