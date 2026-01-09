import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { Activity, Zap } from 'lucide-react'

interface RealTimeIndicatorProps {
  isConnected: boolean
}

export default function RealTimeIndicator({ isConnected }: RealTimeIndicatorProps) {
  const [showPulse, setShowPulse] = useState(false)

  useEffect(() => {
    if (!isConnected) return

    // Show pulse when new data comes in
    const interval = setInterval(() => {
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 1000)
    }, 5000 + Math.random() * 10000) // Random interval between 5-15 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  if (!isConnected) return null

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`${showPulse ? 'bg-green-50 border-green-300 text-green-700 animate-pulse' : 'border-gray-300'}`}
      >
        <Activity className={`h-3 w-3 mr-1 ${showPulse ? 'animate-spin' : ''}`} />
        {showPulse ? 'Updating...' : 'Real-time'}
      </Badge>

      {showPulse && (
        <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
      )}
    </div>
  )
}