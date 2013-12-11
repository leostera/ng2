/**
 * @ngdoc filter
 * @name ${_s.camelize(module)}.filters:${_s.camelize(name)}
 * @description
 * 
 * Filters a collection with a simple regex.
 */
angular.module('${_s.camelize(module)}')
  .filter('${_s.camelize(name)}', function () {
    return function(str, letter, prop){
        letter = letter || undefined;
        if(!letter){
          return str;
        }
        var filtered = [];
        str.forEach(function (i) {
          if((new RegExp('^['+letter.toLowerCase()+letter.toUpperCase()+']')).test(i[prop])) {
            filtered.push(i);
          }
        });
        return filtered;
      };
  });