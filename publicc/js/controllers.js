angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})

.controller('DudesCtrl', function($scope, Dudes) {
  $scope.dudes = Dudes.all;
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Dudes) {
  $scope.friend = Dudes.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
