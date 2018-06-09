/* Common database helper functions. */

import idb from './idb.js'

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}/restaurants`

/**
 * Obtain restaurants from IndexDb
 */
function _fetchRestaurantsIndexDB() {
  // Credit https://developers.google.com/web/ilt/pwa/working-with-indexeddb

  let newDB = false // Needed since fetch statments don't work inside idb

  let dbPromise = idb.open('restaurantsDB', 1, upgradeDb => {
    if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      let store = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' })
      newDB = true
    }
  })

  return dbPromise.then(db => {
    if (newDB) {
      return _updateRestaurantsIndexDB()
    } else {
      _updateRestaurantsIndexDB()
      return db.transaction('restaurants').objectStore('restaurants').getAll().then(restaurants => {
        return restaurants
      }).catch(error => { return [] })
    }
  }).catch(error => { return [] })
}

/**
 * Obtain restaurants from External Server
 */
function _fetchRestaurantsExternal() {
  return fetch(DATABASE_URL).then(response => {
    if (response.status == 200) {
      return response.json().then(body => { return body })
    } else { return [] }
  }).catch(error => { return [] })
}

/**
 * Creates/Updates Restaurant IndexDb
 */
function _updateRestaurantsIndexDB() {
  return _fetchRestaurantsExternal().then(restaurants => {
    idb.open('restaurantsDB', 1).then(db => {
      let tx = db.transaction('restaurants', 'readwrite')
      let store = tx.objectStore('restaurants')
      restaurants.forEach(restaurant => {
        store.put({ id: restaurant.id, address: restaurant.address,
          cuisine_type: restaurant.cuisine_type, latlng: restaurant.latlng, name: restaurant.name,
          neighborhood: restaurant.neighborhood, operating_hours: restaurant.operating_hours,
          photograph: restaurant.photograph, reviews: restaurant.reviews })
      })

      tx.complete
    })

    return restaurants
  })
}

export default {
  /**
   * Obtain list of cuisines from restaurant
   */
  filterCuisines(restaurants) {
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
    // Remove duplicates from cuisines
    return cuisines.filter((v, i) => cuisines.indexOf(v) == i)
  },

  /**
   * Obtain list of neighborhoods from restaurants
   */
  filterNeighborhoods(restaurants) {
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
    // Remove duplicates from neighborhoods
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
  },

  /**
   * takes a list of restaurants and returns associated cuisines and neighborhoods
   */
  filterRestaurants(restaurants) {
    let restaurantFilter = { restaurants: [], cuisines: [], neighborhoods: [] }
    restaurantFilter.restaurants = restaurants
    restaurantFilter.cuisines = this.filterCuisines(restaurants)
    restaurantFilter.neighborhoods = this.filterNeighborhoods(restaurants)
    return restaurantFilter
  },

  /**
   * Filter restaurants by a cuisine and a neighborhood
   */
  filterRestaurantsByCuisineAndNeighborhood(cuisine, neighborhood, restaurants) {
    let results = restaurants

    if (cuisine != 'all') { // filter by cuisine
      results = results.filter(r => r.cuisine_type == cuisine);
    }

    if (neighborhood != 'all') { // filter by neighborhood
      results = results.filter(r => r.neighborhood == neighborhood);
    }

    return results
  },

  /**
   * Fetch all restaurants.
   */
  fetchRestaurants() {
    if ('indexedDB' in window) {
      return _fetchRestaurantsIndexDB().then(response => {
        return this.filterRestaurants(response)
      })
    } else {
      return _fetchRestaurantsExternal().then(response => {
        return this.filterRestaurants(response)
      })
    }
  },

  /**
   * Fetch a restaurant by its ID.
   */
  fetchRestaurantById(id) {
    return fetch(`${DATABASE_URL}/${id}`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => {
          return body
        })
      } else {
        return { error: 'Restaurant does not exist' }
      }
    }).catch(error => {
      return { error: error }
    })
  },

  /**
   * Restaurant image URL.
   */
  imageUrlForRestaurant(restaurant) {
    let imgNumber = Number(restaurant.photograph)
    if (isNaN(imgNumber) || imgNumber < 1 || imgNumber > 10) { imgNumber = 0 }
    return `/img/${imgNumber}.jpg`
  },

  /**
   * Map marker for a restaurant.
   */
  mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  },

  /**
   * Restaurant page URL.
   */
  urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
}
