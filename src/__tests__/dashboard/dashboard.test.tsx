import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'

// Mock the hooks
vi.mock('../../hooks/useDashboard', () => ({
  useDashboardStats: vi.fn(),
  useRecentEvents: vi.fn(),
  useLiquidityDistribution: vi.fn(),
  useNAVHistory: vi.fn(),
}))

// Mock Recharts to avoid canvas rendering issues in tests
vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render dashboard with loading states', async () => {
    const { useDashboardStats, useRecentEvents, useLiquidityDistribution, useNAVHistory } =
      await import('../../hooks/useDashboard')

    vi.mocked(useDashboardStats).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(useRecentEvents).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(useLiquidityDistribution).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(useNAVHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Check main heading
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    expect(screen.getByText('Monitor fund performance and key metrics')).toBeInTheDocument()

    // Check loading states for stat cards
    expect(screen.getAllByText(/Loading/)).toHaveLength(4)
  })

  it('should render dashboard with data', async () => {
    const { useDashboardStats, useRecentEvents, useLiquidityDistribution, useNAVHistory } =
      await import('../../hooks/useDashboard')

    const mockStats = {
      netAssetValue: 1234567.89,
      assetsUnderManagement: 5678901.23,
      totalShares: 45678,
      pendingRedemptions: 23,
      lastUpdated: new Date().toISOString(),
    }

    const mockEvents = [
      {
        id: '1',
        type: 'redemption' as const,
        title: 'Test Event',
        description: 'Test Description',
        timestamp: new Date().toISOString(),
        severity: 'low' as const,
        status: 'pending' as const,
      }
    ]

    const mockLiquidity = [
      {
        category: 'Cash',
        value: 1000000,
        percentage: 50,
        color: '#10b981'
      }
    ]

    const mockNavHistory = [
      {
        date: '2024-01-01',
        value: 1000000,
        change: 1000,
        changePercent: 0.1
      }
    ]

    vi.mocked(useDashboardStats).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useRecentEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useLiquidityDistribution).mockReturnValue({
      data: mockLiquidity,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useNAVHistory).mockReturnValue({
      data: mockNavHistory,
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Check stat cards
    expect(screen.getByText('Net Asset Value')).toBeInTheDocument()
    expect(screen.getByText('Assets Under Management')).toBeInTheDocument()
    expect(screen.getByText('Total Shares')).toBeInTheDocument()
    expect(screen.getByText('Pending Redemptions')).toBeInTheDocument()

    // Check charts
    expect(screen.getByText('NAV Performance')).toBeInTheDocument()
    expect(screen.getByText('Liquidity Distribution')).toBeInTheDocument()

    // Check recent events
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('should render error states when data fetching fails', async () => {
    const { useDashboardStats, useRecentEvents } =
      await import('../../hooks/useDashboard')

    vi.mocked(useDashboardStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch stats'),
    } as any)

    vi.mocked(useRecentEvents).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch events'),
    } as any)

    vi.mocked(useLiquidityDistribution).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch liquidity'),
    } as any)

    vi.mocked(useNAVHistory).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch NAV'),
    } as any)

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Check error messages
    await waitFor(() => {
      expect(screen.getByText('Error loading NAV data')).toBeInTheDocument()
      expect(screen.getByText('Error loading recent events')).toBeInTheDocument()
      expect(screen.getByText('Error loading liquidity data')).toBeInTheDocument()
      expect(screen.getByText('Error loading NAV history')).toBeInTheDocument()
    })
  })

  it('should render chart components with correct props', async () => {
    const { useLiquidityDistribution, useNAVHistory } =
      await import('../../hooks/useDashboard')

    vi.mocked(useDashboardStats).mockReturnValue({
      data: {
        netAssetValue: 1000000,
        assetsUnderManagement: 5000000,
        totalShares: 1000,
        pendingRedemptions: 5,
        lastUpdated: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useRecentEvents).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useLiquidityDistribution).mockReturnValue({
      data: [
        { category: 'Cash', value: 1000000, percentage: 50, color: '#10b981' }
      ],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useNAVHistory).mockReturnValue({
      data: [
        { date: '2024-01-01', value: 1000000, change: 1000, changePercent: 0.1 }
      ],
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Check that Recharts components are rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})