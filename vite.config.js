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
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2,ttf,otf,webp}"],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/task\/callback/,
          /^\/history\/order\//,
          /^\/store\//,
          /^\/minigames\//,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rwglwovohbyqmbbzdvdj\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // ✅ Tách chunk theo route — giúp load nhanh + update ngầm
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Tách từng page thành chunk riêng
          if (id.includes("/pages/")) {
            const parts = id.split("/pages/");
            const fileName = parts[1].split(".")[0];
            const pageName = fileName.replace(/[^a-zA-Z0-9]/g, "-");
            return `page-${pageName}`;
          }
          // Tách vendor
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
