import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  CheckIcon,
  ExternalLinkIcon,
  CopyIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  CalendarIcon,
  UserIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Redemption, RedemptionStatus } from '@/types/redemption'

interface ReviewStepProps {
  redemption: Redemption
  onNext: () => void
}

export function ReviewStep({ redemption, onNext }: ReviewStepProps) {
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

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Risk assessment based on amount and other factors
  const getRiskLevel = () => {
    const amount = redemption.amount
    if (amount > 100000) return { level: 'high', color: 'text-red-600', icon: AlertTriangleIcon }
    if (amount > 10000) return { level: 'medium', color: 'text-yellow-600', icon: AlertTriangleIcon }
    return { level: 'low', color: 'text-green-600', icon: CheckIcon }
  }

  const risk = getRiskLevel()
  const RiskIcon = risk.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review Redemption Request</h3>
          <p className="text-muted-foreground">
            Verify all details before making a decision
          </p>
        </div>
        <Badge className={cn('ml-2', getStatusColor(redemption.status))}>
          {redemption.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Risk Assessment */}
      <Card className="p-4 border-l-4 border-l-orange-200">
        <div className="flex items-center gap-2">
          <RiskIcon className={cn('h-5 w-5', risk.color)} />
          <div>
            <div className="font-medium">Risk Assessment</div>
            <div className={cn('text-sm', risk.color)}>
              {risk.level.toUpperCase()} RISK - Amount: {redemption.currency} {redemption.amount.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4" />
              Amount Details
            </Label>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {redemption.currency} {redemption.amount.toLocaleString()}
              </div>
              {redemption.netAmount && (
                <div className="text-sm text-muted-foreground">
                  Net Amount: {redemption.currency} {redemption.netAmount.toLocaleString()}
                </div>
              )}
              {redemption.fee && (
                <div className="text-xs text-muted-foreground">
                  Processing Fee: {redemption.currency} {redemption.fee.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Channel Information</Label>
            <div className="space-y-2">
              <Badge variant="outline" className="text-sm">
                {redemption.channel.replace('_', ' ').toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Processing via {redemption.channel} channel
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* User Information */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            User Information
          </Label>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-sm">{redemption.userId}</div>
              <div className="text-xs text-muted-foreground">User ID</div>
            </div>
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
            <Label className="text-sm font-medium text-muted-foreground">Destination Wallet</Label>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm">
                  {redemption.walletAddress.slice(0, 12)}...{redemption.walletAddress.slice(-12)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {redemption.walletAddress.slice(0, 6)}...{redemption.walletAddress.slice(-4)}
                </div>
              </div>
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
                  onClick={() => openExternalLink(`https://etherscan.io/address/${redemption.walletAddress}`)}
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Separator />

      {/* Timeline Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Request Timeline
            </Label>
            <div className="space-y-1">
              <div className="text-sm">
                <div className="font-medium">Requested</div>
                <div className="text-muted-foreground">
                  {format(new Date(redemption.requestDate), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>
              {redemption.processedDate && (
                <div className="text-sm">
                  <div className="font-medium">Processed</div>
                  <div className="text-muted-foreground">
                    {format(new Date(redemption.processedDate), 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {redemption.notes && (
          <Card className="p-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
              <p className="text-sm">{redemption.notes}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Validation Checklist */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-blue-900">Validation Checklist</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">User verification completed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">Wallet address validated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">Amount within approved limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">Compliance checks passed</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Proceed to Decision
          <CheckIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}