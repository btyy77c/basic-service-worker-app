/* Common database helper functions. */

import ExternalDB from './dbexternalhelper.js'
import DexieDB from './dbdexiehelper.js'

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
      return DexieDB.fetchRestaurantsIndexDB().then(response => {
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
      return DexieDB.fetchRestaurantIndexDB(id).then(restaurant => {
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
