/* Credit: https://developers.google.com/web/fundamentals/primers/service-workers/  */

const CACHE_NAME = 'restaurant-v2';

const urlsToCache = [
  '/',
  '/css/index.css',
  '/css/media-queries.css',
  '/css/restaurant.css',
  '/css/styles.css',
  '/img/db/0.jpg',
  '/img/db/1.jpg',
  '/img/db/2.jpg',
  '/img/db/3.jpg',
  '/img/db/4.jpg',
  '/img/db/5.jpg',
  '/img/db/6.jpg',
  '/img/db/7.jpg',
  '/img/db/8.jpg',
  '/img/db/9.jpg',
  '/img/db/10.jpg',
  '/img/icons/icon-192.png',
  '/img/icons/icon-512.png',
  '/js/main.js',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    }).catch(err => {
      console.log(err)
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        let fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          let responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
      })
    )
})

/*
const urlsToCache = [
  '/',
  '/restaurant.html',
  '/css/index.css',
  '/css/media-queries.css',
  '/css/restaurant.css',
  '/css/styles.css',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js'
] */
