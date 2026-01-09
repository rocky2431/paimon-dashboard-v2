import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import DataTable, { type DataTableColumn, type DataTableProps } from '../../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'

// Mock data for testing
const mockData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    amount: 1000,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'pending',
    amount: 2500,
    createdAt: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'active',
    amount: 750,
    createdAt: '2024-01-13T09:15:00Z'
  }
]

const mockColumns: ColumnDef<any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
  }
]

describe('DataTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render table with correct headers', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
  })

  it('should render table rows with data', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('should handle empty data state', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
      />
    )

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        loading
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show error state when provided', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        error="Failed to load data"
      />
    )

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('should handle sorting', async () => {
    const onSortChange = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onSortChange={onSortChange}
      />
    )

    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    await waitFor(() => {
      expect(onSortChange).toHaveBeenCalled()
    })
  })

  it('should handle search/filter functionality', async () => {
    const onSearch = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onSearch={onSearch}
        searchable
      />
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('John')
    })
  })

  it('should handle row selection', async () => {
    const onSelectionChange = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable
        onSelectionChange={onSelectionChange}
      />
    )

    // Wait for checkbox to appear
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    // Select first row
    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(firstCheckbox)

    await waitFor(() => {
      expect(onSelectionChange).toHaveBeenCalled()
    })
  })

  it('should handle pagination', async () => {
    const onPageChange = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        paginated
        pageSize={2}
        onPageChange={onPageChange}
      />
    )

    // Check if pagination controls are rendered
    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    // Click next page
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalled()
    })
  })

  it('should handle column visibility toggle', async () => {
    const onColumnVisibilityChange = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        columnVisibility
        onColumnVisibilityChange={onColumnVisibilityChange}
      />
    )

    // Look for column visibility toggle button
    await waitFor(() => {
      const toggleButton = screen.getByLabelText('Toggle column visibility')
      expect(toggleButton).toBeInTheDocument()
    })

    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(onColumnVisibilityChange).toHaveBeenCalled()
    })
  })

  it('should handle bulk actions when rows are selected', async () => {
    const onBulkAction = vi.fn()

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable
        bulkActions={[
          {
            key: 'delete',
            label: 'Delete Selected',
            onClick: onBulkAction
          }
        ]}
      />
    )

    // Select a row
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]
      fireEvent.click(firstCheckbox)
    })

    await waitFor(() => {
      expect(screen.getByText('Delete Selected')).toBeInTheDocument()
    })
  })

  it('should be responsive on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    })

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        responsive
      />
    )

    // Check if responsive layout is applied
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('should handle large datasets with virtual scrolling', async () => {
    const largeData = Array.from({ length: 150 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'active',
      amount: Math.random() * 1000,
      createdAt: new Date().toISOString()
    }))

    render(
      <DataTable
        columns={mockColumns}
        data={largeData}
        virtualScrolling
        height={400}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })
  })
})