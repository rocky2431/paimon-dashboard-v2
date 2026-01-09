import { useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Wallet, Loader2 } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
}

type LoginStep = 'connect' | 'signing' | 'verifying'

/**
 * Wallet-based login form
 *
 * Flow:
 * 1. User clicks "Connect Wallet"
 * 2. Get wallet address from browser wallet (MetaMask, etc.)
 * 3. Request nonce from backend
 * 4. User signs nonce with wallet
 * 5. Submit signature to backend for verification
 */
export function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const [step, setStep] = useState<LoginStep>('connect')
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [isManualEntry, setIsManualEntry] = useState(false)

  const { requestNonce, login } = useAuth()

  // Check if ethereum provider is available
  const hasWalletProvider =
    typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined'

  // Connect to wallet and get address
  const connectWallet = useCallback(async () => {
    setError(null)
    setStep('connect')

    try {
      if (!hasWalletProvider) {
        setIsManualEntry(true)
        return
      }

      const ethereum = (window as any).ethereum

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }

      const address = accounts[0]
      setWalletAddress(address)
      await signAndLogin(address)
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Wallet connection was rejected. Please try again.')
      } else {
        setError(error.message || 'Failed to connect wallet')
      }
      onError?.(error)
    }
  }, [hasWalletProvider, onError])

  // Request nonce and sign with wallet
  const signAndLogin = useCallback(
    async (address: string) => {
      setError(null)
      setStep('signing')

      try {
        // Step 1: Request nonce and message from backend
        const { nonce, message } = await requestNonce(address)

        // Step 2: Sign the message returned by backend
        let signature: string

        if (hasWalletProvider) {
          const ethereum = (window as any).ethereum
          signature = await ethereum.request({
            method: 'personal_sign',
            params: [message, address],
          })
        } else {
          // For development/testing without wallet
          throw new Error('Wallet provider not available')
        }

        setStep('verifying')

        // Step 3: Submit to backend for verification
        await login({
          wallet_address: address,
          signature,
          nonce,
        })

        onSuccess?.()
      } catch (error: any) {
        if (error.code === 4001) {
          setError('Message signing was rejected. Please try again.')
        } else {
          setError(error.message || 'Authentication failed')
        }
        setStep('connect')
        onError?.(error)
      }
    },
    [requestNonce, login, hasWalletProvider, onSuccess, onError]
  )

  // Handle manual wallet address entry (for development)
  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError('Invalid Ethereum address format')
        return
      }
      await signAndLogin(walletAddress)
    },
    [walletAddress, signAndLogin]
  )

  const isLoading = step === 'signing' || step === 'verifying'

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="space-y-6">
        {/* Wallet Connect Button */}
        {!isManualEntry ? (
          <Button
            type="button"
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {step === 'signing' ? 'Sign in Wallet...' : 'Verifying...'}
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isLoading}
                className={error ? 'border-red-500' : ''}
              />
            </div>
            <Button type="submit" disabled={isLoading || !walletAddress} className="w-full">
              {isLoading ? 'Signing...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsManualEntry(false)}
              className="w-full text-sm"
            >
              Use Browser Wallet Instead
            </Button>
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Not Detected Warning */}
        {!hasWalletProvider && !isManualEntry && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              No wallet detected. Please install{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                MetaMask
              </a>{' '}
              or another Web3 wallet.
            </p>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsManualEntry(true)}
              className="mt-2 p-0 h-auto text-sm text-yellow-800 underline"
            >
              Enter address manually (dev only)
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500">Connect your wallet to sign in securely</p>
      </div>

      {/* Accessibility Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {step === 'signing' && 'Please sign the message in your wallet...'}
        {step === 'verifying' && 'Verifying your signature...'}
        {error && `Error: ${error}`}
      </div>
    </div>
  )
}

// Loading state component for form
export const LoginFormLoading = () => (
  <div className="w-full max-w-md p-6 space-y-6">
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
    </div>
  </div>
)

export default LoginForm
