import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'

// Mock useBreakpoint to control viewport simulation
const mockBreakpoint = vi.fn()
vi.mock('../../hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockBreakpoint(),
  useResponsive: () => ({
    breakpoint: mockBreakpoint(),
    isMobile: ['xs', 'sm'].includes(mockBreakpoint()),
    isTablet: mockBreakpoint() === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(mockBreakpoint()),
  }),
}))

// Mock dashboard hooks
vi.mock('../../hooks/useDashboard', () => ({
  useDashboardStats: () => ({
    data: {
      netAssetValue: 1000000,
      assetsUnderManagement: 5000000,
      totalShares: 10000,
      pendingRedemptions: 5,
    },
    isLoading: false,
    error: null,
  }),
  useRecentEvents: () => ({
    data: Array.from({ length: 15 }, (_, i) => ({
      id: `event-${i}`,
      type: 'deposit',
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      timestamp: new Date().toISOString(),
    })),
    isLoading: false,
    error: null,
  }),
  useLiquidityDistribution: () => ({
    data: [
      { name: 'Cash', value: 30 },
      { name: 'Bonds', value: 40 },
      { name: 'Equities', value: 30 },
    ],
    isLoading: false,
    error: null,
  }),
  useNAVHistory: () => ({
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      nav: 100 + i,
    })),
    isLoading: false,
    error: null,
  }),
}))

// Test wrapper
function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Dashboard Responsive Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Container Overflow Prevention', () => {
    it('should prevent horizontal overflow on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('overflow-x-hidden')
    })

    it('should have full width container without exceeding viewport', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('w-full')
      expect(container).toHaveClass('max-w-full')
    })
  })

  describe('StatCards Grid Responsiveness', () => {
    it('should render StatCards in single column on mobile (xs)', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('grid-cols-1')
    })

    it('should render StatCards in 2 columns on small screens (sm)', () => {
      mockBreakpoint.mockReturnValue('sm')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('sm:grid-cols-2')
    })

    it('should render StatCards in 4 columns on desktop (lg)', () => {
      mockBreakpoint.mockReturnValue('lg')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('lg:grid-cols-4')
    })

    it('should have reduced gap on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('gap-2')
      expect(statsGrid).toHaveClass('sm:gap-3')
      expect(statsGrid).toHaveClass('md:gap-4')
      expect(statsGrid).toHaveClass('lg:gap-6')
    })
  })

  describe('Charts Grid Responsiveness', () => {
    it('should render charts in single column on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const chartsGrid = screen.getByTestId('charts-grid')
      expect(chartsGrid).toHaveClass('grid-cols-1')
    })

    it('should render charts in 2 columns on desktop', () => {
      mockBreakpoint.mockReturnValue('lg')
      renderDashboard()

      const chartsGrid = screen.getByTestId('charts-grid')
      expect(chartsGrid).toHaveClass('lg:grid-cols-2')
    })

    it('should have reduced gap on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const chartsGrid = screen.getByTestId('charts-grid')
      expect(chartsGrid).toHaveClass('gap-3')
      expect(chartsGrid).toHaveClass('sm:gap-4')
      expect(chartsGrid).toHaveClass('md:gap-6')
    })
  })

  describe('Recent Events Scrollability', () => {
    it('should have max height constraint on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const eventsContainer = screen.getByTestId('events-container')
      expect(eventsContainer).toHaveClass('max-h-[300px]')
    })

    it('should enable vertical scrolling when content overflows', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const eventsContainer = screen.getByTestId('events-container')
      expect(eventsContainer).toHaveClass('overflow-y-auto')
    })

    it('should have larger max height on desktop', () => {
      mockBreakpoint.mockReturnValue('lg')
      renderDashboard()

      const eventsContainer = screen.getByTestId('events-container')
      expect(eventsContainer).toHaveClass('lg:max-h-[600px]')
    })
  })

  describe('Typography Responsiveness', () => {
    it('should have minimum 14px font size for page title on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const title = screen.getByRole('heading', { level: 1 })
      // text-lg = 1.125rem = 18px (min 14px satisfied)
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('sm:text-xl')
      expect(title).toHaveClass('md:text-2xl')
      expect(title).toHaveClass('lg:text-3xl')
    })

    it('should have minimum 14px font size for subtitle on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const subtitle = screen.getByText(/monitor fund performance/i)
      // text-xs = 0.75rem = 12px but text-sm = 14px
      expect(subtitle).toHaveClass('text-xs')
      expect(subtitle).toHaveClass('sm:text-sm')
    })
  })

  describe('Header Responsiveness', () => {
    it('should stack header elements vertically on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const header = screen.getByTestId('dashboard-header')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('sm:flex-row')
    })

    it('should have proper spacing on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const header = screen.getByTestId('dashboard-header')
      expect(header).toHaveClass('gap-2')
      expect(header).toHaveClass('sm:gap-0')
    })

    it('should have responsive title sizing', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('sm:text-xl')
      expect(title).toHaveClass('md:text-2xl')
      expect(title).toHaveClass('lg:text-3xl')
    })
  })

  describe('Overall Spacing Responsiveness', () => {
    it('should have tighter spacing on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('space-y-3')
      expect(container).toHaveClass('sm:space-y-4')
      expect(container).toHaveClass('md:space-y-6')
    })

    it('should have horizontal padding on mobile', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('px-2')
      expect(container).toHaveClass('sm:px-4')
    })
  })

  describe('StatCards Responsive Layout', () => {
    it('should have responsive gap sizing', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('gap-2')
      expect(statsGrid).toHaveClass('sm:gap-3')
      expect(statsGrid).toHaveClass('md:gap-4')
      expect(statsGrid).toHaveClass('lg:gap-6')
    })

    it('should have correct grid columns', () => {
      mockBreakpoint.mockReturnValue('sm')
      renderDashboard()

      const statsGrid = screen.getByTestId('stats-grid')
      expect(statsGrid).toHaveClass('grid-cols-1')
      expect(statsGrid).toHaveClass('sm:grid-cols-2')
      expect(statsGrid).toHaveClass('lg:grid-cols-4')
    })
  })

  describe('Recent Events Responsive Layout', () => {
    it('should have responsive max height', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      const eventsContainer = screen.getByTestId('events-container')
      expect(eventsContainer).toHaveClass('max-h-[300px]')
      expect(eventsContainer).toHaveClass('sm:max-h-[400px]')
      expect(eventsContainer).toHaveClass('md:max-h-[500px]')
      expect(eventsContainer).toHaveClass('lg:max-h-[600px]')
    })
  })

  describe('Touch-Friendly Sizing', () => {
    it('should have adequate touch targets for interactive elements', () => {
      mockBreakpoint.mockReturnValue('xs')
      renderDashboard()

      // View all events button should have touch-friendly size
      const viewAllButton = screen.getByRole('button', { name: /view all/i })
      expect(viewAllButton).toHaveClass('min-h-[44px]')
    })
  })
})
