import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Expose both VITE_ and NEXT_PUBLIC_ prefixed env vars to the frontend
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
    open: false
  }
})
