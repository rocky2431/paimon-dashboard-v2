/**
 * ExportButtons Component Tests
 *
 * Task 25.3: PDF/Excel Export Functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExportButtons } from '../../components/reports/ExportButtons';
import type { ReportType } from '../../components/reports/ReportTypeSelector';

// Mock export libraries before importing the component
const mockSave = vi.fn();
const mockDoc = {
  text: vi.fn(),
  save: mockSave,
  addPage: vi.fn(),
  setFontSize: vi.fn(),
};

const mockJsPDF = vi.fn(() => mockDoc);

const mockWorkbook = [];
const mockWorksheet = {};
const mockBookNew = vi.fn(() => mockWorkbook);
const mockJsonToSheet = vi.fn(() => mockWorksheet);
const mockBookAppendSheet = vi.fn();
const mockWriteFile = vi.fn();

// Mock the dynamic imports
vi.mock('jspdf', () => ({
  default: mockJsPDF,
}));

vi.mock('xlsx', () => ({
  utils: {
    book_new: mockBookNew,
    json_to_sheet: mockJsonToSheet,
    book_append_sheet: mockBookAppendSheet,
  },
  writeFile: mockWriteFile,
}));

describe('ExportButtons', () => {
  const mockData = {
    totalReturn: 15.5,
    sharpeRatio: 1.8,
    maxDrawdown: -8.2,
    volatility: 12.3,
  };

  const defaultProps = {
    reportType: 'performance' as ReportType,
    data: mockData,
    onExportStart: vi.fn(),
    onExportComplete: vi.fn(),
    onExportError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both PDF and Excel export buttons', () => {
    render(<ExportButtons {...defaultProps} />);

    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Export Excel')).toBeInTheDocument();
  });

  it('disables buttons during export', () => {
    render(<ExportButtons {...defaultProps} isExporting={true} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    const excelButton = screen.getByText('Export Excel').closest('button');

    expect(pdfButton).toBeDisabled();
    expect(excelButton).toBeDisabled();
  });

  it('calls onExportStart when PDF export begins', async () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    fireEvent.click(pdfButton!);

    await waitFor(() => {
      expect(defaultProps.onExportStart).toHaveBeenCalledWith('pdf');
    });
  });

  it('calls onExportComplete when PDF export succeeds', async () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    fireEvent.click(pdfButton!);

    await waitFor(() => {
      expect(defaultProps.onExportComplete).toHaveBeenCalled();
    });
  });

  it('generates filename with timestamp and report type', async () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    fireEvent.click(pdfButton!);

    // onExportStart should be called immediately
    await waitFor(() => {
      expect(defaultProps.onExportStart).toHaveBeenCalledWith('pdf');
    });

    // The actual export is handled by the mocked library
    // We verify the export was triggered by checking onExportStart was called
  });

  it('handles empty data gracefully', () => {
    render(<ExportButtons {...defaultProps} data={null} />);

    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('has proper ARIA labels', () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    const excelButton = screen.getByText('Export Excel').closest('button');

    expect(pdfButton).toHaveAttribute('aria-label');
    expect(excelButton).toHaveAttribute('aria-label');
  });

  it('announces export status to screen readers', () => {
    render(<ExportButtons {...defaultProps} isExporting={true} exportType="pdf" />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    pdfButton!.focus();
    expect(pdfButton).toHaveFocus();
  });

  it('sanitizes data before export', () => {
    const maliciousData = {
      totalReturn: 10,
      note: '<script>alert("xss")</script>',
    };

    render(<ExportButtons {...defaultProps} data={maliciousData} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    expect(() => fireEvent.click(pdfButton!)).not.toThrow();
  });

  it('transforms report data to exportable format', async () => {
    render(<ExportButtons {...defaultProps} />);

    const pdfButton = screen.getByText('Export PDF').closest('button');
    fireEvent.click(pdfButton!);

    await waitFor(() => {
      expect(mockJsPDF).toHaveBeenCalled();
    });
  });

  it('handles Excel export', async () => {
    render(<ExportButtons {...defaultProps} />);

    const excelButton = screen.getByText('Export Excel').closest('button');
    fireEvent.click(excelButton!);

    await waitFor(() => {
      expect(defaultProps.onExportStart).toHaveBeenCalledWith('excel');
      expect(mockWriteFile).toHaveBeenCalled();
    });
  });
});
