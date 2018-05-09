/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const restaurantsURL = `${DBHelper.DATABASE_URL}`;
    fetch(restaurantsURL)
      .then(response => {
        if (response.status === 200) {
          response.json()
            .then(json => {
              callback(null, json);
            }).catch(error => {
              callback(error, null);
            });
        } else {
          callback((`Request failed. ${response.status}`), null);
        }
      }
      ).catch(error => callback(error, null));
  }

  /**
   * Fetch all reviews.
   */
  static fetchReview(callback) {
    fetch('http://localhost:1337/reviews')
      .then(response => {
          if (response.status === 200) {
            response.json()
              .then(json => {
                callback(null, json);
                return
              }).catch(error => {
              callback(error, null)
            });
          } else {
            callback((`Request failed. Returned status of ${response.status}`), null);
          }
        }
      ).catch(error => callback(error, null));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch a review by restaurant id.
   */
  static fetchReviewById(id, callback) {

    fetch('http://localhost:1337/reviews/?restaurant_id='+id)
      .then(response => {
          if (response.status === 200) {
            response.json()
              .then(json => {

                //do smth

                callback(null, json);
                return
              }).catch(error => {
              callback(error, null)
            });
          } else {
            callback((`Request failed. Returned status of ${response.status}`), null);
          }
        }
      ).catch(error => callback(error, null));
  }

  /**
   * Post reviews
   */
  static postReviews(review) {
    return fetch('http://localhost:1337/reviews/',{method:'post',body:review})
     .then(function (response) {
       if(response.ok) {
       return response.json();
       } else {
         return [{}];
       }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
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
   * Make a restaurant favorite
   */

  static restaurantFavouriteHandler(restaurant_id, favVal,callback) {

    var myInit = { method: 'PUT',
      headers: new Headers(),
      mode: 'cors',
      cache: 'default' };

    fetch('http://localhost:1337/restaurants/'+restaurant_id+'/?is_favorite='+favVal, myInit)
      .then(response => {
          if (response.status === 200) {
            callback(null, 1);
          } else {
            callback((`Request failed. Returned status of ${response.status}`), null);
          }
        }
      ).catch(error => callback(error, null));
  }
}

 /**
  * @description Service Worker registration
  */
  if ('serviceWorker' in navigator){
    navigator.serviceWorker
    .register('sw.min.js')
    .then(function(registration){
      if ('sync' in registration) {

        if (window.location.pathname === '/restaurant.html') {

          var form = document.querySelector('#review-form');
          var name = form.querySelector('#name');
          var rating = form.querySelector('#rating');
          var comment = form.querySelector('#comment');
          var restaurantId = getParameterByName('id');

          form.addEventListener('submit', (e) => {
            e.preventDefault();

            var review = {
              restaurant_id: restaurantId,
              name: name.value,
              rating: rating.options[rating.selectedIndex].value,
              comments: comment.value
            };


            idb.open('review', 1, function (upgradeDb) {
              upgradeDb.createObjectStore('outbox', {autoIncrement: true, keyPath: 'id'});
            }).then(function (db) {
              var transaction = db.transaction('outbox', 'readwrite');
              return transaction.objectStore('outbox').put(review);
            }).then(function () {
              name.value = '';
              comment.value = '';
              rating.selectedIndex = 0;
              // register for sync and clean up the form
              return reg.sync.register('outbox').then(() => {
                console.log('Sync registered');
              });
            });

          });
        }
      }
      createIDB();
    })
    .catch(function(err){
        console.log('ServiceWorker failed to Register', err);
        form.submit();
    })
  }

  function createIDB() {

  // check if IDB is available in the widow
  if (!('indexedDB' in window)) {
    console.log('This browser does not support IndexedDB');
    return;
  }

  const dbPromise = idb.open('restaurant-reviews', 1, function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    }
  });

  let itemsToStore;
  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error) {
      console.error('💩 we got an error', error);
    } else {
      itemsToStore = restaurants;
    }
  });

  dbPromise.then(function (db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var store = tx.objectStore('restaurants');
    itemsToStore.forEach(item => {
      store.put(item);
    });
    return tx.complete;
  }).then(function () {
    console.log('Store Updated');
  });
  }


