import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'licoreria.png',
        'icon-192x192.png',
        'icon-512x512.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin.includes('firestore.googleapis.com') ||
              url.origin.includes('firebase.googleapis.com') ||
              url.origin.includes('firebaseio.com'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebase-excluded'
            }
          }
        ]
      }
    })
  ],
  base: '/',
  server: {
    host: '0.0.0.0', // Permite que otros dispositivos accedan al servidor
    port: 5173,
  },
})
