import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient'
import store from './store'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster 
          position="top-right" 
          containerStyle={{ zIndex: 999999 }}
          toastOptions={{
            style: {
              zIndex: 999999,
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
