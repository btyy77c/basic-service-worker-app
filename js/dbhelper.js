/* Common database helper functions. */

import ExternalDB from './dbexternalhelper.js'

const dbPromise = new Dexie('restaurantsDB')
const MIN_NUMBER_OF_RESTAURANTS = 5

/**
 * Add/Update Restaurant IndexDb
 */
function _addRestaurantToDB(restaurant) {
  dbPromise.restaurants.put({ id: restaurant.id, address: restaurant.address,
    cuisine_type: restaurant.cuisine_type, latlng: restaurant.latlng, name: restaurant.name,
    neighborhood: restaurant.neighborhood, operating_hours: restaurant.operating_hours,
    photograph: restaurant.photograph, reviews: restaurant.reviews })
}

/**
 * Add/Update Stores in IndexDB
 */
function _initializeDixieStores() {
  dbPromise.version(1).stores({
    restaurants: 'id,address,cuisine_type,latlng,name,neighborhood,operating_hours,photograph',
    reviews: 'id'
  })
}

/**
 * Obtain one restaurant from IndexDb
 */
function _fetchRestaurantIndexDB(id) {
  _initializeDixieStores()

  return dbPromise.restaurants.get(id).then(restaurant => {
    if (restaurant == undefined) {
      return _updateRestaurantIndexDB(id)
    } else {
      _updateRestaurantIndexDB(id)
      return restaurant
    }
  }).catch(error => { return _updateRestaurantIndexDB(id) })
}

/**
 * Obtain restaurants from IndexDb
 */
function _fetchRestaurantsIndexDB() {
  _initializeDixieStores()

  return dbPromise.restaurants.toArray().then(restaurants => {
    if (restaurants.length < MIN_NUMBER_OF_RESTAURANTS) {
      return _updateRestaurantsIndexDB()
    } else {
      _updateRestaurantsIndexDB()
      return restaurants
    }
  }).catch(error => { return [] })
}

/**
 * Creates/Updates One Restaurant in IndexDb
 */
function _updateRestaurantIndexDB(id) {
  return ExternalDB.fetchRestaurantExternal(id).then(restaurant => {
    if (restaurant.id) {  // don't add bad restaurants to DB
      _addRestaurantToDB(restaurant)
    }
    return restaurant
  })
}

/**
 * Creates/Updates All Restaurants in IndexDb
 */
function _updateRestaurantsIndexDB() {
  return ExternalDB.fetchRestaurantsExternal().then(restaurants => {
    restaurants.forEach(restaurant => { _addRestaurantToDB(restaurant) })
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
      return ExternalDB.fetchRestaurantsExternal().then(response => {
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
      return ExternalDB.fetchRestaurantExternal(id).then(restaurant => {
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
