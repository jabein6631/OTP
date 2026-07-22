import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In development, proxy /api calls to the backend on port 5000
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
