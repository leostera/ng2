angular.module('static')
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'home',
      template: require('./views/home')
    })
    .otherwise({
      redirectTo: '/'
    });
}]);