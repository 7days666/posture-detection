import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8787'  // Wrangler dev 默认端口
    }
  },
  build: {
    outDir: 'dist'
  }
})
