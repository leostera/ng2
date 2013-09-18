/**
 * @name ${_s.camelize(app)}.${_s.camelize(module)}:Controllers.${_s.camelize(name)}
 */
angular('${_s.camelize(app)}.${_s.camelize(module)}')
  .controller('${_s.classify(name)}',['$scope'
  , function ($scope) {
    $scope.message = 'Welcome to ${_s.humanize(name)}';
  });