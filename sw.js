/* Credit: https://developers.google.com/web/fundamentals/primers/service-workers/  */

const CACHE_NAME = 'restaurant-v1';
const urlsToCache = [
  '/',
  '/restaurant.html',
  '/css/index.css',
  '/css/media-queries.css',
  '/css/restaurant.css',
  '/css/styles.css',
  '/data/restaurants.json',
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
