/* Interactions with external backend server */

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}/restaurants`

export default {
  /**
   * Obtain one restaurant from External Server
   */
  fetchRestaurantExternal(id) {
    return fetch(`${DATABASE_URL}/${id}`).then(response => {
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
    return fetch(DATABASE_URL).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else { return [] }
    }).catch(error => { return [] })
  }
}
