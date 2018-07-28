/* Interactions with external backend server */

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}`

export default {
  /**
   * Obtain one restaurant from External Server
   */
  fetchRestaurantExternal(id) {
    return fetch(`${DATABASE_URL}/restaurants/${id}`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else {
        return { error: 'Restaurant does not exist' }
      }
    }).catch(error => { return { error: error } })
  },

  /**
   * Obtain restaurants from External Server
   */
  fetchRestaurantsExternal() {
    return fetch(`${DATABASE_URL}/restaurants`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else { return [] }
    }).catch(error => { return [] })
  },

  /**
   * Obtain restaurants from External Server
   */
  fetchReviews(restaurantId) {
    return fetch(`${DATABASE_URL}/reviews/?restaurant_id=${restaurantId}`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else { return [] }
    }).catch(error => { return [] })
  },
}
