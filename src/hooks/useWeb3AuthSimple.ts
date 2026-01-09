import { useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { walletAuthService, type WalletAuthResult } from '../services/walletAuthService'
import { useAuthStore } from '../stores'

export function useWeb3Auth() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const {
    signMessageAsync,
    isPending: isSigning,
  } = useSignMessage()

  const [error, setError] = useState<string | null>(null)
  const { setUser, setToken } = useAuthStore()

  // Connect wallet
  const connectWallet = useCallback(async (connectorId?: string) => {
    try {
      setError(null)
      if (connectorId) {
        const connector = connectors.find(c => c.id === connectorId)
        if (connector) {
          await connect({ connector })
        }
      } else {
        // Try MetaMask first
        const metamask = connectors.find(c => c.id === 'metaMask')
        if (metamask) {
          await connect({ connector: metamask })
        } else if (connectors.length > 0) {
          await connect({ connector: connectors[0] })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      throw err
    }
  }, [connect, connectors])

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

  // Authenticate with wallet
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
        // Update auth store
        setUser({
          id: result.user.id,
          email: undefined,
          name: `Wallet User ${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: result.user.wallet_address,
        } as any)
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

  return {
    isConnected,
    address,
    isConnecting,
    isSigning,
    error,
    connect: connectWallet,
    disconnect,
    authenticateWithWallet,
    requestSignature,
  }
}