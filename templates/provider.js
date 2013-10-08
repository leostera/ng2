/**
* @ngdoc service
* @name ${_s.camelize(module)}.providers:${_s.camelize(name)}Provider
* @description
* Provider configuration docs.
*/

/**
* @ngdoc service
* @name ${_s.camelize(module)}.services:${_s.camelize(name)}
* @description
* Service consumption docs.
*/

angular
.module('${_s.camelize(module)}')
.provider('${_s.classify(name)}', function () {
  /**
   * @name providerVariable
   * @type {Object}
   * @propertyOf ${_s.camelize(module)}.providers:${_s.camelize(name)}Provider
   * @description
   * ...
   */
  var providerVariable = { };

  /**
   * @description
   * The actual service.
   */
  return {

    /**
     * Inject services used within your service here
     */
    $get: ['$rootScope', function ($rootScope) {
      
      /**
       * @ngdoc function
       * @name providerVariable.foo
       * @propertyOf ${_s.camelize(module)}.providers:${_s.camelize(name)}Provider
       * @description 
       * This is still not publicly accessible from your service.
       */
      providerVariable.foo = function () {
        return;
      };

      /**
       * @ngdoc function
       * @name serviceFoo
       * @propertyOf ${_s.camelize(module)}.services:${_s.camelize(name)}
       * @description
       * Private service function.
       */
      var serviceFoo = function () {
        return;
      };

      return {
        /**
         * @name publicFoo
         * @ngdoc function
         * @methodOf ${_s.camelize(module)}.services:${_s.camelize(name)}
         * @return {Object} Something
         */
        publicfoo: function () {
          return {some: 'thiing'};
        }
      }
    
    }],

    /**
     * @ngdoc function
     * @methodOf ${_s.camelize(module)}.providers:${_s.camelize(name)}Provider
     * @name setOption
     * @param  {String} usr the user service name
     * @description
     * Public provider configuration function.
     * Use within a angular.config block.
     */
    setOption: function (opt) {
      if(typeof opt !== 'string') {
        throw new Error('${_s.camelize(name)}: setOption expects a string');
      } 
    }
  }
});