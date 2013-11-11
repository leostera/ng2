/*
 * Module dependencies.
 */
var unique = require('lodash').unique;
var dasherize = require('underscore.string').dasherize;
var join = require('path').join;
var fs = require('fs');
var mkdir = fs.mkdirSync;
var exists = fs.existsSync;
var write = fs.writeFileSync;
var readdir = fs.readdirSync;
var utils = require('./utils');
var dump = utils.dumpObjectToFile;
var read = utils.readFileToObject;
var compile = utils.compileTemplate;
var root = process.cwd;

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
  if(template!=='script') {
    typeDir = join(typeDir, template+'s');
    if(!exists(typeDir)) {
      mkdir(typeDir);
      info('created folder ', template.bold, 'at', typeDir);
    }
  }

  var ext = 'js';
  if(template === 'view') {
    ext = 'html';
  } else if (template === 'style') {
    ext = 'css';
  }


  name = name.replace(new RegExp(ext,'ig'),'');

  var filePath = join(typeDir, dasherize(name));
  filePath += ext;

  var templatePath = join(__dirname,'templates',template);
  templatePath += '.'+ext;

  var object = {
    module: module,
    name: name
  };

  write(filePath, compile(templatePath,object));
  info('created file ', dasherize(name), 'at ', filePath);

  var component = read(join(root,'component.json'));

  var files = readdir(typeDir)
  if(template === 'style') {
    var css = files.map(mapStyle);
    component["styles"] = unique(component["styles"].concat(css));  
  } else if(template === 'script') {
    var js = files.map(mapScript);
    component["scripts"] = unique(component["scripts"].concat(js));  
  } else {
    var js = files.map(mapView);
    component["scripts"] = unique(component["scripts"].concat(js));  
  }

  dump(join(root,'component.json'),component);
  info('updated component.json');

  log('scaffolded', name, template);
}


function mapStyle (name) {
  file = file.replace(/.less$/ig, '.css');
  return join(template+'s', file);
}

function mapView () {
  file = file.replace(/.html$/ig, '.js');
  return join( template+'s', file );
}

function mapScript () {
  return join(file);
}