// V2 to force an update after previous issues
const CACHE_NAME = 'piano-visualizer-cache-v2'; 

// Paths are relative to the service worker's location (root of the repo)
const urlsToCache = [
    './', // Caches index.html implicitly
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com'
];

// Install event: Caches all critical assets
self.addEventListener('install', (event) => {
    // Force the new service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache, adding URLs:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to cache assets during install:', err);
            })
    );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Serves content from cache first, falling back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                // Fallback to network request
                return fetch(event.request).catch(() => {
                    // This catch block handles network failures
                    console.log('Fetch failed, no cached response found in cache.');
                });
            })
    );
});
