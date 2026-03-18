import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/HertiX/admin/',
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      '/HertiX': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
})