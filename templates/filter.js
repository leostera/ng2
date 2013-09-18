/**
 * @ngdoc filter
 * @name ${_s.camelize(app)}.${_s.camelize(module)}:Filters.${_s.camelize(name)}
 * @description
 * 
 * Filters a collection with a simple regex.
 */
angular('${_s.camelize(app)}.${_s.camelize(module)}')
  .filter('${_s.camelize(name)}',['$scope'
  , function ($scope) {
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
    };
  });