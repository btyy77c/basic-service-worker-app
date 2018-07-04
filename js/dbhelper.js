/* Common database helper functions. */

import idb from './idb.js'

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}/restaurants`

/**
 * Add/Update Restaurant IndexDb
 */
function _addRestaurantToDB(store, restaurant) {
  store.put({ id: restaurant.id, address: restaurant.address,
    cuisine_type: restaurant.cuisine_type, latlng: restaurant.latlng, name: restaurant.name,
    neighborhood: restaurant.neighborhood, operating_hours: restaurant.operating_hours,
    photograph: restaurant.photograph, reviews: restaurant.reviews })
}

/**
 * Obtain one restaurant from IndexDb
 */
function _fetchRestaurantIndexDB(id) {
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
      return _updateRestaurantIndexDB(id)
    } else {
      _updateRestaurantIndexDB(id)
      return db.transaction('restaurants', 'readonly').objectStore('restaurants').get(parseInt(id))
        .then(restaurant => {
          if (restaurant == undefined) { return _updateRestaurantIndexDB(id) }
          return restaurant
      })
    }
  }).catch(error => { return _updateRestaurantIndexDB(id) })
}

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
 * Obtain one restaurant from External Server
 */
function _fetchRestaurantExternal(id) {
  return fetch(`${DATABASE_URL}/${id}`).then(response => {
    if (response.status == 200) {
      return response.json().then(body => { return body })
    } else {
      return { error: 'Restaurant does not exist' }
    }
  }).catch(error => { return { error: error } })
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
 * Creates/Updates One Restaurant in IndexDb
 */
function _updateRestaurantIndexDB(id) {
  return _fetchRestaurantExternal(id).then(restaurant => {
    if (restaurant.id) {  // don't add bad restaurants to DB
      idb.open('restaurantsDB', 1).then(db => {
        let tx = db.transaction('restaurants', 'readwrite')
        let store = tx.objectStore('restaurants')
        _addRestaurantToDB(store, restaurant)
        tx.complete
      })
    }

    return restaurant
  })
}

/**
 * Creates/Updates Restaurant IndexDb
 */
function _updateRestaurantsIndexDB() {
  return _fetchRestaurantsExternal().then(restaurants => {
    idb.open('restaurantsDB', 1).then(db => {
      let tx = db.transaction('restaurants', 'readwrite')
      let store = tx.objectStore('restaurants')
      restaurants.forEach(restaurant => { _addRestaurantToDB(store, restaurant) })
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
    if ('indexedDB' in window) {
      return _fetchRestaurantIndexDB(id).then(restaurant => {
        return restaurant
      })
    } else {
      return _fetchRestaurantExternal(id).then(restaurant => {
        return restaurant
      })
    }
  },

  /**
   * Restaurant image URL.
   */
  imageUrlForRestaurant(restaurant) {
    let imgNumber = Number(restaurant.photograph)
    if (isNaN(imgNumber) || imgNumber < 1 || imgNumber > 10) { return '/img/db/0.webp' }
    return `/img/db/${imgNumber}.webp`
  },

  /**
   * Restaurant page URL.
   */
  urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
}
