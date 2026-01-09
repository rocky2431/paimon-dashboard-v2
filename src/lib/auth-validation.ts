import { z } from 'zod'

// Wallet-based login schema
export const walletLoginSchema = z.object({
  wallet_address: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z
    .string()
    .min(1, 'Signature is required'),
  nonce: z
    .string()
    .min(1, 'Nonce is required'),
})

export type WalletLoginFormData = z.infer<typeof walletLoginSchema>

// Legacy form validation schemas (kept for backward compatibility)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Change password schema for authenticated users
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(128, 'New password must be less than 128 characters'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// User profile update schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  phone: z.string().optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// JWT token validation schema
export const jwtTokenSchema = z.object({
  sub: z.string(), // user ID
  iat: z.number(), // issued at
  exp: z.number(), // expiration time
  iss: z.string().optional(), // issuer
  aud: z.string().optional(), // audience
  email: z.string().email().optional(),
  name: z.string().optional(),
})

export type JWTPayload = z.infer<typeof jwtTokenSchema>

// Wallet-based user schema
export const walletUserSchema = z.object({
  wallet_address: z.string(),
  roles: z.array(z.enum(['admin', 'operator', 'viewer'])),
})

export type WalletUser = z.infer<typeof walletUserSchema>

// Wallet-based login response schema
export const walletLoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
  user: walletUserSchema,
})

export type WalletLoginResponse = z.infer<typeof walletLoginResponseSchema>

// Legacy API response schemas (kept for backward compatibility)
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['admin', 'operator', 'viewer']).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

// Combined user schema supporting both wallet and legacy auth
export const userSchema = z.object({
  id: z.string().optional(),
  wallet_address: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.enum(['admin', 'operator', 'viewer']).optional(),
  roles: z.array(z.enum(['admin', 'operator', 'viewer'])).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastLoginAt: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type User = z.infer<typeof userSchema>

// Error response schemas
export const authErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.enum([
    'INVALID_CREDENTIALS',
    'TOKEN_EXPIRED',
    'TOKEN_INVALID',
    'USER_INACTIVE',
    'RATE_LIMIT_EXCEEDED',
    'VALIDATION_ERROR',
    'NETWORK_ERROR',
  ]).optional(),
  details: z.record(z.string(), z.any()).optional(),
})

export type AuthError = z.infer<typeof authErrorSchema>

// Utility functions for validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  // Optional: Add more password complexity requirements
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateJWTToken = (token: string): {
  isValid: boolean
  payload?: JWTPayload
  error?: string
} => {
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '')

    const parts = cleanToken.split('.')
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid token format' }
    }

    // Decode the payload (base64url encoded)
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(decodeURIComponent(atob(base64Payload).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join('')))

    const result = jwtTokenSchema.safeParse(payload)
    if (!result.success) {
      return { isValid: false, error: 'Invalid token payload' }
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (result.data.exp && result.data.exp < now) {
      return { isValid: false, error: 'Token expired' }
    }

    return { isValid: true, payload: result.data }
  } catch (error) {
    return { isValid: false, error: 'Token parsing failed' }
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential XSS
    .replace(/on\w+=/gi, '') // Remove potential event handlers
}