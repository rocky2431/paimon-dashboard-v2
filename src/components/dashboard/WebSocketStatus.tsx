import { Badge } from '../ui/badge'
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react'
import type { ConnectionInfo } from '../../lib/websocket-types'

interface WebSocketStatusProps {
  connectionInfo: ConnectionInfo
  showDetails?: boolean
}

export default function WebSocketStatus({ connectionInfo, showDetails = false }: WebSocketStatusProps) {
  const { connectionState, lastError, reconnectAttempts } = connectionInfo

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'Real-time',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white'
        }
      case 'connecting':
        return {
          icon: Loader2,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'border-blue-300 text-blue-700',
          spin: true
        }
      case 'reconnecting':
        return {
          icon: Loader2,
          label: `Reconnecting... (${reconnectAttempts})`,
          variant: 'secondary' as const,
          className: 'border-yellow-300 text-yellow-700',
          spin: true
        }
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'Connection Error',
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white'
        }
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          label: 'Offline',
          variant: 'outline' as const,
          className: 'border-gray-300 text-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="flex flex-col items-end gap-1">
      <Badge
        variant={config.variant}
        className={`${config.className} ${config.spin ? 'animate-pulse' : ''}`}
      >
        <Icon className={`h-3 w-3 mr-1 ${config.spin ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>

      {showDetails && lastError && (
        <div className="text-xs text-red-600 dark:text-red-400 max-w-xs text-right">
          {lastError}
        </div>
      )}

      {showDetails && reconnectAttempts > 0 && connectionState === 'reconnecting' && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          Attempt {reconnectAttempts}...
        </div>
      )}
    </div>
  )
}