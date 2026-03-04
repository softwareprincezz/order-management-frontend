import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://technical-test-production-ea39.up.railway.app',
        changeOrigin: true
      }
    }
  }
})