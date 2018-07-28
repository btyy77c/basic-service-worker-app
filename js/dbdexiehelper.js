/* Interactions with indexDB */

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
   * Obtain one restaurant from IndexDb
   */
  fetchRestaurantIndexDB(id) {
    _initializeDixieStores()

    return dbPromise.restaurants.get(id).then(restaurant => {
      if (restaurant == undefined) {
        return _updateRestaurantIndexDB(id)
      } else {
        _updateRestaurantIndexDB(id)
        return restaurant
      }
    }).catch(error => { return _updateRestaurantIndexDB(id) })
  },

  /**
   * Obtain restaurants from IndexDb
   */
  fetchRestaurantsIndexDB() {
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
}
