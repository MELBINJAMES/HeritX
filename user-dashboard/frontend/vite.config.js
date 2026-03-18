import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/HertiX/user-dashboard/frontend/',
    plugins: [react()],
    server: {
        port: 3001,
        strictPort: true,
        proxy: {
            '/HertiX': {
                target: 'http://localhost',
                changeOrigin: true
            }
        }
    }
})
