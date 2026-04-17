import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

let hasReloadedForUpdate = false

function activateWaitingServiceWorker(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

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

    const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => null)

    if (!registration) {
      return
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hasReloadedForUpdate) return
      hasReloadedForUpdate = true
      window.location.reload()
    })

    if (registration.waiting) {
      activateWaitingServiceWorker(registration)
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          activateWaitingServiceWorker(registration)
        }
      })
    })

    registration.update().catch(() => {
      // Keep the app functional if a manual update check fails.
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
