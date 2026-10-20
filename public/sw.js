// Self-clearing Service Worker to flush cache and prevent stale code
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass all requests straight to network without caching dev files
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
