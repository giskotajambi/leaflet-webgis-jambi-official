// PWA Builder Service Worker untuk WebGIS Kota Jambi
const CACHE_NAME = 'webgis-jambi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/js/main.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js',
  'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css',
  'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js',
  'https://cdn.jsdelivr.net/npm/leaflet.locatecontrol/dist/L.Control.Locate.min.css',
  'https://cdn.jsdelivr.net/npm/leaflet.locatecontrol/dist/L.Control.Locate.min.js'
];

// Install event - Cache files penting
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('[Service Worker] Cache failed:', error);
      })
  );
  // Skip waiting agar service worker langsung aktif
  self.skipWaiting();
});

// Activate event - Bersihkan cache lama
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients agar service worker langsung mengontrol semua halaman
  self.clients.claim();
});

// Fetch event - Strategi: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Untuk request peta tiles (OpenStreetMap, dll)
  if (event.request.url.includes('tile.openstreetmap.org') || 
      event.request.url.includes('tile.thunderforest.com') ||
      event.request.url.includes('basemap.at')) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Clone response untuk disimpan di cache
            const responseClone = response.clone();
            cache.put(event.request, responseClone);
            return response;
          })
          .catch(() => {
            // Jika offline, ambil dari cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Untuk request lainnya: Network First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika berhasil, simpan di cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika network gagal, ambil dari cache
        return caches.match(event.request);
      })
  );
});

// Handle messages dari main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Service Worker loaded');
