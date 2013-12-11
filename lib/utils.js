/*
 * Module dependencies.
 */

var fs = require('fs');
var _  = require('lodash');
var _s = require('underscore.string');
var colors = require('colors');
var fs = require('fs');
var stat = fs.statSync;
var read = fs.readFileSync;
var write = fs.writeFileSync;

/*
 * Expose module.
 */ 

module.exports = utils = {};

/*
 * is a given path a dir?
 */
 
utils.isdir = function (path) {
  return stat(path).isDirectory();
}

/*
 * reads a file into a js object
 */

utils.readFileToObject = function (source) {
  return JSON.parse(read(source).toString()) || false;
};

/*
 * writes a js object into a file
 */

utils.dumpObjectToFile = function (dest, object) {
  return write(dest, JSON.stringify(object,null,2));
};

/*
 * compiles a template into a string
 */

utils.compileTemplate = function (template, object) {
  object._ = _;
  object._s = _s;
  return _.template(read(template).toString())(object) || false;
};

/*
 * prefixed log configuration
 */
 
utils.prefix = {
  log: false,
  info: true,
  error: true
};

utils.verbose = false;

/*
 * prefixed log functions
 */

utils.log = function () {
  var args = Array.prototype.slice.call(arguments);
  utils.prefix.log && args.unshift('log:  '.cyan);
  console.log.apply({}, args);
};

utils.info = function () {
  if(!utils.verbose) return;
  var args = Array.prototype.slice.call(arguments,0);
  utils.prefix.info && args.unshift('info: '.magenta);
  console.log.apply({}, args);
};

utils.error = function () {
  var args = Array.prototype.slice.call(arguments);
  var errors = args.join(' ');
  args = args.map(function (error) {
    return typeof error === 'string' ? error.red : error;
  });
  utils.prefix.error && args.unshift('error: '.red.bold);
  console.error.apply({}, args);
};
