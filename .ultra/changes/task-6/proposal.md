# Feature: Setup TanStack Query provider and configuration

**Task ID**: 6
**Status**: In Progress
**Branch**: feat/task-6-tanstack-query

## Overview
Implement TanStack Query (React Query) as the state management solution for server state. Configure QueryClient with optimized default options and integrate QueryClientProvider into the React application root.

## Rationale
TanStack Query provides:
- **Server State Management**: Automatic caching, background refetching, and stale-while-revalidate strategies
- **Performance Optimization**: Deduplication of requests, pagination, and infinite loading
- **Developer Experience**: Simplified async state handling with hooks-based API
- **Type Safety**: Full TypeScript support with proper inference
- **DevTools**: Excellent debugging and visualization tools

## Impact Assessment
- **User Stories Affected**: All future data-fetching user stories
- **Architecture Changes**: Yes - Adds server state management layer
- **Breaking Changes**: No - This is foundational setup

## Requirements Trace
- Traces to: specs/architecture.md#state-management-strategy
- Integrates with existing API client (Task #5)
- Provides foundation for all future data operations
- Supports real-time data updates with WebSocket integration

## Technical Implementation Plan

### 1. TanStack Query Configuration
- Install @tanstack/react-query and @tanstack/react-query-devtools
- Create QueryClient with optimized default options
- Configure staleTime, cacheTime, retry strategies
- Setup error boundaries for query errors

### 2. QueryClient Default Options
- **staleTime**: 5 minutes for most queries
- **cacheTime**: 10 minutes for memory management
- **retry**: 3 attempts with exponential backoff
- **refetchOnWindowFocus**: Enabled in development only
- **retryDelay**: Exponential backoff strategy
- **queries**: Default error handling and loading states

### 3. QueryClientProvider Integration
- Wrap App component with QueryClientProvider
- Add ReactQueryDevtools in development
- Setup error boundaries for query failures
- Ensure proper provider hierarchy with Router

### 4. Custom Hooks and Utilities
- Create useQueryWrapper for consistent error handling
- Implement useMutationWrapper for mutations
- Add query key factory for consistent key management
- Setup optimistic update patterns

### 5. Performance Optimization
- Configure query deduplication
- Setup background refetching strategies
- Implement query invalidation patterns
- Add memory management for large datasets

## Query Configuration Strategy

### Default Query Options
```typescript
{
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: import.meta.env.DEV,
  refetchOnReconnect: true,
}
```

### Mutation Configuration
```typescript
{
  retry: 1,
  onError: (error) => {
    // Global error handling
  },
  onSuccess: (data) => {
    // Global success handling
  },
}
```

### Query Key Structure
```
queries/
├── dashboard: ['dashboard']
├── redemptions: ['redemptions', { page, status }]
├── redemption: ['redemption', id]
├── risk: ['risk', { type, timeframe }]
└── user: ['user', 'profile']
```

## Integration Points
- **API Client**: Use existing Axios client from Task #5
- **Error Handling**: Integrate with Toast notifications
- **Authentication**: Handle 401 errors with auth store
- **Routing**: Navigate on auth failures
- **WebSocket**: Integration for real-time updates

## Testing Strategy
- Unit tests for custom hooks and utilities
- Integration tests for query/mutation flows
- Performance testing for large datasets
- Error boundary testing
- DevTools integration verification

## Future Extensions
- GraphQL integration with @tanstack/react-query-graphql
- Offline support with @tanstack/react-query-persist-client
- Real-time updates with WebSocket integration
- Advanced caching strategies with query invalidation
- Server state synchronization with optimistic updates

## Performance Targets
- <50ms initial query response time
- <200ms background refetch response time
- <100MB memory usage for query cache
- 95% cache hit ratio for frequently accessed data
- <5 queries per second for API throttling