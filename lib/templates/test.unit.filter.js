'use strict';

/* jasmine specs for filter ${_s.camelize(name)} go here */

describe('filter', function () {
  beforeEach(module('${_s.camelize(module)}'));

  describe('${_s.camelize(name)}', function () {
    beforeEach(module(function ($provide) {
      $provide.value('version', 'TEST_VER');
    }));

    it('should replace VERSION', inject(function (${_s.camelize(name)}Filter) {
      expect(${_s.camelize(name)}Filter('before %VERSION% after')).toEqual('before TEST_VER after');
    }));
  });
});