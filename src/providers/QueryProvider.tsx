import { QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '../lib/query-client'

interface QueryProviderProps {
  children: React.ReactNode
  client?: any
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client,
}) => {
  const queryClient = client || getQueryClient()

  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
      {/* Include DevTools only in development mode */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </BaseQueryClientProvider>
  )
}

// Export default for convenience
export default QueryProvider