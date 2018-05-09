const staticVersion = 'v1.0.0';
const dynamicVersion = 'v1.0.0';
const STATIC_CACHE = `static-${staticVersion}`;
const DYNAMIC_CACHE = `dynamic-${dynamicVersion}`;

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      // cache all the things (important to app)
      console.log('[Service Worker] Pre-caching App Shell');
      cache.addAll([
        "/",
        "./index.html",
        "./restaurant.html",
        "./css/styles.min.css",
        "./css/critical.css",
        "./js/dbhelper.min.js",
        "./js/lazy-load.min.js",
        "./js/idb.min.js",
        "./js/main.min.js",
        "./js/restaurant_info.min.js",
        "./img/1_thumb.webp",
        "./img/2_thumb.webp",
        "./img/3_thumb.webp",
        "./img/4_thumb.webp",
        "./img/5_thumb.webp",
        "./img/6_thumb.webp",
        "./img/7_thumb.webp",
        "./img/8_thumb.webp",
        "./img/9_thumb.webp",
        "./img/10_thumb.webp",
        "./img/1.webp",
        "./img/2.webp",
        "./img/3.webp",
        "./img/4.webp",
        "./img/5.webp",
        "./img/6.webp",
        "./img/7.webp",
        "./img/8.webp",
        "./img/9.webp",
        "./img/10.webp",
        "./img/app_icons/icons_48px.png",
        "./img/app_icons/icons_96px.png",
        "./img/app_icons/icons_192px.png",
        "./img/app_icons/icons_512px.png",
        "./img/app_icons/restaurant.png",
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] deleting old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(res =>
        // implicit return of dynamically loaded items
        caches
          .open(DYNAMIC_CACHE)
          .then(cache => {
            cache.put(event.request.url, res.clone()); // clone res because the res is only consumable once
            // return the response so dynamic content is loaded initially
            return res;
          })
          .catch()
      );
    })
  );
});