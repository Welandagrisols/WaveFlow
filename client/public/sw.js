// Service Worker for Yasinga PWA
const CACHE_NAME = 'yasinga-v2.0.0-fixed';
const STATIC_CACHE = 'yasinga-static-v2.0.0-fixed';
const DYNAMIC_CACHE = 'yasinga-dynamic-v2.0.0-fixed';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/app-icon.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/auth/user',
  '/api/categories',
  '/api/transactions',
  '/api/transactions/summary',
  '/api/transactions/by-category',
  '/api/suppliers',
  '/api/items'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests (HTML pages) - ALWAYS fetch fresh for now
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle static assets with Cache First strategy
  event.respondWith(cacheFirstStrategy(request));
});

// Network First Strategy for API calls
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, try cache
    return await caches.match(request) || createOfflineResponse(request);
  } catch (error) {
    // Network error, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

// Cache First Strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return caches.match('/index.html');
  }
}

// Create offline response for API endpoints
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Return appropriate offline responses for different API endpoints
  if (url.pathname.includes('/api/transactions/summary')) {
    return new Response(JSON.stringify({
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0,
      message: 'Offline mode - showing cached or default data'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/transactions')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/categories')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Generic offline response
  return new Response(JSON.stringify({
    error: 'No internet connection',
    message: 'This feature requires an internet connection'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle background sync for offline transactions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// Sync offline transactions when connection is restored
async function syncOfflineTransactions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    // Implementation would sync offline stored data
    console.log('Service Worker: Syncing offline transactions');
  } catch (error) {
    console.error('Service Worker: Error syncing transactions', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push notification received', data);
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/app-icon.svg',
        badge: '/favicon-32x32.png',
        tag: 'yasinga-notification'
      })
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});