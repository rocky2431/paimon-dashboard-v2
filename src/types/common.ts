/**
 * Common type definitions for Paimon Admin Dashboard
 */

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Common status types
export type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

// User role types (matching backend RBAC)
export type UserRole = 'super_admin' | 'admin' | 'operator' | 'viewer'
