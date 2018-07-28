/* Credit: https://developers.google.com/web/fundamentals/primers/service-workers/  */

const CACHE_NAME = 'restaurant-v3';

const urlsToCache = [
  '/',
  '/css/index.css',
  '/css/media-queries.css',
  '/css/restaurant.css',
  '/css/styles.css',
  '/img/db/0.webp',
  '/img/db/1.webp',
  '/img/db/2.webp',
  '/img/db/3.webp',
  '/img/db/4.webp',
  '/img/db/5.webp',
  '/img/db/6.webp',
  '/img/db/7.webp',
  '/img/db/8.webp',
  '/img/db/9.webp',
  '/img/db/10.webp',
  '/img/icons/icon-192.png',
  '/img/icons/icon-512.png',
  '/js/dbexternalhelper.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/map.js',
  '/js/restaurant_info.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    }).catch(err => { })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) { return response }

        let fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') { return response }

          let responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache) })

          return response;
        })
      })
    )
})
