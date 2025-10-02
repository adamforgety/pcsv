const CACHE_NAME = 'piano-visualizer-cache-v1';
const urlsToCache = [
  '/', // The main HTML file
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  'https://cdn.tailwindcss.com' // Cache the external library
  // Note: Since we are in a sandbox environment, we can't reliably create and serve
  // custom icons (piano-icon-192.png/512.png). For a real site, these would be included.
];

self.addEventListener('install', (event) => {
  // Perform installation steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and adding files:', CACHE_NAME);
        // We use fetch and then add the response to the cache to handle the CORS nature of the Tailwind CDN.
        return Promise.all(
          urlsToCache.map(url => fetch(url).then(response => cache.put(url, response)))
        );
      })
      .catch((err) => {
        console.error('Failed to cache resources:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // IMPORTANT: Clones the request. A request is a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clones the response. The response is a stream and the browser
            // consumes the original one as it returns it to the page.
            const responseToCache = response.clone();

            // Cache new requests (especially if Tailwind CSS loads late)
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch((error) => {
            console.error('Fetch failed for network request:', error);
            // Fallback for network failures can go here if needed.
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
