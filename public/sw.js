/* ============================================
   GIZDODOSPECIALS — Service Worker
   Caches static assets for PWA / offline support
   Enables background notification support
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
  '/track.html',
  '/contact.html',
  '/js/track.js',
];

function isHttpScheme(url) {
  try { return url.indexOf('http') === 0; } catch (e) { return false; }
}

// Install: cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
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

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', function (event) {
  var url = event.request.url;
  // Only handle http/https requests — ignore chrome-extension, data, etc.
  if (!isHttpScheme(url)) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Cache successful same-origin GET responses
        if (event.request.method === 'GET' && response.ok && isHttpScheme(url)) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf('/admin/') !== -1 && 'focus' in clients[i]) {
          clients[i].focus();
          return;
        }
      }
      return self.clients.openWindow('/admin/');
    })
  );
});
