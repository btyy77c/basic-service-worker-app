import DBHelper from './dbhelper.js'
import Map from './map.js'

let restaurant;
let reviews = []

function createReviewHTML(review) {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

function fetchRestaurantFromURL() {
  if (restaurant) { return } // restaurant already fetched!

  const id = new URL(window.location.href).searchParams.get('id')

  if (!id) { return } // no id found in URL

  DBHelper.fetchRestaurantById(id).then(r => {
    if (r.id) {
      restaurant = r
      fetchReviews()
      fillRestaurantHTML()
      fillBreadcrumb()
      setMap()
    }
  })
}

function fetchReviews() {
  DBHelper.fetchReviews(restaurant.id).then(r => {
    reviews = r
    fillReviewsHTML()
  })
}

function fillBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page')
  breadcrumb.appendChild(li);
}

function fillRestaurantHTML() {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.setAttribute('alt', `Image for ${restaurant.name}`)
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

function fillRestaurantHoursHTML(operatingHours = restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

function fillReviewsHTML() {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (reviews.length < 1) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

function setMap() {
  Map.initMap(restaurant.latlng, 16)
  Map.addMarkerToMap(restaurant)
}


document.addEventListener('DOMContentLoaded', () => { fetchRestaurantFromURL() })
export default {}
