/**
 * @name static.controllers:home
 */
angular.module('static')
  .controller('home',['$scope'
  , function ($scope) {
    $scope.message = 'Welcome to Home';
  }]);