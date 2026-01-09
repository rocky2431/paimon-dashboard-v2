import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  DollarSign,
  CheckSquare
} from 'lucide-react'
import type { RecentEvent } from '../../types/dashboard'
import { dashboardService } from '../../services/dashboardService'

interface RecentEventsProps {
  events: RecentEvent[]
  loading?: boolean
  error?: string
  maxItems?: number
}

const getEventIcon = (type: RecentEvent['type']) => {
  switch (type) {
    case 'redemption':
      return <DollarSign className="h-4 w-4 text-blue-500" />
    case 'deposit':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'rebalance':
      return <Settings className="h-4 w-4 text-purple-500" />
    case 'risk_alert':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'approval':
      return <CheckSquare className="h-4 w-4 text-yellow-500" />
    case 'system':
      return <CheckCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getSeverityColor = (severity?: RecentEvent['severity']) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status?: RecentEvent['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function RecentEvents({ events, loading, error, maxItems = 5 }: RecentEventsProps) {
  const displayEvents = events.slice(0, maxItems)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Error loading recent activity</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (displayEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Activity will appear here as it happens</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Badge variant="outline" className="text-xs">
          {displayEvents.length} events
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  {event.severity && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSeverityColor(event.severity)}`}
                    >
                      {event.severity}
                    </Badge>
                  )}
                  {event.status && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{dashboardService.formatTimestamp(event.timestamp)}</span>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <span className="text-blue-600">
                      {Object.keys(event.metadata).length} detail{Object.keys(event.metadata).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {events.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              View all {events.length} events →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentEvents