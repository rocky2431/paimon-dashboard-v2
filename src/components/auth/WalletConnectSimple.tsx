import { Button } from '../ui/button'
import { Wallet } from 'lucide-react'
import { useWeb3Auth } from '../../hooks/useWeb3AuthSimple'

interface WalletConnectSimpleProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function WalletConnectSimple({ onSuccess, onError }: WalletConnectSimpleProps) {
  const {
    isConnected,
    address,
    isConnecting,
    isSigning,
    error,
    connect,
    authenticateWithWallet,
  } = useWeb3Auth()

  const handleConnect = async () => {
    try {
      // Try to connect with MetaMask or any available wallet
      await connect()
      onSuccess?.()
    } catch (error: any) {
      onError?.(error)
    }
  }

  const handleAuthenticate = async () => {
    if (!isConnected) {
      await handleConnect()
      return
    }

    try {
      const result = await authenticateWithWallet()
      if (result.success) {
        onSuccess?.()
      } else {
        onError?.(new Error(result.error || 'Authentication failed'))
      }
    } catch (error: any) {
      onError?.(error)
    }
  }

  if (isConnected && address) {
    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-green-600">
          Wallet Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        {error && (
          <p className="text-sm text-red-600">
            Error: {error}
          </p>
        )}
        <Button
          onClick={handleAuthenticate}
          disabled={isSigning}
          className="w-full"
        >
          {isSigning ? 'Signing...' : 'Sign In with Wallet'}
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full"
      variant="outline"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}

export default WalletConnectSimple