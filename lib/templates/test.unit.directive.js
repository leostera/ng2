'use strict';

/* jasmine specs for directive ${_s.camelize(name)} go here */

describe('directives', function () {
  beforeEach(module('${_s.camelize(module)}'));

  describe('${_s.camelize(name)}', function () {
    it('should print current version', function () {
      module(function ($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function ($compile, $rootScope) {
        var element = $compile('<span ${_s.camelize(name)}></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
});