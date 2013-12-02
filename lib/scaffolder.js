/*
 * Module dependencies.
 */

require('tail-array');
var unique = require('lodash').unique;
var dasherize = require('underscore.string').dasherize;
var join = require('path').join;
var eol = require('os').EOL;
var fs = require('fs');
var mkdir = require('mkdirp').sync;
var exists = fs.existsSync;
var write = fs.writeFileSync;
var append = fs.appendFileSync;
var readdir = fs.readdirSync;
var utils = require('./utils');
var log = utils.log;
var info = utils.info;
var error = utils.error;
var isdir = utils.isdir;
var dump = utils.dumpObjectToFile;
var read = utils.readFileToObject;
var compile = utils.compileTemplate;
var root = process.cwd();

/*
 * Expose the module.
 */

module.exports = scaffolder = {};

/*
 * Create a resource.
 *
 * @param  {String} template the resource template
 * @param  {String} name     the resource name
 */

scaffolder.scaffold = function (module, template, name) {
  var typeDir = root;
  if (/^test\./.test(template)) {
    typeDir = join(typeDir, 'test', template.split('.')[1])
  } else if(template !== 'script') {
    typeDir = join(typeDir, template+'s');
  }

  if(template !== 'script' && !exists(typeDir)) {
    mkdir(typeDir);
    info('created folder ', template.bold, 'at', typeDir);
  }

  var ext = 'js';
  if(template === 'view') {
    ext = 'html';
  } else if (template === 'style') {
    ext = 'css';
  }

  name = name.replace(new RegExp(ext,'ig'),'');

  var filePath = join(typeDir, dasherize(name));
  filePath += '.'+ext;

  var templatePath = join(__dirname,'templates',template);
  templatePath += '.'+ext;

  var object = {
    module: module,
    name: name
  };

  write(filePath, compile(templatePath,object));
  info('created file ', dasherize(name), 'at ', filePath);

  var component = read(join(root,'component.json'));

  var files = readdir(typeDir);
  files = files.filter(function (file) {
    var path = join(typeDir,file);
    var shortPath = path.split('/').tail(3).join('/');
    info('Filtering', shortPath);
    var result = !isdir(path) 
      && /.js$/.test(file)
      && !/test\/(unit|e2e)\/.*\.js$/.test(path);
    !result && info('Filtered file', shortPath);
    return result;
  });

  info("About to map files", files);

  if(template === 'style') {
    var css = files.map(mapStyle(template));
    component["styles"] = unique(component["styles"].concat(css));  
  } else if(template === 'script') {
    var js = files.map(mapScript);
    component["scripts"] = unique(component["scripts"].concat(js));  
  } else {
    var js = files.map(mapView(template));
    component["scripts"] = unique(component["scripts"].concat(js));  
  }

  dump(join(root,'component.json'),component);
  info('updated component.json');

  var filename = filePath.split('/').tail(2).join('/');
  if(!/^views/.test(filename) && !/(unit|e2e)\//.test(filePath)) {
    if( (new RegExp(module)).test(filename) ) {
      filename = filename.split('/').tail(1).join('/');
    }
    append(join(root, 'index.js'), eol+'require(\'./'+filename+'\');');
  }

  log('scaffolded', name, template);
}


/*
 * Helper mapping functions
 */

function mapStyle (template) {
  return function (file) {
    file = file.replace(/.less$/ig, '.css');
    return join(template+'s', file);
  }
}

function mapView (template) {
  return function (file) {
    file = file.replace(/.html$/ig, '.js');
    return join(template+'s', file);
  }
}

function mapScript (file) {
  return join(file);
}