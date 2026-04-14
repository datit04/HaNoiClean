import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    },
    allowedHosts: ['revise-deport-pulse.ngrok-free.dev']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
