/* Common database helper functions. */

import ExternalDB from './dbexternalhelper.js'
import DexieDB from './dbdexiehelper.js'

export default {
  filterCuisines(restaurants) {
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
    // Remove duplicates from cuisines
    return cuisines.filter((v, i) => cuisines.indexOf(v) == i)
  },

  filterNeighborhoods(restaurants) {
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
    // Remove duplicates from neighborhoods
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
  },

  filterRestaurants(restaurants) {
    let restaurantFilter = { restaurants: [], cuisines: [], neighborhoods: [] }
    restaurantFilter.restaurants = restaurants
    restaurantFilter.cuisines = this.filterCuisines(restaurants)
    restaurantFilter.neighborhoods = this.filterNeighborhoods(restaurants)
    return restaurantFilter
  },

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

  fetchReviews(restaurantId) {
    if ('indexedDB' in window) {
      return DexieDB.fetchReviews(restaurantId).then(reviews => {
        return this.sortReviews(reviews)
      })
    } else {
      return ExternalDB.fetchReviews(restaurantId).then(reviews => {
        return this.sortReviews(reviews)
      })
    }
  },

  imageUrlForRestaurant(restaurant) {
    let imgNumber = Number(restaurant.photograph)
    if (isNaN(imgNumber) || imgNumber < 1 || imgNumber > 10) { return '/img/db/0.webp' }
    return `/img/db/${imgNumber}.webp`
  },

  postReview(newReview) {
    if ('indexedDB' in window) {
      return DexieDB.postReview(newReview).then(review => { return review })
    } else {
      return ExternalDB.postReview(newReview).then(review => { return review })
    }
  },

  sortReviews(reviews) {
    return reviews.sort((a, b) => { return new Date(b.createdAt) - new Date(a.createdAt) })
  },

  urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
}
