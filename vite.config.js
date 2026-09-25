import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "NXX315 Studio Rewards",
        short_name: "NXX315",
        description: "Kiếm coin, đổi thưởng, mini game",
        theme_color: "#3478F6",
        background_color: "#F5F7FB",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,otf,webp,json}",
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // ✅ Fallback về index.html cho SPA
        navigateFallback: "index.html",
        // ✅ Bỏ qua các route động khỏi fallback
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/task\/callback/,
          /^\/history\/order\//,
          /^\/store\//,
          /^\/minigames\//,
          /^\/task\//,
        ],
        runtimeCaching: [
          // ✅ Supabase API — ưu tiên network, timeout 5s
          {
            urlPattern: /^https:\/\/rwglwovohbyqmbbzdvdj\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 giờ
              },
            },
          },
          // ✅ Ảnh — ưu tiên cache
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 ngày
              },
            },
          },
          // ✅ Font Google — cache vĩnh viễn
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 năm
              },
            },
          },
          // ✅ Font files
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          // ✅ CDN bên ngoài (openfpcdn, esm.sh...)
          {
            urlPattern: /^https:\/\/openfpcdn\.io\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-cdn",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});