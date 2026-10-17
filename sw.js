const CACHE_NAME = 'reflect-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Required by Chrome for installability verification
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});