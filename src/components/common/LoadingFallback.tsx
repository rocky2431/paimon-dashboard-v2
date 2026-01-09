import { cn } from '../../lib/utils'

interface LoadingFallbackProps {
  className?: string
  message?: string
}

export default function LoadingFallback({
  className,
  message = 'Loading...'
}: LoadingFallbackProps = {}) {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-[400px] w-full",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}