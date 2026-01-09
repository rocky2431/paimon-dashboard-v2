import { type AxiosRequestConfig } from 'axios'
import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'

/**
 * Generic API service methods
 * Base class for all API service classes
 */
export class ApiService {
  // GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get(url, config)
    return response.data
  }

  // POST request
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post(url, data, config)
    return response.data
  }

  // PUT request
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put(url, data, config)
    return response.data
  }

  // PATCH request
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch(url, data, config)
    return response.data
  }

  // DELETE request
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete(url, config)
    return response.data
  }
}

/**
 * Auth service - wallet-based authentication
 */
export class AuthService extends ApiService {
  // Step 1: Request nonce for wallet address
  static async requestNonce(walletAddress: string) {
    return this.post(API_ENDPOINTS.AUTH.NONCE, { wallet_address: walletAddress })
  }

  // Step 2: Wallet signature login
  static async login(credentials: { wallet_address: string; signature: string; nonce: string }) {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
  }

  static async logout() {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT)
  }

  static async refreshToken(refreshToken: string) {
    return this.post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken })
  }

  static async getCurrentUser() {
    return this.get(API_ENDPOINTS.AUTH.ME)
  }
}

/**
 * Fund service - replaces dashboard, uses Fund API
 */
export class FundService extends ApiService {
  static async getOverview() {
    return this.get(API_ENDPOINTS.FUND.OVERVIEW)
  }

  static async getYields() {
    return this.get(API_ENDPOINTS.FUND.YIELDS)
  }

  // NAV history - uses 'days' and 'limit' params per backend spec
  static async getNAVHistory(days: number = 30, limit: number = 100) {
    return this.get(API_ENDPOINTS.FUND.NAV_HISTORY, { params: { days, limit } })
  }

  static async getAllocationsAssets() {
    return this.get(API_ENDPOINTS.FUND.ALLOCATIONS_ASSETS)
  }

  static async getAllocationsTiers() {
    return this.get(API_ENDPOINTS.FUND.ALLOCATIONS_TIERS)
  }

  static async getFees() {
    return this.get(API_ENDPOINTS.FUND.FEES)
  }

  static async getFlows() {
    return this.get(API_ENDPOINTS.FUND.FLOWS)
  }
}

// Alias for backward compatibility
export const DashboardService = FundService

/**
 * Redemptions service
 */
export class RedemptionsService extends ApiService {
  static async getList(params?: any) {
    return this.get(API_ENDPOINTS.REDEMPTIONS.LIST, { params })
  }

  static async getPendingApprovals(params?: any) {
    return this.get(API_ENDPOINTS.REDEMPTIONS.PENDING_APPROVALS, { params })
  }

  static async getStats() {
    return this.get(API_ENDPOINTS.REDEMPTIONS.STATS)
  }

  static async getDetail(id: string | number) {
    return this.get(API_ENDPOINTS.REDEMPTIONS.DETAIL(id))
  }

  // Approve with optional comment
  static async approve(id: string | number, comment?: string) {
    return this.post(API_ENDPOINTS.REDEMPTIONS.APPROVE(id), comment ? { comment } : {})
  }

  // Reject with required reason - separate endpoint
  static async reject(id: string | number, reason: string) {
    return this.post(API_ENDPOINTS.REDEMPTIONS.REJECT(id), { reason })
  }

  // Settle with no parameters
  static async settle(id: string | number) {
    return this.post(API_ENDPOINTS.REDEMPTIONS.SETTLE(id), {})
  }
}

/**
 * Risk monitoring service
 * Note: Only /risk/dashboard, /risk/alerts, /risk/assess, /risk/forecast exist
 */
export class RiskService extends ApiService {
  // Get complete risk dashboard data
  static async getDashboard() {
    return this.get(API_ENDPOINTS.RISK.DASHBOARD)
  }

  // Get risk alerts list
  static async getAlerts(params?: any) {
    return this.get(API_ENDPOINTS.RISK.ALERTS, { params })
  }

  // Get single alert detail
  static async getAlertDetail(id: string | number) {
    return this.get(API_ENDPOINTS.RISK.ALERT_DETAIL(id))
  }

  // Acknowledge alert
  static async acknowledgeAlert(id: string | number, notes?: string) {
    return this.post(API_ENDPOINTS.RISK.ALERT_ACKNOWLEDGE(id), notes ? { notes } : {})
  }

  // Risk assessment
  static async assess(data: any) {
    return this.post(API_ENDPOINTS.RISK.ASSESS, data)
  }

  // Risk forecast
  static async forecast(data: any) {
    return this.post(API_ENDPOINTS.RISK.FORECAST, data)
  }
}

/**
 * Rebalancing service
 * Note: deviation/preview are POST, not GET. No plan/*, stats, history endpoints.
 */
export class RebalanceService extends ApiService {
  // Calculate deviation - POST method
  static async calculateDeviation(data: any) {
    return this.post(API_ENDPOINTS.REBALANCING.DEVIATION, data)
  }

  // Preview rebalance - POST method
  static async previewRebalance(data: any) {
    return this.post(API_ENDPOINTS.REBALANCING.PREVIEW, data)
  }

  // Manual trigger
  static async triggerManual(data: any) {
    return this.post(API_ENDPOINTS.REBALANCING.TRIGGER_MANUAL, data)
  }

  // Execute rebalance
  static async execute(data: any) {
    return this.post(API_ENDPOINTS.REBALANCING.EXECUTE, data)
  }
}

/**
 * Reports service
 */
export class ReportsService extends ApiService {
  static async getList() {
    return this.get(API_ENDPOINTS.REPORTS.LIST)
  }

  static async generate(data: any) {
    return this.post(API_ENDPOINTS.REPORTS.GENERATE, data)
  }

  static async getDetail(id: string | number) {
    return this.get(API_ENDPOINTS.REPORTS.DETAIL(id))
  }

  static async download(id: string | number) {
    return this.get(API_ENDPOINTS.REPORTS.DOWNLOAD(id), {
      responseType: 'blob',
    } as AxiosRequestConfig)
  }

  static async getData(id: string | number) {
    return this.get(API_ENDPOINTS.REPORTS.DATA(id))
  }
}

/**
 * Audit service - new
 */
export class AuditService extends ApiService {
  static async getEntries(params?: any) {
    return this.get(API_ENDPOINTS.AUDIT.ENTRIES, { params })
  }

  static async getEntryDetail(id: string | number) {
    return this.get(API_ENDPOINTS.AUDIT.ENTRY_DETAIL(id))
  }

  static async getRecent(params?: any) {
    return this.get(API_ENDPOINTS.AUDIT.RECENT, { params })
  }

  static async getStats(params?: any) {
    return this.get(API_ENDPOINTS.AUDIT.STATS, { params })
  }
}

/**
 * Health service
 */
export class HealthService extends ApiService {
  static async getStatus() {
    return this.get(API_ENDPOINTS.HEALTH.STATUS)
  }

  static async getLive() {
    return this.get(API_ENDPOINTS.HEALTH.LIVE)
  }

  static async getReady() {
    return this.get(API_ENDPOINTS.HEALTH.READY)
  }

  static async getSummary() {
    return this.get(API_ENDPOINTS.HEALTH.SUMMARY)
  }
}

/**
 * Approvals service - new
 */
export class ApprovalsService extends ApiService {
  static async getList(params?: any) {
    return this.get(API_ENDPOINTS.APPROVALS.LIST, { params })
  }

  static async getPending(params?: any) {
    return this.get(API_ENDPOINTS.APPROVALS.PENDING, { params })
  }

  static async getStats() {
    return this.get(API_ENDPOINTS.APPROVALS.STATS)
  }

  static async getDetail(id: string | number) {
    return this.get(API_ENDPOINTS.APPROVALS.DETAIL(id))
  }

  static async action(id: string | number, data: { action: string; notes?: string; reason?: string }) {
    return this.post(API_ENDPOINTS.APPROVALS.ACTION(id), data)
  }

  static async cancel(id: string | number, data?: any) {
    return this.post(API_ENDPOINTS.APPROVALS.CANCEL(id), data)
  }
}

