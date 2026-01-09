import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import DataTable from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

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

// Test data
interface TestItem {
  id: string
  name: string
  status: string
  amount: number
  date: string
}

const testData: TestItem[] = [
  { id: '1', name: 'Item One', status: 'active', amount: 100, date: '2025-01-01' },
  { id: '2', name: 'Item Two', status: 'pending', amount: 200, date: '2025-01-02' },
  { id: '3', name: 'Item Three', status: 'completed', amount: 300, date: '2025-01-03' },
  { id: '4', name: 'Item Four', status: 'active', amount: 400, date: '2025-01-04' },
  { id: '5', name: 'Item Five', status: 'pending', amount: 500, date: '2025-01-05' },
]

const testColumns: ColumnDef<TestItem>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'date', header: 'Date' },
]

describe('DataTable Card View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auto View Mode Switching', () => {
    it('should render as table on desktop (lg breakpoint)', () => {
      mockBreakpoint.mockReturnValue('lg')

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="auto"
        />
      )

      // Should render table element
      expect(screen.getByRole('table')).toBeInTheDocument()
      // Should not render card view
      expect(screen.queryByTestId('datatable-card-view')).not.toBeInTheDocument()
    })

    it('should render as cards on mobile (xs breakpoint)', () => {
      mockBreakpoint.mockReturnValue('xs')

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="auto"
        />
      )

      // Should render card view
      expect(screen.getByTestId('datatable-card-view')).toBeInTheDocument()
      // Should not render table element
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('should render as cards on small screens (sm breakpoint)', () => {
      mockBreakpoint.mockReturnValue('sm')

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="auto"
        />
      )

      expect(screen.getByTestId('datatable-card-view')).toBeInTheDocument()
    })

    it('should render as table on tablet (md breakpoint)', () => {
      mockBreakpoint.mockReturnValue('md')

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="auto"
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  describe('Manual View Mode Override', () => {
    it('should render as table when viewMode="table" regardless of breakpoint', () => {
      mockBreakpoint.mockReturnValue('xs') // Mobile

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="table"
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should render as cards when viewMode="card" regardless of breakpoint', () => {
      mockBreakpoint.mockReturnValue('lg') // Desktop

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
        />
      )

      expect(screen.getByTestId('datatable-card-view')).toBeInTheDocument()
    })
  })

  describe('Card Layout and Content', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render correct number of cards', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
        />
      )

      const cards = screen.getAllByTestId('datatable-card')
      expect(cards).toHaveLength(testData.length)
    })

    it('should display card title from configured column', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          cardConfig={{ titleColumn: 'name' }}
        />
      )

      expect(screen.getByText('Item One')).toBeInTheDocument()
      expect(screen.getByText('Item Two')).toBeInTheDocument()
    })

    it('should display card subtitle from configured column', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          cardConfig={{ titleColumn: 'name', subtitleColumn: 'status' }}
        />
      )

      // Each card should have status as subtitle
      const cards = screen.getAllByTestId('datatable-card')
      expect(within(cards[0]).getByText('active')).toBeInTheDocument()
      expect(within(cards[1]).getByText('pending')).toBeInTheDocument()
    })

    it('should show priority columns prominently', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          cardConfig={{
            titleColumn: 'name',
            priorityColumns: ['amount', 'status']
          }}
        />
      )

      const cards = screen.getAllByTestId('datatable-card')
      // Amount and status should be visible in card body
      expect(within(cards[0]).getByText('100')).toBeInTheDocument()
      expect(within(cards[0]).getByText('active')).toBeInTheDocument()
    })

    it('should hide specified columns in card view', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          cardConfig={{
            titleColumn: 'name',
            hideColumns: ['id', 'date']
          }}
        />
      )

      const cards = screen.getAllByTestId('datatable-card')
      // ID should not be visible (hidden)
      expect(within(cards[0]).queryByText('ID:')).not.toBeInTheDocument()
    })
  })

  describe('Card Actions Menu', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render action menu button on each card', () => {
      const onRowClick = vi.fn()

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          onRowClick={onRowClick}
        />
      )

      const menuButtons = screen.getAllByRole('button', { name: /actions/i })
      expect(menuButtons).toHaveLength(testData.length)
    })

    it('should have menu button with proper aria attributes', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          onRowClick={vi.fn()}
        />
      )

      const menuButton = screen.getAllByRole('button', { name: /actions/i })[0]

      // Button should have proper aria attributes for menu trigger
      expect(menuButton).toHaveAttribute('aria-haspopup', 'menu')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should trigger onRowClick when clicking card', () => {
      const onRowClick = vi.fn()

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          onRowClick={onRowClick}
        />
      )

      const cards = screen.getAllByTestId('datatable-card')
      fireEvent.click(cards[0])

      expect(onRowClick).toHaveBeenCalledWith(testData[0], expect.any(Object))
    })
  })

  describe('Sorting in Card View', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render sort controls in card view', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          sorting={{ sorting: [] }}
        />
      )

      // Should have a sort dropdown or control
      expect(screen.getByLabelText(/sort/i)).toBeInTheDocument()
    })

    it('should allow selecting sort column', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          sorting={{ sorting: [] }}
        />
      )

      const sortControl = screen.getByLabelText(/sort/i)
      fireEvent.click(sortControl)

      // Should show sortable columns
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
    })
  })

  describe('Filtering in Card View', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render search input in card view', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          search={true}
        />
      )

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('should filter cards when searching', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          search={true}
        />
      )

      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'Item One' } })

      // Should only show matching cards
      const cards = screen.getAllByTestId('datatable-card')
      expect(cards).toHaveLength(1)
      expect(screen.getByText('Item One')).toBeInTheDocument()
    })
  })

  describe('Pagination in Card View', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
      status: i % 2 === 0 ? 'active' : 'pending',
      amount: (i + 1) * 100,
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
    }))

    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render pagination controls in card view', () => {
      render(
        <DataTable
          data={manyItems}
          columns={testColumns}
          viewMode="card"
          pagination={{ enabled: true }}
        />
      )

      // Should have pagination info (Page X of Y)
      expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument()
    })

    it('should limit cards per page', () => {
      render(
        <DataTable
          data={manyItems}
          columns={testColumns}
          viewMode="card"
          pagination={{ enabled: true }}
        />
      )

      // Default page size is 10
      const cards = screen.getAllByTestId('datatable-card')
      expect(cards.length).toBeLessThanOrEqual(10)
    })

    it('should navigate to next page', () => {
      render(
        <DataTable
          data={manyItems}
          columns={testColumns}
          viewMode="card"
          pagination={{ enabled: true }}
        />
      )

      // Initially on page 1
      expect(screen.getByText('Item 1')).toBeInTheDocument()

      // Click next
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      // Should show page 2 items
      expect(screen.getByText('Item 11')).toBeInTheDocument()
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('Row Selection in Card View', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should render selection checkboxes on cards', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          rowSelection={{ enabled: true }}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      // 5 items + 1 select all
      expect(checkboxes.length).toBeGreaterThanOrEqual(testData.length)
    })

    it('should select card when clicking checkbox', () => {
      const onSelectionChange = vi.fn()

      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          rowSelection={{
            enabled: true,
            onSelectionChange
          }}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      // Click first item checkbox (skip select all)
      fireEvent.click(checkboxes[1])

      expect(onSelectionChange).toHaveBeenCalled()
    })

    it('should show selection count', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          rowSelection={{ enabled: true }}
          pagination={{ enabled: true }}
        />
      )

      // Select two items
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      // Should show selection count
      expect(screen.getByText(/2 of/i)).toBeInTheDocument()
    })
  })

  describe('Empty and Loading States', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should show empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          viewMode="card"
          emptyMessage="No items found"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          viewMode="card"
          loading={true}
        />
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockBreakpoint.mockReturnValue('xs')
    })

    it('should have proper ARIA labels on cards', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          cardConfig={{ titleColumn: 'name' }}
        />
      )

      const cards = screen.getAllByTestId('datatable-card')
      cards.forEach((card) => {
        expect(card).toHaveAttribute('role', 'article')
      })
    })

    it('should have accessible action menu', () => {
      render(
        <DataTable
          data={testData}
          columns={testColumns}
          viewMode="card"
          onRowClick={vi.fn()}
        />
      )

      const menuButtons = screen.getAllByRole('button', { name: /actions/i })
      menuButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-haspopup', 'menu')
      })
    })
  })
})
