/**
 * Liquidity Forecast API Service
 * API client and React Query hooks for liquidity forecasting
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'
import {
  LIQUIDITY_FORECAST_QUERY_KEYS,
  type LiquidityForecast,
  type ForecastTimeframe,
  type ConfidenceLevel,
  type ForecastScenario,
  type ScenarioData,
  type ForecastAlert,
} from '../types/liquidity-forecast'

// Generate mock historical data
function generateHistoricalData(days: number): Array<{ timestamp: string; value: number; isHistorical: boolean }> {
  const data = []
  const now = new Date()
  const baseValue = 10000000 // $10M base liquidity
  let currentValue = baseValue

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Add some realistic variation
    const dailyChange = (Math.random() - 0.48) * 0.03 // Slight positive bias
    currentValue = currentValue * (1 + dailyChange)

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(currentValue),
      isHistorical: true,
    })
  }

  return data
}

// Generate mock forecast data
function generateForecastData(
  days: number,
  startValue: number,
  confidenceLevel: ConfidenceLevel
): Array<{ timestamp: string; predicted: number; upperBound: number; lowerBound: number }> {
  const data = []
  const now = new Date()
  let predictedValue = startValue

  // Confidence level affects interval width
  const confidenceMultipliers: Record<ConfidenceLevel, number> = {
    50: 0.05,
    75: 0.08,
    90: 0.12,
    95: 0.15,
  }
  const baseInterval = confidenceMultipliers[confidenceLevel]

  for (let i = 1; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)

    // Forecast with increasing uncertainty
    const trend = 0.001 // Slight positive trend
    const noise = (Math.random() - 0.5) * 0.01
    predictedValue = predictedValue * (1 + trend + noise)

    // Interval widens over time
    const intervalWidth = baseInterval * Math.sqrt(i / 7) * predictedValue

    data.push({
      timestamp: date.toISOString(),
      predicted: Math.round(predictedValue),
      upperBound: Math.round(predictedValue + intervalWidth),
      lowerBound: Math.round(predictedValue - intervalWidth),
    })
  }

  return data
}

// Generate scenario data
function generateScenarios(currentValue: number): ScenarioData[] {
  return [
    {
      scenario: 'optimistic' as ForecastScenario,
      probability: 25,
      projectedValue: currentValue * 1.15,
      changePercent: 15,
      description: 'Strong inflows, market rally',
      color: '#10b981', // green
    },
    {
      scenario: 'base' as ForecastScenario,
      probability: 50,
      projectedValue: currentValue * 1.05,
      changePercent: 5,
      description: 'Normal market conditions',
      color: '#3b82f6', // blue
    },
    {
      scenario: 'pessimistic' as ForecastScenario,
      probability: 25,
      projectedValue: currentValue * 0.90,
      changePercent: -10,
      description: 'High redemptions, market stress',
      color: '#ef4444', // red
    },
  ]
}

// Generate mock forecast alerts
function generateAlerts(): ForecastAlert[] {
  const now = new Date()
  return [
    {
      id: '1',
      type: 'volatility',
      severity: 'warning',
      message: 'Increased liquidity volatility expected next week',
      triggeredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      forecastedDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      probability: 65,
    },
    {
      id: '2',
      type: 'surplus',
      severity: 'info',
      message: 'Potential liquidity surplus in 2 weeks',
      triggeredAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      forecastedDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      probability: 45,
    },
  ]
}

// Mock API functions
async function fetchLiquidityForecast(
  timeframe: ForecastTimeframe,
  confidenceLevel: ConfidenceLevel = 90
): Promise<LiquidityForecast> {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 600))

    const timeframeDays: Record<ForecastTimeframe, number> = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      '60d': 60,
      '90d': 90,
    }

    const forecastDays = timeframeDays[timeframe]
    const historicalDays = Math.min(forecastDays, 30)

    const historical = generateHistoricalData(historicalDays)
    const lastHistoricalValue = historical[historical.length - 1].value
    const forecast = generateForecastData(forecastDays, lastHistoricalValue, confidenceLevel)
    const scenarios = generateScenarios(lastHistoricalValue)

    const currentLiquidity = lastHistoricalValue
    const projectedLiquidity = forecast[forecast.length - 1].predicted

    return {
      id: `forecast-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      confidenceLevel,
      timeframe,
      historical,
      forecast,
      scenarios,
      metrics: {
        currentLiquidity,
        projectedLiquidity,
        changePercent: ((projectedLiquidity - currentLiquidity) / currentLiquidity) * 100,
        volatility: 8.5, // Mock volatility percentage
        modelConfidence: 85,
        lastUpdated: new Date().toISOString(),
      },
    }
  }

  const response = await apiClient.get(API_ENDPOINTS.RISK.FORECAST_DATA, {
    params: { timeframe, confidenceLevel },
  })
  return response.data.data
}

async function fetchForecastAlerts(): Promise<ForecastAlert[]> {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateAlerts()
  }

  const response = await apiClient.get(API_ENDPOINTS.RISK.ALERTS, {
    params: { type: 'liquidity' },
  })
  return response.data.data
}

// React Query Hooks
export function useLiquidityForecast(
  timeframe: ForecastTimeframe = '30d',
  confidenceLevel: ConfidenceLevel = 90
) {
  return useQuery({
    queryKey: [...LIQUIDITY_FORECAST_QUERY_KEYS.forecast(timeframe), confidenceLevel],
    queryFn: () => fetchLiquidityForecast(timeframe, confidenceLevel),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })
}

export function useForecastAlerts() {
  return useQuery({
    queryKey: LIQUIDITY_FORECAST_QUERY_KEYS.alerts(),
    queryFn: fetchForecastAlerts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
