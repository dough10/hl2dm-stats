var CACHE_NAME = 'cache-v1.5';
var urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/js/main.js',
  '/css/paper-ripple.min.css',
  '/js/paper-ripple.min.js',
  '/images/avatar.png',
  '/images/logo.png',
  '/images/logo152.png',
  '/images/logo192.png',
  '/fonts/halflife2.ttf',
  '/fonts/hl2mp.ttf',
  '/fonts/csd.ttf',
  'fonts/roboto-v15-latin-regular.woff2',
  'fonts/roboto-v15-latin-regular.woff',
  'fonts/roboto-v15-latin-regular.ttf',
  'fonts/roboto-v15-latin-regular.svg',
  'fonts/roboto-v15-latin-regular.eot'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
