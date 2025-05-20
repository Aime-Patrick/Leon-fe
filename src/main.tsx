import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { SocketProvider } from './context/SocketContext.tsx'
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/tailwind-light/theme.css'
        
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
    <SocketProvider>
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
    </SocketProvider>
    </PrimeReactProvider>
  </StrictMode>,
)
