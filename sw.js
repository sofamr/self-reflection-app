const CACHE_NAME = 'reflect-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Required by Chrome for install verification
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});