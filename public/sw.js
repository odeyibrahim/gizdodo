/* ============================================
   GIZDODOSPECIALS — Service Worker v3
   Caches static assets for PWA / offline support
   Background order polling when app is in background
   Push notification support
   ============================================ */

var CACHE_NAME = 'gizdodo-v3';
var STATIC_ASSETS = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/admin/',
  '/admin/index.html',
  '/css/admin.css',
  '/js/admin.js',
  '/manifest.json',
  '/logo.svg',
  '/images/logo.jpg',
  '/track.html',
  '/contact.html',
  '/js/track.js',
  '/env.js',
];

// Install: cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS).catch(function () {
        // Some assets may fail (e.g. env.js), that's ok
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API requests: network only (always fresh)
  if (url.pathname.indexOf('/rest/v1/') !== -1) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', function (event) {
  var data = {};
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data = { title: 'New Order', body: event.data.text() }; }
  }
  var title = data.title || 'New Order!';
  var options = {
    body: data.body || 'A new order has been placed.',
    icon: '/images/logo.jpg',
    badge: '/images/logo.jpg',
    vibrate: [200, 100, 200],
    tag: 'gizdodo-order-' + (data.tag || Date.now()),
    renotify: true,
    data: { url: data.url || '/admin/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/admin/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
      // Focus existing admin window if open
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf('/admin') !== -1 && 'focus' in clients[i]) {
          clients[i].focus();
          return;
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Handle messages from the main thread (for background polling coordination)
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
