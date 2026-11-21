const CACHE_NAME = 'claimo-shell-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/fonts/space-grotesk-600.woff2',
  '/fonts/space-grotesk-700.woff2',
  '/fonts/inter-400.woff2',
  '/fonts/inter-500.woff2',
  '/fonts/inter-600.woff2',
  '/fonts/noto-sans-telugu-500.woff2',
  '/fonts/noto-sans-telugu-600.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Never cache backend API requests or non-GET requests
  if (event.request.method !== 'GET' || requestUrl.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cached, and update in background if online
        fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
