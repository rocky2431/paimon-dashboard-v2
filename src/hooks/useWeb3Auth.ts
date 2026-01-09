import { useState, useCallback, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useEnsName,
  useEnsAvatar,
  useBalance,
} from 'wagmi'
import { walletAuthService, type WalletAuthResult } from '../services/walletAuthService'
import { useAuthStore } from '../stores'

export interface Web3AuthState {
  isConnected: boolean
  address: string | undefined
  ensName: string | undefined
  ensAvatar: string | undefined
  balance: string | undefined
  isConnecting: boolean
  isSigning: boolean
  error: string | null
}

export interface Web3AuthActions {
  connect: (connectorId?: string) => Promise<void>
  disconnect: () => Promise<void>
  authenticateWithWallet: () => Promise<WalletAuthResult>
  requestSignature: (message: string) => Promise<string>
}

export function useWeb3Auth(): Web3AuthState & Web3AuthActions {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const {
    signMessageAsync,
    isPending: isSigning,
    error: signError
  } = useSignMessage()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined })
  const { data: balance } = useBalance({ address })

  const [error, setError] = useState<string | null>(null)

  const {
    setUser,
    setToken,
  } = useAuthStore()

  // Update error state from wagmi hooks
  useEffect(() => {
    if (connectError) {
      setError(connectError.message)
    } else if (signError) {
      setError(signError.message)
    } else {
      setError(null)
    }
  }, [connectError, signError])

  // Connect wallet
  const handleConnect = useCallback(async (connectorId?: string) => {
    try {
      setError(null)

      if (connectorId) {
        const selectedConnector = connectors.find(c => c.id === connectorId)
        if (selectedConnector) {
          await connect({ connector: selectedConnector })
        }
      } else {
        // Use first available connector
        if (connectors.length > 0) {
          await connect({ connector: connectors[0] })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    }
  }, [connect, connectors])

  // Disconnect wallet
  const handleDisconnect = useCallback(async () => {
    try {
      setError(null)
      await disconnect()
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet')
    }
  }, [disconnect])

  // Request signature
  const requestSignature = useCallback(async (message: string): Promise<string> => {
    try {
      setError(null)
      const signature = await signMessageAsync({ message })
      return signature
    } catch (err: any) {
      setError(err.message || 'Failed to sign message')
      throw err
    }
  }, [signMessageAsync])

  // Authenticate with wallet signature
  const authenticateWithWallet = useCallback(async (): Promise<WalletAuthResult> => {
    if (!address) {
      return {
        success: false,
        error: 'No wallet connected',
      }
    }

    try {
      setError(null)

      // Get nonce from server
      const nonceResponse = await walletAuthService.getNonce(address)

      // Generate authentication message
      const message = walletAuthService.generateAuthMessage(address, nonceResponse.nonce)

      // Request signature
      const signature = await requestSignature(message)

      // Authenticate with backend
      const result = await walletAuthService.authenticateWithWallet(
        address,
        signature,
        nonceResponse.nonce
      )

      if (result.success && result.token && result.user) {
        // Update auth store with wallet credentials
        setUser({
          id: result.user.id,
          email: undefined,
          name: `Wallet User ${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: result.user.wallet_address,
          wallet_address: result.user.wallet_address,
          authMethod: 'wallet',
          role: result.user.role as 'admin' | 'operator' | 'viewer' | undefined,
          roles: result.user.roles as ('admin' | 'operator' | 'viewer')[],
        })
        setToken(result.token)
      }

      return result
    } catch (err: any) {
      setError(err.message || 'Wallet authentication failed')
      return {
        success: false,
        error: err.message || 'Wallet authentication failed',
      }
    }
  }, [address, requestSignature, setUser, setToken])

  // Format balance
  const formattedBalance = balance
    ? `${(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(4)} ${balance.symbol}`
    : undefined

  return {
    // State
    isConnected: isConnected || false,
    address,
    ensName: ensName || undefined,
    ensAvatar: ensAvatar || undefined,
    balance: formattedBalance,
    isConnecting: isConnecting || false,
    isSigning,
    error,

    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    authenticateWithWallet,
    requestSignature,
  }
}

// Hook for wallet connection status
export function useWalletConnection() {
  const { isConnected, address, isConnecting, error } = useWeb3Auth()

  return {
    isConnected,
    address,
    isConnecting,
    error,
    canAuthenticate: isConnected && !!address,
  }
}

// Hook for wallet authentication status
export function useWalletAuth() {
  const web3Auth = useWeb3Auth()
  const { isAuthenticated, user } = useAuthStore()

  const isWalletAuthenticated = isAuthenticated && user?.authMethod === 'wallet'

  return {
    ...web3Auth,
    isWalletAuthenticated,
  }
}

// Hook for wallet profile
export function useWalletProfile() {
  const { address, ensName, ensAvatar, balance } = useWeb3Auth()
  const { user } = useAuthStore()

  return {
    address,
    displayName: ensName || user?.name || address,
    avatar: ensAvatar,
    balance,
    walletAddress: user?.walletAddress,
    ensName,
  }
}