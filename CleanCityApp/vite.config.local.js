import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local development configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    // For local backend development
    proxy: {
      '/api': {
        target: 'https://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
