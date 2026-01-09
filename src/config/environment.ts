// Environment configuration for API client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://104.197.107.130:8000/api/v1'

// Derive WebSocket URL from API base URL (replace http(s) with ws(s), remove /api/v1 suffix)
function deriveWebSocketUrl(apiBaseUrl: string): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }
  // Convert http(s)://host:port/api/v1 to ws(s)://host:port/ws
  return apiBaseUrl.replace(/^http/, 'ws').replace(/\/api\/v\d+$/, '/ws')
}

export const API_CONFIG = {
  // API base URL - configure based on environment
  BASE_URL: API_BASE_URL,

  // WebSocket URL - derived from API base URL or use VITE_WS_URL
  WS_URL: deriveWebSocketUrl(API_BASE_URL),

  // Request timeout in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),

  // Retry configuration
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),

  // Development mode flag
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_TEST: import.meta.env.TEST,

  // WebSocket enabled flag - set VITE_WS_ENABLED=false to disable
  WS_ENABLED: import.meta.env.VITE_WS_ENABLED !== 'false',
}

// Request headers configuration
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

// API endpoints - aligned with backend OpenAPI spec
export const API_ENDPOINTS = {
  // Authentication - wallet signature login (EIP-191)
  AUTH: {
    NONCE: '/auth/nonce',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Fund data - replaces dashboard
  FUND: {
    OVERVIEW: '/fund/overview',
    SUMMARY: '/fund/summary',
    YIELDS: '/fund/yields',
    NAV_HISTORY: '/fund/nav/history',
    ALLOCATIONS_ASSETS: '/fund/allocations/assets',
    ALLOCATIONS_TIERS: '/fund/allocations/tiers',
    FEES: '/fund/fees',
    PERFORMANCE: '/fund/performance',
    FLOWS: '/fund/flows',
  },
  // Redemptions
  REDEMPTIONS: {
    LIST: '/redemptions',
    PENDING_APPROVALS: '/redemptions/pending-approvals',
    STATS: '/redemptions/stats',
    DETAIL: (id: string | number) => `/redemptions/${id}`,
    APPROVE: (id: string | number) => `/redemptions/${id}/approve`,
    REJECT: (id: string | number) => `/redemptions/${id}/reject`,
    SETTLE: (id: string | number) => `/redemptions/${id}/settle`,
  },
  // Approvals (was approval-queue)
  APPROVALS: {
    LIST: '/approvals',
    PENDING: '/approvals/pending',
    STATS: '/approvals/stats',
    AUDIT: '/approvals/audit',
    DETAIL: (id: string | number) => `/approvals/${id}`,
    ACTION: (id: string | number) => `/approvals/${id}/action`,
    CANCEL: (id: string | number) => `/approvals/${id}/cancel`,
  },
  // Risk monitoring
  RISK: {
    DASHBOARD: '/risk/dashboard',
    ASSESS: '/risk/assess',
    ASSESSMENTS: '/risk/assessments',
    ASSESSMENT_DETAIL: (id: string | number) => `/risk/assessment/${id}`,
    ALERTS: '/risk/alerts',
    ALERT_DETAIL: (id: string | number) => `/risk/alerts/${id}`,
    ALERT_ACKNOWLEDGE: (id: string | number) => `/risk/alerts/${id}/acknowledge`,
    ALERT_RESOLVE: (id: string | number) => `/risk/alerts/${id}/resolve`,
    ALERTS_HISTORY: '/risk/alerts/history',
    EMERGENCIES: '/risk/emergencies',
    EMERGENCY_EXECUTE: (id: string | number) => `/risk/emergencies/${id}/execute`,
    EMERGENCY_RESOLVE: (id: string | number) => `/risk/emergencies/${id}/resolve`,
    FORECAST: '/risk/forecast',
    FORECASTS: '/risk/forecasts',
    FORECAST_DATA: '/risk/forecast/data',
    CONFIG: '/risk/config',
    INDICATORS_LIQUIDITY: '/risk/indicators/liquidity',
    INDICATORS_PRICE: '/risk/indicators/price',
    INDICATORS_CONCENTRATION: '/risk/indicators/concentration',
    INDICATORS_REDEMPTION: '/risk/indicators/redemption',
  },
  // Rebalancing
  REBALANCING: {
    DEVIATION: '/rebalancing/deviation',
    PREVIEW: '/rebalancing/preview',
    TRIGGER_MANUAL: '/rebalancing/trigger/manual',
    TRIGGER_EVALUATE: '/rebalancing/trigger/evaluate',
    TRIGGER_AUTOMATIC: '/rebalancing/trigger/automatic',
    PLAN_DETAIL: (id: string | number) => `/rebalancing/plan/${id}`,
    PLAN_APPROVE: (id: string | number) => `/rebalancing/plan/${id}/approve`,
    PLAN_CANCEL: (id: string | number) => `/rebalancing/plan/${id}/cancel`,
    EXECUTE: '/rebalancing/execute',
    EXECUTION_DETAIL: (id: string | number) => `/rebalancing/execution/${id}`,
    HISTORY_TRIGGERS: '/rebalancing/history/triggers',
    STATS: '/rebalancing/stats',
    CONFIG_TRIGGERS: '/rebalancing/config/triggers',
  },
  // Reports
  REPORTS: {
    LIST: '/reports/',
    GENERATE: '/reports/generate',
    DETAIL: (id: string | number) => `/reports/${id}`,
    DOWNLOAD: (id: string | number) => `/reports/download/${id}`,
    DATA: (id: string | number) => `/reports/${id}/data`,
  },
  // Audit logs
  AUDIT: {
    ENTRIES: '/audit/entries',
    ENTRY_DETAIL: (id: string | number) => `/audit/entries/${id}`,
    RECENT: '/audit/entries/recent',
    STATS: '/audit/stats',
    BY_ACTOR: (actorId: string) => `/audit/by-actor/${actorId}`,
    BY_RESOURCE: (type: string, id: string) => `/audit/by-resource/${type}/${id}`,
  },
  // Health check
  HEALTH: {
    STATUS: '/health',
    LIVE: '/health/live',
    READY: '/health/ready',
    COMPONENTS: '/health/components',
    VERSION: '/health/version',
    SUMMARY: '/health/summary',
  },
  // Users module - role management
  USERS: {
    ROLES: '/users/roles',
    USER_ROLES: (userId: string) => `/users/${userId}/roles`,
    WITH_ROLE: (role: string) => `/users/with-role/${role}`,
    ROLES_ASSIGN: '/users/roles/assign',
    ROLES_REVOKE: '/users/roles/revoke',
    MY_ROLES: '/users/me/roles',
  },
  // Admin module - vault, config, and management operations
  ADMIN: {
    // Vault operations
    VAULT: {
      STATUS: '/admin/vault/status',
      PAUSE: '/admin/vault/pause',
      UNPAUSE: '/admin/vault/unpause',
      RESET_LOCKED_MINT_ASSETS: '/admin/vault/reset-locked-mint-assets',
      REFRESH_EMERGENCY_QUOTA: '/admin/vault/refresh-emergency-quota',
      UPDATE_NAV: '/admin/vault/update-nav',
      SET_STANDARD_QUOTA_RATIO: '/admin/vault/set-standard-quota-ratio',
      SET_EMERGENCY_MODE: '/admin/vault/set-emergency-mode',
      EMERGENCY_WITHDRAW: '/admin/vault/emergency-withdraw',
      SET_ASSET_CONTROLLER: '/admin/vault/set-asset-controller',
      SET_REDEMPTION_MANAGER: '/admin/vault/set-redemption-manager',
    },
    // Fee configuration
    FEES: '/admin/fees',
    FEES_UPDATE: '/admin/fees/update',
    CONFIG: {
      BASE_REDEMPTION_FEE: '/admin/config/base-redemption-fee',
      EMERGENCY_PENALTY_FEE: '/admin/config/emergency-penalty-fee',
      STANDARD_APPROVAL_AMOUNT: '/admin/config/standard-approval-amount',
      EMERGENCY_APPROVAL_AMOUNT: '/admin/config/emergency-approval-amount',
      STANDARD_APPROVAL_QUOTA_RATIO: '/admin/config/standard-approval-quota-ratio',
      EMERGENCY_APPROVAL_QUOTA_RATIO: '/admin/config/emergency-approval-quota-ratio',
      VOUCHER_THRESHOLD: '/admin/config/voucher-threshold',
    },
    // Redemption admin operations
    REDEMPTIONS: {
      SETTLE: (id: string | number) => `/admin/redemptions/${id}/settle`,
      SETTLE_WITH_VOUCHER: '/admin/redemptions/settle-with-voucher',
      CANCEL: (id: string | number) => `/admin/redemptions/${id}/cancel`,
    },
    // Liabilities management
    LIABILITIES: '/admin/liabilities',
    LIABILITIES_FORECAST: '/admin/liabilities/forecast',
    LIABILITIES_OBJ: {
      PROCESS_OVERDUE_BATCH: '/admin/liabilities/process-overdue-batch',
      ADJUST_OVERDUE: '/admin/liabilities/adjust-overdue',
      ADJUST_DAILY: '/admin/liabilities/adjust-daily',
    },
    // Redemption manager
    REDEMPTION_MANAGER: {
      PAUSE: '/admin/redemption-manager/pause',
      UNPAUSE: '/admin/redemption-manager/unpause',
      SET_REDEMPTION_VOUCHER: '/admin/redemption-manager/set-redemption-voucher',
      SET_ASSET_CONTROLLER: '/admin/redemption-manager/set-asset-controller',
    },
    // Role management (on-chain)
    ROLES: {
      HOLDERS: (role: string) => `/admin/roles/${role}/holders`,
      GRANT: '/admin/roles/grant',
      REVOKE: '/admin/roles/revoke',
    },
    OPERATORS: {
      GRANT: '/admin/operators/grant',
      REVOKE: '/admin/operators/revoke',
    },
    // Asset controller
    ASSET_CONTROLLER: {
      LIST: '/admin/assets',
      ADD_ASSET: '/admin/assets/add',
      REMOVE_ASSET: '/admin/assets/remove',
      UPDATE_ASSET_CONFIG: '/admin/assets/update',
      SET_ASSET_ACTIVE: '/admin/assets/set-active',
      SET_LAYER_CONFIG: '/admin/assets/layer-config',
      SET_ORACLE_ADAPTER: '/admin/assets/oracle-adapter',
      SET_SWAP_HELPER: '/admin/assets/swap-helper',
      SET_SWAP_SLIPPAGE: '/admin/assets/swap-slippage',
      PAUSE: '/admin/asset-controller/pause',
      UNPAUSE: '/admin/asset-controller/unpause',
      REFRESH_CACHE: '/admin/asset-controller/refresh-cache',
      WITHDRAW_FEES: '/admin/asset-controller/withdraw-fees',
      ROLES_GRANT: '/admin/asset-controller/roles/grant',
      ROLES_REVOKE: '/admin/asset-controller/roles/revoke',
      ASSET_CONFIGS: '/admin/asset-controller/configs',
      LAYER_CONFIGS: '/admin/asset-controller/layer-configs',
      LAYER_ASSETS: (tier: string) => `/admin/asset-controller/layers/${tier}/assets`,
      CHECK_ROLE: '/admin/asset-controller/check-role',
    },
    // Emergency operations
    EMERGENCY: {
      PAUSE: '/admin/emergency/pause',
      WITHDRAW: '/admin/emergency/withdraw',
    },
  },
} as const

// Error codes mapping
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const
