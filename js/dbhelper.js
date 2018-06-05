/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Obtain list of cuisines from restaurant
   */
  static filterCuisines(restaurants) {
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
    // Remove duplicates from cuisines
    return cuisines.filter((v, i) => cuisines.indexOf(v) == i)
  }

  /**
   * Obtain list of neighborhoods from restaurants
   */
  static filterNeighborhoods(restaurants) {
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
    // Remove duplicates from neighborhoods
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
  }

  /**
   * Filter restaurants by a cuisine and a neighborhood
   */
  static filterRestaurantsByCuisineAndNeighborhood(cuisine, neighborhood, restaurants) {
    let results = restaurants

    if (cuisine != 'all') { // filter by cuisine
      results = results.filter(r => r.cuisine_type == cuisine);
    }

    if (neighborhood != 'all') { // filter by neighborhood
      results = results.filter(r => r.neighborhood == neighborhood);
    }

    return results
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    let restaurants = { restaurants: [], cuisines: [], neighborhoods: [] }

    if ('indexedDB' in window) {
      return DBHelper._fetchRestaurantsIndexDB(restaurants)
    } else {
      return DBHelper._fetchRestaurantsExternal(restaurants)
    }
  }

  /**
   * Obtain restaurants from External Server
   */
  static _fetchRestaurantsExternal(restaurants) {
    return fetch(DBHelper.DATABASE_URL).then(response => {
      if (response.status == 200) {
        return response.json().then(body => {
          restaurants.restaurants = body
          restaurants.cuisines = DBHelper.filterCuisines(body)
          restaurants.neighborhoods = DBHelper.filterNeighborhoods(body)
          return restaurants
        })
      } else {
        return restaurants
      }
    }).catch(error => {
      return restaurants
    })
  }

  /**
   * Obtain restaurants from IndexDb
   */
  static _fetchRestaurantsIndexDB(restaurants) {
    // Credit https://developers.google.com/web/ilt/pwa/working-with-indexeddb
    let dbPromise = idb.open('restaurants', 1, function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        upgradeDb.createObjectStore('restaurants', { keyPath: 'all', autoIncrement: true })
      }
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    return fetch(`${DBHelper.DATABASE_URL}/${id}`).then(response => {
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
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

}
