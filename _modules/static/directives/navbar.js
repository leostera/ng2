/**
 * @ngdoc directive
 * @name static.directives:navbar
 * @description
 * ...
 */
angular.module('static')
  .directive('navbar', function () {
    'use strict';
    
    return {
      priority: 0,
      template: require('../views/navbar'),
      restrict: 'E',
      link: function(scope, element, attr) {
        scope.message = "Navigation Bar!";
      }
    };  
  }
);