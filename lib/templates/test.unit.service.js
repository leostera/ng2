'use strict';

/* jasmine specs for service ${_s.classify(name)} go here */

describe('service', function () {
  beforeEach(module('${_s.camelize(module)}'));


  describe('${_s.classify(name)}', function () {
    it('should have an init method', inject(function (${_s.classify(name)}) {
      expect(typeof ${_s.classify(name)}.init).toEqual('function');
    }));
  });
});