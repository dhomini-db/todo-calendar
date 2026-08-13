import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA temporariamente desativado. O aplicativo funciona como site normal,
// evitando qualquer service worker capaz de interferir na navegação mobile.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
