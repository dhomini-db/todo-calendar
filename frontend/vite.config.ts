import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      /* ── Strategy ──────────────────────────────────────────────
         autoUpdate: the SW updates silently in the background.
         The user gets the new version on next page load.
      ─────────────────────────────────────────────────────────── */
      registerType: 'autoUpdate',

      /* ── Extra static assets to include in precache ─────────── */
      includeAssets: [
        'favicon.svg',
        'logo-icon.svg',
        'logo-full.svg',
        'logo-mono.svg',
        'apple-touch-icon-180x180.png',
      ],

      /* ── Web App Manifest ───────────────────────────────────── */
      manifest: {
        name:             'TaskFlow',
        short_name:       'TaskFlow',
        description:      'Gerencie seus hábitos diários com inteligência. Acompanhe tarefas, streaks e desempenho.',
        theme_color:      '#111111',
        background_color: '#0d0d0d',
        display:          'standalone',
        start_url:        '/',
        scope:            '/',
        orientation:      'portrait-primary',
        lang:             'pt-BR',
        categories:       ['productivity', 'lifestyle'],
        icons: [
          {
            src:   'pwa-64x64.png',
            sizes: '64x64',
            type:  'image/png',
          },
          {
            src:   'pwa-192x192.png',
            sizes: '192x192',
            type:  'image/png',
          },
          {
            src:   'pwa-512x512.png',
            sizes: '512x512',
            type:  'image/png',
          },
          {
            src:     'maskable-icon-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',   // Android adaptive icon
          },
          {
            src:     'logo-icon.svg',
            sizes:   'any',
            type:    'image/svg+xml',
            purpose: 'any',
          },
        ],
      },

      /* ── Workbox service-worker config ──────────────────────── */
      workbox: {
        // Precache all build assets (hashed filenames are safe forever)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // When offline, serve index.html for all navigation requests
        navigateFallback: 'index.html',

        // Don't intercept /api/ routes with the navigation fallback
        navigateFallbackDenylist: [/^\/api\//],

        // ── Runtime caching rules ─────────────────────────────
        runtimeCaching: [
          {
            // Google Fonts — stylesheet (CacheFirst, 1 year)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-styles',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts — font files (CacheFirst, 1 year)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API calls — NetworkFirst (try network → cached data → fail)
            // Gives 8s before falling back to cache; caches 200 responses for 5min
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },

      // Enable the plugin in dev mode so we can test installation locally
      devOptions: {
        enabled: false,
      },
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:       'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
