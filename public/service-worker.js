const STATIC_CACHE_NAME = "static-cache-v1.1";
const INMUTABLE_CACHE_NAME = "inmutable-cache-v1.1";
const DYNAMIC_CACHE_NAME = "dynamic-cache-v1.1";

const files = [
  '/',
  '/animales.html',
  '/images/gato.png',
  'https://reqres.in/api/users',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js',
  'https://unpkg.com/sweetalert/dist/sweetalert.min.js',
  '/index.html', 
  '/css/style.css', 
  '/js/app.js',
  'service-worker.js'
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(INMUTABLE_CACHE_NAME).then((cache) => {
      return cache.addAll(files);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            cleanCache(DYNAMIC_CACHE_NAME, 50);
            return fetchResponse;
          });
        })
      );
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== INMUTABLE_CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

// Función para limpiar el caché
const cleanCache = (cacheName, maxSize) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((items) => {
      if (items.length >= maxSize) {
        cache.delete(items[0]).then(() => cleanCache(cacheName, maxSize));
      }
    });
  });
};
