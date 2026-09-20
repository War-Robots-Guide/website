import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'WRGICON.png'],
      manifest: {
        name: 'War Robots Guide Database',
        short_name: 'WR Guide',
        description: 'Find optimal builds, check out tier lists, chart weapon DPS, and more at the WRG database!',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
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
        // Keep route chunks out of the install-time precache so that React's
        // dynamic imports remain genuinely on-demand. Requested chunks are
        // cached below for subsequent visits.
        globPatterns: ['**/*.{css,html,ico,png,svg,webmanifest}'],
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lazy-route-scripts-v1',
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/backgrounds\/.*\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'route-backgrounds-v1',
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
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
        }
      }
    }
  }
})
