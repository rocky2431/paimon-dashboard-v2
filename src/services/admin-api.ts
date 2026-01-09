/**
 * Admin API Service
 *
 * Handles admin operations for vault, config, redemptions, liabilities,
 * roles management, and asset controller.
 * All operations require ADMIN or OPERATOR role.
 */

import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/environment'

// Types for admin operations
export interface VaultUpdateNavParams {
  nav: string
  timestamp?: number
}

export interface VaultQuotaRatioParams {
  ratio: string
}

export interface VaultEmergencyModeParams {
  enabled: boolean
}

export interface VaultEmergencyWithdrawParams {
  token: string
  amount: string
  recipient: string
}

export interface VaultSetControllerParams {
  controller_address: string
}

export interface ConfigFeeParams {
  fee_bps: number
}

export interface ConfigAmountParams {
  amount: string
}

export interface ConfigQuotaRatioParams {
  ratio: string
}

export interface SettleRedemptionParams {
  amount?: string
  notes?: string
}

export interface SettleWithVoucherParams {
  request_id: string
  voucher_amount: string
}

export interface CancelRedemptionParams {
  reason: string
}

export interface LiabilityAdjustParams {
  amount: string
  reason: string
}

export interface RoleGrantParams {
  address: string
  role: string
}

export interface AssetConfigParams {
  asset: string
  config: {
    min_deposit?: string
    max_deposit?: string
    weight?: number
    active?: boolean
  }
}

export interface LayerConfigParams {
  tier: string
  config: {
    weight: number
    min_allocation?: number
    max_allocation?: number
  }
}

export interface SwapSlippageParams {
  asset: string
  slippage_bps: number
}

// Admin API Service
export const adminApi = {
  // ============== Vault Operations ==============
  vault: {
    async resetLockedMintAssets() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.RESET_LOCKED_MINT_ASSETS)
      return response.data
    },

    async refreshEmergencyQuota() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.REFRESH_EMERGENCY_QUOTA)
      return response.data
    },

    async updateNav(params: VaultUpdateNavParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.UPDATE_NAV, params)
      return response.data
    },

    async setStandardQuotaRatio(params: VaultQuotaRatioParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.SET_STANDARD_QUOTA_RATIO, params)
      return response.data
    },

    async setEmergencyMode(params: VaultEmergencyModeParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.SET_EMERGENCY_MODE, params)
      return response.data
    },

    async pause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.PAUSE)
      return response.data
    },

    async unpause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.UNPAUSE)
      return response.data
    },

    async emergencyWithdraw(params: VaultEmergencyWithdrawParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.EMERGENCY_WITHDRAW, params)
      return response.data
    },

    async setAssetController(params: VaultSetControllerParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.SET_ASSET_CONTROLLER, params)
      return response.data
    },

    async setRedemptionManager(params: VaultSetControllerParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.VAULT.SET_REDEMPTION_MANAGER, params)
      return response.data
    },
  },

  // ============== Config Operations ==============
  config: {
    async setBaseRedemptionFee(params: ConfigFeeParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.BASE_REDEMPTION_FEE, params)
      return response.data
    },

    async setEmergencyPenaltyFee(params: ConfigFeeParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.EMERGENCY_PENALTY_FEE, params)
      return response.data
    },

    async setStandardApprovalAmount(params: ConfigAmountParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.STANDARD_APPROVAL_AMOUNT, params)
      return response.data
    },

    async setEmergencyApprovalAmount(params: ConfigAmountParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.EMERGENCY_APPROVAL_AMOUNT, params)
      return response.data
    },

    async setStandardApprovalQuotaRatio(params: ConfigQuotaRatioParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.STANDARD_APPROVAL_QUOTA_RATIO, params)
      return response.data
    },

    async setEmergencyApprovalQuotaRatio(params: ConfigQuotaRatioParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.EMERGENCY_APPROVAL_QUOTA_RATIO, params)
      return response.data
    },

    async setVoucherThreshold(params: ConfigAmountParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.CONFIG.VOUCHER_THRESHOLD, params)
      return response.data
    },
  },

  // ============== Redemption Admin Operations ==============
  redemptions: {
    async settle(requestId: string | number, params?: SettleRedemptionParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTIONS.SETTLE(requestId), params)
      return response.data
    },

    async settleWithVoucher(params: SettleWithVoucherParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTIONS.SETTLE_WITH_VOUCHER, params)
      return response.data
    },

    async cancel(requestId: string | number, params: CancelRedemptionParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTIONS.CANCEL(requestId), params)
      return response.data
    },
  },

  // ============== Liabilities Operations ==============
  liabilities: {
    async getSummary() {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.LIABILITIES)
      return response.data
    },

    async getForecast(days?: number) {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.LIABILITIES_FORECAST, {
        params: days ? { days } : undefined
      })
      return response.data
    },

    async processOverdueBatch() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.LIABILITIES_OBJ.PROCESS_OVERDUE_BATCH)
      return response.data
    },

    async adjustOverdue(params: LiabilityAdjustParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.LIABILITIES_OBJ.ADJUST_OVERDUE, params)
      return response.data
    },

    async adjustDaily(params: LiabilityAdjustParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.LIABILITIES_OBJ.ADJUST_DAILY, params)
      return response.data
    },
  },

  // ============== Redemption Manager Operations ==============
  redemptionManager: {
    async pause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTION_MANAGER.PAUSE)
      return response.data
    },

    async unpause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTION_MANAGER.UNPAUSE)
      return response.data
    },

    async setRedemptionVoucher(params: VaultSetControllerParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTION_MANAGER.SET_REDEMPTION_VOUCHER, params)
      return response.data
    },

    async setAssetController(params: VaultSetControllerParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.REDEMPTION_MANAGER.SET_ASSET_CONTROLLER, params)
      return response.data
    },
  },

  // ============== Role Management ==============
  roles: {
    async grant(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ROLES.GRANT, params)
      return response.data
    },

    async revoke(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ROLES.REVOKE, params)
      return response.data
    },
  },

  operators: {
    async grant(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.OPERATORS.GRANT, params)
      return response.data
    },

    async revoke(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.OPERATORS.REVOKE, params)
      return response.data
    },
  },

  // ============== Asset Controller Operations ==============
  assetController: {
    async addAsset(params: AssetConfigParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.ADD_ASSET, params)
      return response.data
    },

    async removeAsset(asset: string) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.REMOVE_ASSET, { asset })
      return response.data
    },

    async updateAssetConfig(params: AssetConfigParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.UPDATE_ASSET_CONFIG, params)
      return response.data
    },

    async setAssetActive(asset: string, active: boolean) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.SET_ASSET_ACTIVE, { asset, active })
      return response.data
    },

    async setLayerConfig(params: LayerConfigParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.SET_LAYER_CONFIG, params)
      return response.data
    },

    async setOracleAdapter(asset: string, adapter: string) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.SET_ORACLE_ADAPTER, { asset, adapter })
      return response.data
    },

    async setSwapHelper(asset: string, helper: string) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.SET_SWAP_HELPER, { asset, helper })
      return response.data
    },

    async setSwapSlippage(params: SwapSlippageParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.SET_SWAP_SLIPPAGE, params)
      return response.data
    },

    async pause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.PAUSE)
      return response.data
    },

    async unpause() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.UNPAUSE)
      return response.data
    },

    async refreshCache() {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.REFRESH_CACHE)
      return response.data
    },

    async withdrawFees(token: string, recipient: string) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.WITHDRAW_FEES, { token, recipient })
      return response.data
    },

    async grantRole(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.ROLES_GRANT, params)
      return response.data
    },

    async revokeRole(params: RoleGrantParams) {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.ROLES_REVOKE, params)
      return response.data
    },

    async getAssetConfigs() {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.ASSET_CONFIGS)
      return response.data
    },

    async getLayerConfigs() {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.LAYER_CONFIGS)
      return response.data
    },

    async getLayerAssets(tier: string) {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.LAYER_ASSETS(tier))
      return response.data
    },

    async checkRole(address: string, role: string) {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ASSET_CONTROLLER.CHECK_ROLE, {
        params: { address, role }
      })
      return response.data
    },
  },
}

export default adminApi
