// PWA Builder Service Worker - Optimized for First Load
const CACHE_NAME = 'webgis-jambi-v2';

// Hanya cache file penting, jangan cache map tiles
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/js/main.js'
];

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('[SW] Cache failed:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network First dengan timeout
self.addEventListener('fetch', event => {
  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Untuk map tiles: Network only, no cache
  if (event.request.url.includes('tile.openstreetmap.org') ||
      event.request.url.includes('tile.thunderforest.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Untuk file statis: Network First, fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

console.log('[SW] Service Worker loaded');
