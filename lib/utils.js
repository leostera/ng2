var fs = require('fs');
var _  = require('lodash');
var _s = require('underscore.string');
var colors = require('colors');

module.exports = {
  readFileToObject: function (source) {
    return JSON.parse(fs.readFileSync(source).toString()) || false;
  },

  dumpObjectToFile: function (dest, object) {
    return fs.writeFileSync(dest, JSON.stringify(object,null,2));
  },

  compileTemplate: function (template, object) {
    object._ = _;
    object._s = _s;
    return _.template(fs.readFileSync(template).toString())(object) || false;
  },

  log: function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('log: '.cyan);
    console.log.call(args);
  },

  info: function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('info: '.gray);
    console.log.call(args);
  },

  error: function () {
    var args = Array.prototype.slice.call(arguments);
    var errors = args.join(' ');
    args = args.map(function (error) {
      return typeof error === 'string' : error.red ? error;
    });
    args.unshift('error: '.red.bold);
    console.log.call(args);
    throw errors;
  }
}