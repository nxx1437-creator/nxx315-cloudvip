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
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // ✅ KHÔNG precache index.html và version.json
        //    để luôn lấy từ network
        globPatterns: [
          "**/*.{css,ico,png,svg,woff,woff2,ttf,otf,webp}",
        ],

        // ✅ SW mới thay SW cũ ngay lập tức
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        // ✅ QUAN TRỌNG: KHÔNG dùng navigateFallback
        //    → Không cache index.html → luôn lấy từ server
        navigateFallback: null,

        // ✅ Không cache index.html và version.json
        navigateFallbackDenylist: [
          /^\/index\.html$/,
          /^\/version\.json$/,
          /^\/api/,
          /^\/task\/callback/,
          /^\/history\/order\//,
          /^\/store\//,
          /^\/minigames\//,
        ],

        // ✅ Loại trừ file HTML khỏi precache
        globIgnores: [
          "**/index.html",
          "**/version.json",
        ],

        runtimeCaching: [
          // ✅ version.json: LUÔN lấy từ network
          {
            urlPattern: /\/version\.json$/,
            handler: "NetworkOnly",
          },

          // ✅ JS/CSS bundle: NetworkFirst để lấy bundle mới
          {
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "bundles",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },

          // Supabase API
          {
            urlPattern: /^https:\/\/rwglwovohbyqmbbzdvdj\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },

          // Hình ảnh
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/pages/")) {
            const parts = id.split("/pages/");
            const fileName = parts[1].split(".")[0];
            const pageName = fileName.replace(/[^a-zA-Z0-9]/g, "-");
            return `page-${pageName}`;
          }
          if (id.includes("node_modules")) {
            if (id.includes("react-router")) return "react-vendor";
            if (id.includes("react-dom")) return "react-vendor";
            if (id.includes("react/")) return "react-vendor";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("lucide")) return "lucide";
            if (id.includes("@fingerprintjs")) return "fingerprint";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
