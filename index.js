/*
 * Expose module.
 */

module.exports = main = {};

/*
 * Expose the utils module
 */
 
main.utils = require('./lib/utils');

/*
 * Make sure we have everything we need before we start.
 */

main.bootstrapper = require('./lib/bootstrapper');

/* 
 * Scaffold a resource within a module
 */

main.scaffolder = require('./lib/scaffolder')

/*
 * Scaffold a module
 */

main.module = require('./lib/module');