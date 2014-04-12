angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Dudes', function($http) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var dudes = [];

  $http.get('/api/dudes').then(function(res) {
    dudes = res.data.dudes;
  });

  return {
    all: function() {
      return dudes;
    },
    get: function(friendId) {
      // Simple index lookup
      return dudes[friendId];
    },

  }
});
