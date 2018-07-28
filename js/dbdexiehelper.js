/* Interactions with indexDB */

import ExternalDB from './dbexternalhelper.js'

const dbPromise = new Dexie('restaurantsDB')
const MIN_NUMBER_OF_RESTAURANTS = 5
const MIN_NUMBER_OF_REVIEWS = 1

function _addRestaurantToDB(restaurant) {
  dbPromise.restaurants.put({ id: restaurant.id, address: restaurant.address,
    cuisine_type: restaurant.cuisine_type, latlng: restaurant.latlng, name: restaurant.name,
    neighborhood: restaurant.neighborhood, operating_hours: restaurant.operating_hours,
    photograph: restaurant.photograph, reviews: restaurant.reviews })
}

function _addReviewToDB(review) {
  dbPromise.reviews.put({ id: review.id, comments: review.comments, createdAt: review.createdAt,
    updatedAt: review.updatedAt, name: review.name, rating: review.rating,
    restaurant_id: review.restaurant_id })
}

function _initializeDixieStores() {
  dbPromise.version(1).stores({
    restaurants: 'id,address,cuisine_type,latlng,name,neighborhood,operating_hours,photograph',
    reviews: 'id,createdAt,comments,name,rating,restaurant_id,updatedAt'
  })
}

function _updateRestaurantIndexDB(id) {
  return ExternalDB.fetchRestaurantExternal(id).then(restaurant => {
    if (restaurant.id) {  // don't add bad restaurants to DB
      _addRestaurantToDB(restaurant)
    }
    return restaurant
  })
}

function _updateRestaurantsIndexDB() {
  return ExternalDB.fetchRestaurantsExternal().then(restaurants => {
    restaurants.forEach(restaurant => { _addRestaurantToDB(restaurant) })
    return restaurants
  })
}

function _updateReviewsIndexDB(restaurantId) {
  return ExternalDB.fetchReviews(restaurantId).then(reviews => {
    reviews.forEach(review => { _addReviewToDB(review) })
    return reviews
  })
}

export default {
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
  },

  fetchReviews(restaurantId) {
    return dbPromise.reviews.where('restaurant_id').equals(restaurantId).toArray().then(reviews => {
      if (reviews.length < MIN_NUMBER_OF_REVIEWS) {
        return _updateReviewsIndexDB(restaurantId)
      } else {
        _updateReviewsIndexDB(restaurantId)
        return reviews
      }
    }).catch(error => { return [] })
  },
}
