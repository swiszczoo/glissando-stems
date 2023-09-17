import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      "/api": {
        target: "http://backend-dev:3000",
        changeOrigin: true,
        secure: false,
      },
      '/stems': {
        target: 'http://backend-dev:3000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'static/assets/[hash:16][extname]',
        chunkFileNames: 'static/assets/[hash:16].js',
        entryFileNames: 'static/assets/[hash:16].js',
      },
    },
  },
})
