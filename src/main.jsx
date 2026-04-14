import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const host = window.location.hostname
    const isLocalDevHost = import.meta.env.DEV && (host === 'localhost' || host === '127.0.0.1')

    if (isLocalDevHost) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))

      if ('caches' in window) {
        const cacheKeys = await window.caches.keys()
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
      }

      return
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Keep the app functional if service worker registration fails.
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
