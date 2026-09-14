import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',  // Hiện popup khi có bản mới
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'NXX315 Studio Rewards',
        short_name: 'NXX315',
        description: 'Nền tảng nhiệm vụ & phần thưởng',
        theme_color: '#3478F6',
        background_color: '#FAFBFC',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',  // Không cache Supabase API
          },
        ],
      },
    }),
  ],
})
