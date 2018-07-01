import DBHelper from './dbhelper.js'

let cuisines = []
let displayRestaurants = []
let restaurants = []
let neighborhoods = []

var map = null
var markers = []

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  }

  try {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    })
  } catch (error) {}

  fillVariables()
  document.getElementById('cuisines-select').addEventListener('change', updateRestaurants)
  document.getElementById('neighborhoods-select').addEventListener('change', updateRestaurants)
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkerToMap(restaurant) {
  if (map == null) { return }
  const marker = DBHelper.mapMarkerForRestaurant(restaurant, map)
  google.maps.event.addListener(marker, 'click', () => { window.location.href = marker.url })
  markers.push(marker)
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const container = document.getElementById('restaurants-list')
  const div = document.createElement('div')
  div.className = 'responsive'

  const image = document.createElement('div')
  image.className = 'restaurant-img'
  image.style.backgroundImage = `url(${DBHelper.imageUrlForRestaurant(restaurant)})`
  image.setAttribute('aria-label', `Image for ${restaurant.name}`)
  image.setAttribute('role', `img`)
  image.setAttribute('alt', `Image for ${restaurant.name}`)
  div.append(image)

  const innerDiv = document.createElement('div')
  innerDiv.className = 'restaurant-text'
  div.append(innerDiv)

  const name = document.createElement('h3')
  name.innerHTML = restaurant.name
  innerDiv.append(name)

  const neighborhood = document.createElement('p')
  neighborhood.innerHTML = restaurant.neighborhood
  innerDiv.append(neighborhood)

  const address = document.createElement('p')
  address.innerHTML = restaurant.address
  innerDiv.append(address)

  const more = document.createElement('a')
  more.innerHTML = 'View Details'
  more.href = DBHelper.urlForRestaurant(restaurant)
  innerDiv.append(more)

  container.append(div)
  addMarkerToMap(restaurant)
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML() {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML() {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML() {
  resetRestaurants()
  displayRestaurants.forEach(restaurant => { createRestaurantHTML(restaurant) })
}

/**
 * Update restaurants, cuisines, neighborhoods, and map
 */
function fillVariables() {
  DBHelper.fetchRestaurants().then(response => {
    cuisines = response.cuisines
    neighborhoods = response.neighborhoods
    restaurants = response.restaurants
    displayRestaurants = response.restaurants
    fillNeighborhoodsHTML()
    fillCuisinesHTML()
    fillRestaurantsHTML()
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants() {
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
}

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cuisine = cSelect[cSelect.selectedIndex].value;
  const neighborhood = nSelect[nSelect.selectedIndex].value;

  displayRestaurants = DBHelper.
                       filterRestaurantsByCuisineAndNeighborhood(cuisine, neighborhood, restaurants)
  fillRestaurantsHTML()
}


/**
 * Sometimes Google Maps fails to load
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    google.maps
  } catch(error) {
    window.initMap()
  }
})

export default {}
