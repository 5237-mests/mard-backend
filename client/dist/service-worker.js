// Increment this version number when you deploy updates
const CACHE_VERSION = "v4"; // Change this to v3, v4, etc. with each deployment
const CACHE_NAME = `mard-trading-cache-${CACHE_VERSION}`;
const urlsToCache = ["/", "/index.html"];

// Install new service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version:", CACHE_VERSION);
  // Force immediate activation
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for JS, CSS, and JSON files to avoid stale code
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json") ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response and cache it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for images and other static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
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

// Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version:", CACHE_VERSION);
  // Take control immediately
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }
          })
        );
      });
    })
  );
});

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
