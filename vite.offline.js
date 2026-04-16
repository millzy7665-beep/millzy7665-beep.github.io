import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'fs'

const secureShareUrl = process.env.SECURE_SHARE_URL || 'https://cimra-handbook.web.app'
const appVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-offline',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __LOCAL_IP__: JSON.stringify(null),
    __SECURE_SHARE_URL__: JSON.stringify(secureShareUrl),
  },
})
