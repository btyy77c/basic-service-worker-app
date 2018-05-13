/* Credit: https://developers.google.com/web/fundamentals/primers/service-workers/  */

var CACHE_NAME = 'restaurant-v1';
var urlsToCache = [
  '/',
  'restaurant.html',
  '/js/*',
  '/css/*'
]


/*
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  )
})
*/
