/* Interactions with external backend server */

const PORT = 1337
const DATABASE_URL = `http://localhost:${PORT}`

export default {
  fetchRestaurantExternal(id) {
    return fetch(`${DATABASE_URL}/restaurants/${id}`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else {
        return { error: 'Restaurant does not exist' }
      }
    }).catch(error => { return { error: error } })
  },

  fetchRestaurantsExternal() {
    return fetch(`${DATABASE_URL}/restaurants`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else { return [] }
    }).catch(error => { return [] })
  },

  fetchReviews(restaurantId) {
    return fetch(`${DATABASE_URL}/reviews/?restaurant_id=${restaurantId}`).then(response => {
      if (response.status == 200) {
        return response.json().then(body => { return body })
      } else { return [] }
    }).catch(error => { return [] })
  },

  postReview(newReview) {
    return fetch(`${DATABASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(newReview)
    }).then(response => {
      if (response.status == 201) {
        return response.json().then(body => { return body })
      } else {
        return { error: 'Failed to save review' }
      }
    }).catch(error => { return { error: error } })
  },

  putRestaurantFavorite(id, is_favorite) {
    return fetch(`${DATABASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_favorite: is_favorite })
    }).then(response => {
      if (response.status == 201) {
        return response.json().then(body => { return body })
      } else {
        return { error: 'Failed to update favorite' }
      }
    }).catch(error => { return { error: error } })
  }
}
