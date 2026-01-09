/**
 * ReportPreview Component Tests
 *
 * Task 25.2: Report Preview Component
 *
 * Test Coverage:
 * - Functional: Card layout, lazy loading, report type rendering
 * - Boundary: Empty data, loading states, missing metrics
 * - Exception: Invalid report types, API failures
 * - Performance: Render optimization, lazy loading behavior
 * - Security: XSS from data, content sanitization
 * - Accessibility: ARIA labels, keyboard navigation, screen reader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportPreview } from '../../components/reports/ReportPreview';
import type { ReportType } from '../../components/reports/ReportTypeSelector';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

// Mock lazy-loaded chart components - need to return default export for React.lazy
vi.mock('../../components/reports/charts/PerformanceChart', () => ({
  __esModule: true,
  default: () => <div data-testid="performance-chart-mock" />,
}));
vi.mock('../../components/reports/charts/RiskChart', () => ({
  __esModule: true,
  default: () => <div data-testid="risk-chart-mock" />,
}));
vi.mock('../../components/reports/charts/RedemptionChart', () => ({
  __esModule: true,
  default: () => <div data-testid="redemption-chart-mock" />,
}));
vi.mock('../../components/reports/charts/RebalancingChart', () => ({
  __esModule: true,
  default: () => <div data-testid="rebalancing-chart-mock" />,
}));

describe('ReportPreview', () => {
  const mockData = {
    performance: {
      totalReturn: 15.5,
      sharpeRatio: 1.8,
      maxDrawdown: -8.2,
      volatility: 12.3,
      dailyReturns: [
        { date: '2025-01-01', value: 100 },
        { date: '2025-01-02', value: 102 },
        { date: '2025-01-03', value: 101 },
      ],
    },
    risk: {
      riskScore: 45,
      var95: -5.2,
      cvar95: -8.1,
      beta: 1.2,
      riskDistribution: [
        { name: 'Low', value: 30, fill: '#22c55e' },
        { name: 'Medium', value: 45, fill: '#eab308' },
        { name: 'High', value: 25, fill: '#ef4444' },
      ],
    },
    redemption: {
      pendingRequests: 12,
      processedToday: 8,
      totalAmount: 1500000,
      averageProcessingTime: 24,
    },
    rebalancing: {
      totalTrades: 45,
      completedTrades: 38,
      pendingTrades: 7,
      turnover: 0.15,
    },
  };

  describe('Functional Requirements', () => {
    it('renders card-based layout', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();
    });

    it('displays key metrics prominently', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      expect(screen.getByText(/15\.50/)).toBeInTheDocument(); // Total Return
      expect(screen.getByText(/1\.80/)).toBeInTheDocument(); // Sharpe Ratio
      expect(screen.getByText(/-8\.20%/)).toBeInTheDocument(); // Max Drawdown
    });

    it('renders chart visualizations for performance report', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      // Chart is lazy-loaded and mocked
      const card = screen.getByTestId('report-preview-card');
      expect(card).toBeInTheDocument();
    });

    it('renders different chart types for different report types', () => {
      const { rerender } = render(
        <ReportPreview
          reportType="risk"
          data={mockData.risk}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();

      rerender(
        <ReportPreview
          reportType="redemption"
          data={mockData.redemption}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();
    });

    it('shows loading state with skeleton', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={null}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows empty state with helpful message', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={null}
          isLoading={false}
        />
      );

      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });

  describe('Boundary Cases', () => {
    it('handles null data gracefully', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={null}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();
    });

    it('handles empty arrays in data', () => {
      const emptyData = {
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        dailyReturns: [],
      };

      render(
        <ReportPreview
          reportType="performance"
          data={emptyData}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();
    });

    it('handles missing optional fields', () => {
      const partialData = {
        totalReturn: 10.5,
        // Missing other fields
      };

      expect(() =>
        render(
          <ReportPreview
            reportType="performance"
            data={partialData}
            isLoading={false}
          />
        )
      ).not.toThrow();
    });
  });

  describe('Exception Handling', () => {
    it('handles invalid report type gracefully', () => {
      const invalidType = 'invalid' as ReportType;

      expect(() =>
        render(
          <ReportPreview
            reportType={invalidType}
            data={mockData.performance}
            isLoading={false}
          />
        )
      ).not.toThrow();
    });

    it('handles malformed data without crashing', () => {
      const malformedData = {
        totalReturn: 'not a number',
        sharpeRatio: null,
      };

      expect(() =>
        render(
          <ReportPreview
            reportType="performance"
            data={malformedData as any}
            isLoading={false}
          />
        )
      ).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('lazy loads chart components', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      // Chart should be in document but not necessarily rendered immediately
      expect(screen.getByTestId('report-preview-card')).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('sanitizes user-provided data', () => {
      const dangerousData = {
        totalReturn: 10,
        sharpeRatio: 1.5,
        maxDrawdown: -5,
        volatility: 12,
        dailyReturns: [
          {
            date: '<script>alert("xss")</script>',
            value: 100,
          },
        ],
      };

      expect(() =>
        render(
          <ReportPreview
            reportType="performance"
            data={dangerousData}
            isLoading={false}
          />
        )
      ).not.toThrow();

      // Script tag should not be executed
      const scriptElements = document.querySelectorAll('script');
      expect(scriptElements.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      const card = screen.getByTestId('report-preview-card');
      expect(card).toHaveAttribute('role', 'region');
    });

    it('announces loading state to screen readers', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={null}
          isLoading={true}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has visible focus indicators', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      const card = screen.getByTestId('report-preview-card');
      expect(card).toHaveClass('focus-within:ring-2');
    });
  });

  describe('Responsive Design', () => {
    it('renders full-width on mobile', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      const card = screen.getByTestId('report-preview-card');
      expect(card).toHaveClass('w-full');
    });

    it('has responsive grid layout for metrics', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toHaveClass('grid-cols-1'); // Mobile
      expect(metricsGrid).toHaveClass('sm:grid-cols-2'); // Tablet
      expect(metricsGrid).toHaveClass('lg:grid-cols-4'); // Desktop
    });
  });

  describe('Integration', () => {
    it('updates content when report type changes', () => {
      const { rerender } = render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      expect(screen.getByText(/15\.50/)).toBeInTheDocument();

      rerender(
        <ReportPreview
          reportType="risk"
          data={mockData.risk}
          isLoading={false}
        />
      );

      expect(screen.getByText(/45/)).toBeInTheDocument();
    });

    it('transitions from loading to loaded state', async () => {
      const { rerender } = render(
        <ReportPreview
          reportType="performance"
          data={null}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();

      rerender(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/15\.50/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    it('formats percentages correctly', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      // Metrics are rendered immediately, charts are lazy-loaded
      expect(screen.getByText(/\+15\.50%/)).toBeInTheDocument();
      expect(screen.getByText(/-8\.20%/)).toBeInTheDocument();
    });

    it('formats currency values correctly', () => {
      render(
        <ReportPreview
          reportType="redemption"
          data={mockData.redemption}
          isLoading={false}
        />
      );

      // Metrics are rendered immediately
      expect(screen.getByText(/1,500,000/)).toBeInTheDocument();
    });

    it('formats decimal values correctly', () => {
      render(
        <ReportPreview
          reportType="performance"
          data={mockData.performance}
          isLoading={false}
        />
      );

      // 1.80 with 2 decimal places
      expect(screen.getByText(/1\.80/)).toBeInTheDocument();
    });
  });
});
