import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'WRGICON.png'],
      manifest: {
        name: 'War Robots Guide Database',
        short_name: 'WR Guide',
        description: 'Official database for War Robots Guide. Explore community tier lists, detailed robot value ratings, optimized build guides, weapon DPS comparisons, and automated hangar synergy analyzer.',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        orientation: 'any',
        scope: './',
        start_url: './index.html',
        icons: [
          {
            src: 'WRGICON.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'WRGICON.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'WRGICON.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'WRGICON.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide')) {
              return 'vendor-lucide';
            }
            return 'vendor';
          }
          if (id.includes('src/data/')) {
            return 'data';
          }
        }
      }
    }
  }
})

