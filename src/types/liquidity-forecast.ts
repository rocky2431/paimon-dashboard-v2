/**
 * Liquidity Forecast Type Definitions
 * Types for liquidity forecasting, confidence intervals, and scenario analysis
 */

export type ForecastScenario = 'base' | 'optimistic' | 'pessimistic'
export type ForecastTimeframe = '7d' | '14d' | '30d' | '60d' | '90d'
export type ConfidenceLevel = 50 | 75 | 90 | 95

export interface LiquidityDataPoint {
  timestamp: string
  value: number
  isHistorical: boolean
}

export interface ForecastDataPoint {
  timestamp: string
  predicted: number
  upperBound: number  // upper confidence interval
  lowerBound: number  // lower confidence interval
  scenario?: ForecastScenario
}

export interface ScenarioData {
  scenario: ForecastScenario
  probability: number  // 0-100
  projectedValue: number
  changePercent: number
  description: string
  color: string
}

export interface LiquidityForecast {
  id: string
  generatedAt: string
  validUntil: string
  confidenceLevel: ConfidenceLevel
  timeframe: ForecastTimeframe
  historical: LiquidityDataPoint[]
  forecast: ForecastDataPoint[]
  scenarios: ScenarioData[]
  metrics: ForecastMetrics
}

export interface ForecastMetrics {
  currentLiquidity: number
  projectedLiquidity: number
  changePercent: number
  volatility: number
  modelConfidence: number  // 0-100
  lastUpdated: string
}

export interface ForecastSummary {
  shortTerm: {
    direction: 'up' | 'down' | 'stable'
    magnitude: 'low' | 'medium' | 'high'
    confidence: number
  }
  longTerm: {
    direction: 'up' | 'down' | 'stable'
    magnitude: 'low' | 'medium' | 'high'
    confidence: number
  }
  alerts: ForecastAlert[]
}

export interface ForecastAlert {
  id: string
  type: 'liquidity_crisis' | 'surplus' | 'volatility' | 'trend_reversal'
  severity: 'info' | 'warning' | 'critical'
  message: string
  triggeredAt: string
  forecastedDate: string
  probability: number
}

// Chart configuration
export interface ForecastChartConfig {
  showHistorical: boolean
  showForecast: boolean
  showConfidenceInterval: boolean
  showScenarios: boolean
  scenarios: ForecastScenario[]
  confidenceLevel: ConfidenceLevel
  timeframe: ForecastTimeframe
}

// API request/response types
export interface ForecastRequest {
  timeframe: ForecastTimeframe
  confidenceLevel: ConfidenceLevel
  scenarios?: ForecastScenario[]
}

export interface ForecastResponse {
  success: boolean
  data: LiquidityForecast
  message?: string
}

// Query keys
export const LIQUIDITY_FORECAST_QUERY_KEYS = {
  all: ['liquidity-forecast'] as const,
  forecast: (timeframe: ForecastTimeframe) =>
    [...LIQUIDITY_FORECAST_QUERY_KEYS.all, 'forecast', timeframe] as const,
  scenarios: () =>
    [...LIQUIDITY_FORECAST_QUERY_KEYS.all, 'scenarios'] as const,
  alerts: () =>
    [...LIQUIDITY_FORECAST_QUERY_KEYS.all, 'alerts'] as const,
}
