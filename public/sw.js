const CACHE_NAME = "nxx315-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Cài đặt
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Kích hoạt
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first cho JS/CSS/images
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Không cache các request tới Supabase
  if (url.hostname.includes("supabase")) return;

  // Bỏ qua request không phải GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Chỉ cache response hợp lệ
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        // Nếu offline → trả về trang chủ (cho navigation)
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
