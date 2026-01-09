import { QueryClient } from '@tanstack/react-query'

// Create QueryClient with optimized default options
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes in milliseconds

        // Cache data in memory for 10 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes in milliseconds (formerly cacheTime)

        // Retry failed requests up to 3 times
        retry: 3,

        // Exponential backoff with 30 second max delay
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30 * 1000),

        // Refetch on window focus only in development
        refetchOnWindowFocus: import.meta.env.DEV,

        // Always refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount if data is stale
        refetchOnMount: true,

        // Enable background refetching
        refetchIntervalInBackground: false,

        // Default error handling
        throwOnError: false,

        },
      mutations: {
        // Retry mutations once (often not needed for mutations)
        retry: 1,

        // Exponential backoff for mutations
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30 * 1000),

        // Don't throw errors by default (let components handle them)
        throwOnError: false,

        // Default mutation options
        onMutate: undefined,
        onSuccess: undefined,
        onError: undefined,
        onSettled: undefined,
      },
    },
  })
}

// Singleton QueryClient instance
let queryClient: QueryClient | null = null

export const getQueryClient = (): QueryClient => {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}

// Reset QueryClient (useful for testing)
export const resetQueryClient = (): void => {
  if (queryClient) {
    queryClient.clear()
    queryClient = null
  }
}