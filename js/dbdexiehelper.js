/* Interactions with indexDB */

import ExternalDB from './dbexternalhelper.js'

const dbPromise = new Dexie('restaurantsDB')
const DB_STORE_VERSION = 2
const MIN_NUMBER_OF_RESTAURANTS = 5
const MIN_NUMBER_OF_REVIEWS = 1

// Dexie cannot query on boolean so true/false must be strings
function _addRestaurantToDB(restaurant, matchesExternalDB = 'true') {
  dbPromise.restaurants.put({ id: restaurant.id, address: restaurant.address,
    cuisine_type: restaurant.cuisine_type, latlng: restaurant.latlng, name: restaurant.name,
    neighborhood: restaurant.neighborhood, operating_hours: restaurant.operating_hours,
    photograph: restaurant.photograph, reviews: restaurant.reviews,
    matches_external_db:  matchesExternalDB })
}

function _addReviewToDB(review, matchesExternalDB = 'true') {
  dbPromise.reviews.put({ id: review.id, comments: review.comments, createdAt: review.createdAt,
    updatedAt: review.updatedAt, name: review.name, rating: review.rating,
    restaurant_id: review.restaurant_id, matches_external_db:  matchesExternalDB })
}

function _initializeDixieStores() {
  dbPromise.version(DB_STORE_VERSION).stores({
    restaurants: 'id,address,cuisine_type,latlng,name,neighborhood,operating_hours,photograph,matches_external_db',
    reviews: 'id,createdAt,comments,name,rating,restaurant_id,updatedAt,matches_external_db'
  })
}

function _updateRestaurantIndexDB(dexieRestaurant) {
  if (dexieRestaurant.matches_external_db)  {
    return ExternalDB.fetchRestaurantExternal(dexieRestaurant.id).then(restaurant => {
      if (restaurant.id) {  // don't add bad restaurants to DB
        _addRestaurantToDB(restaurant)
      }
      return restaurant
    })
  } else {
    return ExternalDB.putRestaurant(dexieRestaurant).then(restaurant => {
      if (restaurant.id) {  // don't add bad restaurants to DB
        _addRestaurantToDB(restaurant)
      }
      return restaurant
    })
  }
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
        return _updateRestaurantIndexDB({ id: id, matches_external_db: 'true' })
      } else {
        _updateRestaurantIndexDB(restaurant)
        return restaurant
      }
    }).catch(error => { return _updateRestaurantIndexDB(id) })
  },

  fetchRestaurantsIndexDB() {
    _initializeDixieStores()

    return dbPromise.restaurants.toArray().then(restaurants => {
      restaurants.forEach(restaurant => { _updateRestaurantIndexDB(restaurant) })

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

  postReview(newReview) {
    return ExternalDB.postReview(newReview).then(review => {
      if (review.id) {
        _addReviewToDB(review)
        return review
      } else {
        newReview.id = 'temp'
        _addReviewToDB(newReview, 'false')
        return newReview
      }
    }).catch(error => {
      newReview.id = 'temp'
      _addReviewToDB(newReview, 'false')
      return newReview
    })
  },

  putRestaurant(restaurantUpdate) {
    return ExternalDB.putRestaurant(restaurantUpdate).then(restaurant => {
      if (restaurant.id) {
        _addRestaurantToDB(restaurant)
        return restaurant
      } else {
        _addRestaurantToDB(restaurantUpdate, 'false')
        return restaurantUpdate
      }
    }).catch(error => {
      _addRestaurantToDB(restaurantUpdate, 'false')
      return restaurantUpdate
    })
  }
}
