// Service Worker for HTML to PNG Converter PWA
// Version 2.0.0

const CACHE_NAME = 'html2png-v2.0.0';
const STATIC_CACHE = 'html2png-static-v2.0.0';
const DYNAMIC_CACHE = 'html2png-dynamic-v2.0.0';
const OFFLINE_CACHE = 'html2png-offline-v2.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/image-manager.js',
  '/history-manager.js',
  '/social-share.js',
  '/auth.js',
  '/translations.js',
  '/cache-manager.js',
  '/lazy-loader.js',
  '/conversion-worker.js',
  '/manifest.json',
  // External dependencies
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Offline fallback page
const OFFLINE_PAGE = '/offline.html';

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static files...');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, { cache: 'reload' })));
      }),
      
      // Create offline cache
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Creating offline cache...');
        return cache.add(OFFLINE_PAGE);
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== OFFLINE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// Fetch event - serve cached content and handle offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle static assets (CSS, JS, fonts, etc.)
function handleStaticAsset(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return fetch(request).then((response) => {
      // Cache successful responses
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Return offline fallback for critical assets
      if (request.url.includes('.css')) {
        return new Response('/* Offline mode - styles unavailable */', {
          headers: { 'Content-Type': 'text/css' }
        });
      }
      if (request.url.includes('.js')) {
        return new Response('// Offline mode - script unavailable', {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }
    });
  });
}

// Handle API requests
function handleAPIRequest(request) {
  return fetch(request).then((response) => {
    // Cache successful API responses
    if (response.status === 200) {
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  }).catch(() => {
    // Try to serve from cache
    return caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline API response
      return new Response(JSON.stringify({
        error: 'Offline mode',
        message: 'This feature requires an internet connection'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
}

// Handle image requests
function handleImageRequest(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return fetch(request).then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Return placeholder image for offline mode
      return generatePlaceholderImage();
    });
  });
}

// Handle navigation requests
function handleNavigationRequest(request) {
  return fetch(request).catch(() => {
    // Serve cached page or offline fallback
    return caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Serve offline page
      return caches.match(OFFLINE_PAGE);
    });
  });
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg)$/) ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'cdnjs.cloudflare.com';
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('api.') ||
         url.pathname.includes('/auth/');
}

function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);
}

function generatePlaceholderImage() {
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">
        Image unavailable offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-conversions') {
    event.waitUntil(syncConversions());
  } else if (event.tag === 'sync-templates') {
    event.waitUntil(syncTemplates());
  } else if (event.tag === 'sync-history') {
    event.waitUntil(syncHistory());
  }
});

// Sync functions
async function syncConversions() {
  try {
    // Get pending conversions from IndexedDB
    const pendingConversions = await getPendingConversions();
    
    for (const conversion of pendingConversions) {
      try {
        // Attempt to sync with server
        await syncConversionToServer(conversion);
        // Mark as synced
        await markConversionAsSynced(conversion.id);
      } catch (error) {
        console.log('[SW] Failed to sync conversion:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync conversions failed:', error);
  }
}

async function syncTemplates() {
  // Similar implementation for templates
  console.log('[SW] Syncing templates...');
}

async function syncHistory() {
  // Similar implementation for history
  console.log('[SW] Syncing history...');
}

// Placeholder functions for IndexedDB operations
async function getPendingConversions() {
  // Implementation would use IndexedDB to get pending items
  return [];
}

async function syncConversionToServer(conversion) {
  // Implementation would send conversion to server
  return Promise.resolve();
}

async function markConversionAsSynced(id) {
  // Implementation would mark item as synced in IndexedDB
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/assets/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('HTML to PNG Converter', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

console.log('[SW] Service Worker loaded successfully');