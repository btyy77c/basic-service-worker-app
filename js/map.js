import DBHelper from './dbhelper.js'

let map = null
let markers = []

/**
 * Map marker for a restaurant.
 */
function _mapMarkerForRestaurant(restaurant) {
  if (map == null) { return }
  // https://leafletjs.com/reference-1.3.0.html#marker
  const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
    { title: restaurant.name, alt: restaurant.name, url: DBHelper.urlForRestaurant(restaurant) })
  marker.addTo(map)
  return marker
}

export default {
  /**
   * Add markers for current restaurants to the map.
   */
  addMarkerToMap(restaurant) {
    const marker = _mapMarkerForRestaurant(restaurant)
    marker.on('click', () => { window.location.href = marker.options.url })
    markers.push(marker)
    return marker
  },

  /**
   * Initialize leaflet map.
   */
  initMap(center, zoom) {
    map = L.map('map', {
      center: center,
      zoom: zoom,
      scrollWheelZoom: false
    })

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1IjoiYnR5eTc3YyIsImEiOiJjamo1a2U5azQweGw0M29wb2w1NDZ3MGl5In0.D6kRVEeV-dMfC-bJWil8WA',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(map)
    return map
  },

  /**
   * Clear current map markers.
   */
   resetMarkers() {
     markers.forEach(marker => marker.remove())
     markers = []
     return markers
   }
}
