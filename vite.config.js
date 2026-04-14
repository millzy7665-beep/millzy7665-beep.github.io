import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import os from 'os'

const useHttps = process.env.VITE_HTTPS === 'true'

function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const iface of (nets[name] || [])) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return null
}

export default defineConfig({
  plugins: [react(), ...(useHttps ? [basicSsl()] : [])],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    https: useHttps,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    https: useHttps,
    allowedHosts: true,
  },
  define: {
    __LOCAL_IP__: JSON.stringify(getLocalIP()),
    __SECURE_SHARE_URL__: JSON.stringify(process.env.SECURE_SHARE_URL || null),
  },
})
