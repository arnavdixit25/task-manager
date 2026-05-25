import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.jsx'
import useAuthStore from './store/authStore'
import LoadingSpinner from './components/LoadingSpinner'

const queryClient = new QueryClient()

function Root() {
  const [loading, setLoading] = useState(true)
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    initAuth().finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)