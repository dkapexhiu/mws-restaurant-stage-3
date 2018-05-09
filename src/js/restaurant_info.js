let restaurant;
var map;

/**
 * @description Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      // https://stackoverflow.com/questions/30531075/
      google.maps.event.addListener(self.map, "tilesloaded", function () {
        [].slice.apply(document.querySelectorAll('#map a,button')).forEach(function (item) {
          item.setAttribute('tabindex', '0');
        });
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * @description Get current restaurant from page URL.
 * @param {function} callback
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      fillFloatingAction();
      callback(null, restaurant);
    });
  }
}

/**
 * Fetch Review from URL
 */
fetchReviewFromURL = () => {
  if (self.review) { // restaurant already fetched!
    // callback(null, self.restaurant)
    return;
  }

  const id = getParameterByName('id');


  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    // callback(error, null);
  } else {
    DBHelper.fetchReviewById(id,(error, reviews) => {

      self.reviews = reviews;

      if (!reviews) {
        console.error(error);
        fillReviewsHTML(null);
        return;
      }
      fillReviewsHTML();
    })
  }
}

/**
 * @description Create restaurant HTML and add it to the webpage
 * @param {object} restaurant
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.setAttribute("tabindex", "0");
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.setAttribute("tabindex", "0");
  address.innerHTML = restaurant.address;

  if (restaurant.photograph) {
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img js-lazy-image';
  image.setAttribute('aria-label', "fig_" + restaurant.id);
  image.setAttribute('role', 'img');
  var imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('data-src', imgSrc+'.webp');
  image.setAttribute("tabindex", "0");
  image.alt = `${restaurant.name} Restaurant`;
  image.onload =  lazyLoad();
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
  fetchReviewFromURL();

}

/**
 * @description Create restaurant operating hours HTML table and add it to the webpage.
 * @param {object} operatingHours
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.setAttribute("tabindex", "0");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.setAttribute("tabindex", "0");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * @description Create all reviews HTML and add them to the webpage.
 * @param {object} reviews 
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
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

/**
 * @description Create review HTML and add it to the webpage.
 * @param {object} review
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute("tabindex", "0");
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("tabindex", "0");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute("tabindex", "0");
  li.appendChild(comments);

  return li;
}

/**
 * Fill floating action
 */

fillFloatingAction = (restaurant=self.restaurant) => {

  var floatingAction = document.querySelector('#floating-action');

  const favIcon = document.createElement('span');
  favIcon.className = 'fav-icon';
  favIcon.setAttribute('data-id', restaurant.id);
  const favImg = document.createElement('img');


  if (restaurant.is_favorite === 'true') {
    favImg.alt = 'restaurant is favourite';
    favImg.src = 'img/app_icons/ic_favorite_black_24px.svg';
    favImg.className = 'fav-img fav-fill';
  } else {
    favImg.alt = 'restaurant is not favourite';
    favImg.src = 'img/app_icons/ic_favorite_border_black.svg';
    favImg.className = 'fav-img';
  }

  // Adds EventListner to change favourite options
  favImg.addEventListener('click', (e) => {

    if (e.target === e.currentTarget) {

      var classAttr = e.target.className;

      if (classAttr === 'fav-img') {
        DBHelper.restaurantFavouriteHandler(restaurant.id, true, (error, response) => {
          if (response) {
            favImg.alt = 'restaurant is favourite';
            favImg.src = 'img/app_icons/ic_favorite_black_24px.svg';
            e.target.className = 'fav-img fav-fill';
          }
          else {
            alert("Something Went Wrong");
            console.log(error);
          }
        })

      } else {
        DBHelper.restaurantFavouriteHandler(restaurant.id, false, (error, response) => {
          if (response) {
            favImg.alt = 'restaurant is not favourite';
            favImg.src = 'img/app_icons/ic_favorite_border_black.svg';
            e.target.className = 'fav-img';
          }
          else {
            alert("Something Went Wrong");
            console.log(error);
          }
        })
      }
    }
  });

  favIcon.append(favImg);
  floatingAction.append(favIcon);
}

/**
 * Get date from timestamp
 */

getDateFromTimestamp = (timeStamp) => {
  var date = new Date(timeStamp);

  return date.getDate() +'/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}

/**
 * @description Add restaurant name to the breadcrumb navigation menu
 * @param {object} restaurant
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * @description Get a parameter by name from page URL.
 * @param {string} name
 * @param {string} url
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Upload reviews to the database
 */
uploadReview = (restaurant = self.restaurant) => {
  const id = restaurant.id;
  const name = document.getElementById("name").value;
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;

  // Put all the parameters together and ready to post
  let review_info = {
    restaurant_id: id,
    name: name,
    rating: rating,
    comments: comment,
  }
    
    fetch(`http:/localhost:1337/reviews/`, {
        method: 'post',
        body: JSON.stringify(review_info)
      })
      .then(res => res.json())
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.log(error);
      });

    // reload the doc and we should see it
    setTimeout(function () { window.location.reload(); }, 1000);

  return false;

}
