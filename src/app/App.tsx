import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { Web3ProviderSimple } from '@/providers/Web3ProviderSimple'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
import { Toaster } from 'sonner'
import router from '@/router'

function App() {
  return (
    <Web3ProviderSimple>
      <QueryProvider>
        <WebSocketProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </WebSocketProvider>
      </QueryProvider>
    </Web3ProviderSimple>
  )
}

export default App
