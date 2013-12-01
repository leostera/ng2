/*
 * Module dependencies.
 */

var join = require('path').join;
var fs = require('fs');
var exists = fs.existsSync;
var mkdir = fs.mkdirSync;
var write = fs.writeFileSync;
var utils = require('./utils');
var log = utils.log;
var info = utils.info;
var error = utils.error;
var read = utils.readFileToObject;
var dump = utils.dumpObjectToFile;
var root = process.cwd();
var unique = require('lodash').unique;

/*
 * Expose module.
 */

module.exports = mod = {};

/*
 * creates a module in the current working dir
 * 
 * @param String  the module name
 */

mod.create = function (name) {
  if(!isValidName(name)) {
    error('make sure your name matches the pattern:\n\t',
      '* owner/module\n\t* owner-module\n\n',
      'you can use underscores too in owner or module names');
  }

  var repo = name;
  name = normalizeName(name);

  var moduleDir = join(root, 'modules', name);

  if(exists(moduleDir)) {
    info('there\'s a module with that name already');
    error(moduleDir,'exists');
  }

  mkdir(moduleDir);
  info('created module folder at', moduleDir);

  var component = {};
  component.version = '0.0.0';
  component.name = name;
  component.repo = repo;
  component.license = 'MIT';
  component.dependencies = {};
  component.description = 'Your-description';
  component.keywords = [];
  component.main = 'index.js';
  component.scripts = ['index.js'];
  component.styles = [];
  component.images = [];
  component.files  = [];

  dump(join(moduleDir,'component.json'), component);
  info('created component.json at', moduleDir);

  var moduleIndexPath = join(moduleDir,'index.js');
  var moduleIndex = ''
    +'// auto-exports //\n\n'
    +'var app = angular.module(\''+name+'\', '
    +'[\'ngRoute\']);'

  write(moduleIndexPath, moduleIndex);
  info('created index.js at', moduleDir);

  // Now let's update the locals at the top-most component.json
  var rootComponent = read(join(root, 'component.json'));
  rootComponent.local = unique(rootComponent.local.concat([name]));
  
  dump(join(root, 'component.json'), rootComponent);

  log('Module scaffolded at', moduleDir);
};

/*
 * Normalizes a name
 *
 * @return String   the normalized name
 */

var normalizeName = mod.normalizeName = function (name) {
  name = name.replace(/[ \/-]/ig,'/').split('/').splice(1);
  name = name.join('-');
  return name;
}

/*
 * Checks if the name is or not valid
 *
 * @return Boolean
 */

var isValidName = mod.isValidName = function (name) {
  return /^(\w+)[-\/]{1}(\w+)$/ig.test(name);
}