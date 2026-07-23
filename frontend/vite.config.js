import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_SERVER_URL || 'http://localhost:5050',
        changeOrigin: true
      },
      '/health': {
        target: process.env.VITE_API_SERVER_URL || 'http://localhost:5050',
        changeOrigin: true
      }
    }
  }
})
