const STATIC_CACHE_NAME = "static-cache-v1.1";
const INMUTABLE_CACHE_NAME = "inmutable-cache-v1.1";
const DYNAMIC_CACHE_NAME = "dynamic-cache-v1.2";

const files = [
  '/',
  './animales.html',
  './images/gato.png',
  './index.html', 
  './css/style.css', 
  './js/app.js',
  'service-worker.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js',
  'https://unpkg.com/sweetalert/dist/sweetalert.min.js'
];

// Evento de instalación: almacenar archivos en el caché inmutable
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(INMUTABLE_CACHE_NAME).then((cache) => {
      return cache.addAll(files);
    })
  );
});

// Evento de activación: limpiar cachés antiguas
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

// Evento de fetch: manejar solicitudes a la API y otros recursos
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("https://reqres.in/api/users")) {
    // Si la solicitud es para la API, intenta obtener y almacenar en caché dinámico
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            cleanCache(DYNAMIC_CACHE_NAME, 50);
            return response;
          });
        })
        .catch(() => {
          // Si falla, intenta obtener la última respuesta almacenada en caché
          return caches.match(event.request);
        })
    );
  } else {
    // Para otros recursos, intenta cargar desde el caché o almacenar en caché dinámico
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
  }
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
