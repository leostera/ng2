/**
 * @name ${_s.camelize(module)}.controllers:${_s.camelize(name)}
 */
angular.module('${_s.camelize(module)}')
  .controller('${_s.camelize(name)}',['$scope'
  , function ($scope) {
    $scope.message = 'Welcome to ${_s.humanize(name)}';
  }]);