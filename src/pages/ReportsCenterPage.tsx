import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { ReportTypeSelector, type ReportType, type TimePeriod, type DateRange } from '@/components/reports/ReportTypeSelector'
import { ReportPreview, type PerformanceData, type RiskData, type RedemptionData, type RebalancingData, type ReportData } from '@/components/reports/ReportPreview'
import { ExportButtons } from '@/components/reports/ExportButtons'

// Mock data generators for demo
function generatePerformanceData(): PerformanceData {
  return {
    totalReturn: 12.5,
    sharpeRatio: 1.8,
    maxDrawdown: -8.2,
    volatility: 15.3,
    dailyReturns: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 4 - 2,
    })),
  }
}

function generateRiskData(): RiskData {
  return {
    riskScore: 65,
    var95: 2.5,
    cvar95: 3.8,
    beta: 1.1,
    riskDistribution: [
      { name: 'Market Risk', value: 40, fill: '#ef4444' },
      { name: 'Credit Risk', value: 25, fill: '#f97316' },
      { name: 'Liquidity Risk', value: 20, fill: '#eab308' },
      { name: 'Operational Risk', value: 15, fill: '#22c55e' },
    ],
  }
}

function generateRedemptionData(): RedemptionData {
  return {
    pendingRequests: 24,
    processedToday: 156,
    totalAmount: 2450000,
    averageProcessingTime: 4.2,
  }
}

function generateRebalancingData(): RebalancingData {
  return {
    totalTrades: 48,
    completedTrades: 42,
    pendingTrades: 6,
    turnover: 0.125,
  }
}

export default function ReportsCenterPage() {
  const [reportType, setReportType] = useState<ReportType>('performance')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null)

  // Generate mock data based on report type
  const reportData: ReportData | null = useMemo(() => {
    switch (reportType) {
      case 'performance':
        return generatePerformanceData()
      case 'risk':
        return generateRiskData()
      case 'redemption':
        return generateRedemptionData()
      case 'rebalancing':
        return generateRebalancingData()
      default:
        return null
    }
  }, [reportType, timePeriod])

  const handleExportStart = (type: 'pdf' | 'excel') => {
    setIsExporting(true)
    setExportType(type)
  }

  const handleExportComplete = (type: 'pdf' | 'excel', filename: string) => {
    setIsExporting(false)
    setExportType(null)
    console.log(`Exported ${type}: ${filename}`)
  }

  const handleExportError = (type: 'pdf' | 'excel', error: Error) => {
    setIsExporting(false)
    setExportType(null)
    console.error(`Export ${type} failed:`, error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download fund reports
          </p>
        </div>
        <ExportButtons
          reportType={reportType}
          data={reportData}
          isExporting={isExporting}
          exportType={exportType}
          onExportStart={handleExportStart}
          onExportComplete={handleExportComplete}
          onExportError={handleExportError}
        />
      </div>

      {/* Report Type Selector with Filters */}
      <Card className="p-4">
        <ReportTypeSelector
          reportType={reportType}
          onReportTypeChange={setReportType}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </Card>

      {/* Report Preview */}
      <ReportPreview
        reportType={reportType}
        data={reportData}
        isLoading={false}
        error={null}
      />
    </div>
  )
}
