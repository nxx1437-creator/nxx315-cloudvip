// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'NXX315 Studio';
  const options = {
    body: data.body || 'Bạn có nhiệm vụ mới cần hoàn thành!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
