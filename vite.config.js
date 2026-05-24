import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// Custom plugin to copy icon to dist after build
function copyIconPlugin() {
  return {
    name: 'copy-icon',
    closeBundle() {
      try {
        mkdirSync('dist', { recursive: true })
        copyFileSync('public/icon.png', 'dist/icon.png')
      } catch (e) {
        // ignore if public/icon.png doesn't exist
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyIconPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split vendor chunks for faster load
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    }
  },
  server: {
    port: 5173,
  },
})
