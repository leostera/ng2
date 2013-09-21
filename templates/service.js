/**
 * @ngdoc service
 * @name ${_s.camelize(module)}.services:${_s.camelize(name)}
 * @description
 * ...
 */
angular
.module('${_s.camelize(module)}')
.factory('${_s.classify(name)}', function () {
  return {

    /**
     * @ngdoc function
     * @name init
     * @methodOf ${_s.camelize(module)}.services:${_s.camelize(name)}
     * @description 
     * ...
     */
    init: function () {
      return;
    },


    /**
     * @ngdoc property
     * @name dataBrowser
     * @propertyOf ${_s.camelize(module)}.services:${_s.camelize(name)}
     * @type {Array}
     * @description 
     * Array of known Browsers.
     */
    dataBrowser: [
      {
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
      }
    ]
  };
});