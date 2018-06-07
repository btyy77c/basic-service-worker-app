import idb from './idb.js'

/**
 * Common database helper functions.
 */

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}/restaurants`

/**
 * Obtain restaurants from IndexDb
 */
const _fetchRestaurantsIndexDB = function() {
  // Credit https://developers.google.com/web/ilt/pwa/working-with-indexeddb

  let dbPromise = idb.open('restaurantsDB', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id', autoIncrement: true })
    }
  })

  dbPromise.then(response => {
    console.log(response)
  })

  /*
  var dbPromise = indexedDB.open('restaurants', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id', autoIncrement: true })
    }
  }) */

  return _fetchRestaurantsExternal()
}

/**
 * Obtain restaurants from External Server
 */
const _fetchRestaurantsExternal = function() {
  return fetch(DATABASE_URL).then(response => {
    if (response.status == 200) {
      return response.json().then(body => { return body })
    } else { return [] }
  }).catch(error => { return [] })
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
