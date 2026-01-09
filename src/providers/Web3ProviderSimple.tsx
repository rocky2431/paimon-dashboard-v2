import React from 'react'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
})

interface Web3ProviderSimpleProps {
  children: React.ReactNode
}

export function Web3ProviderSimple({ children }: Web3ProviderSimpleProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3ProviderSimple