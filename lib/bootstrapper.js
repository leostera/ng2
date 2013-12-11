/*
 * Module dependencies
 */

var eol = require('os').EOL;
var join = require('path').join;
var pathSeparator = require('path').sep;
var fs = require('fs');
var exists = fs.existsSync;
var readdir = fs.readdirSync;
var mkdir = require('mkdirp').sync;
var write = fs.writeFileSync;
var utils = require('../lib/utils');
var dump = utils.dumpObjectToFile;
var compile = utils.compileTemplate;
var info = utils.info;
var log = utils.log;
var error = utils.error;
var root = process.cwd();

/*
 * Expose the module.
 */

module.exports = mod = {};

mod.start = function (folder) {
  info('starting app...');
  if(!exists(join(folder, 'modules'))) {
    mkdir(join(folder, 'modules'));
    info('created modules folder at', join(folder, 'modules'));
  }

  var name = folder.split('/').pop();

  write(join(folder,'.gitignore'), 'components'+eol+'node_modules');
  info('crafted git ignore at', join(folder, '.gitignore'));

  var component = {
    dependencies: {
      "componentizr/angular": "*",
      "componentizr/angular-route": "*"
    },
    remotes: [],
    local: [],
    paths: ["./components", "./modules"]
  };

  dump(join(folder,'component.json'), component);
  info('crafted component.json at', join(folder, 'component.json'));

  var templatePath = join(__dirname, 'templates', 'index.html');
  var object = {
    app: name
  };
  write(join(folder, 'index.html'), compile(templatePath, object));
  info( 'crafted index.html at ', join(folder, 'index.html'));

  var readme = ['# '+name,
    '> ng2 zero app',
    '',
    '## Install',
    'Do `component install` to get all the components you need.',
    '## Now what?',
    'For help with ng2 run `ng2 help`',
    '## Building',
    'Just do `ng2 build`',
    '## But I want a server!',
    'Just do `ng2 server` then',
    '### This readme is a WIP!'].join(eol);

  write(join(folder, 'README.md'), readme)
  info('crafted readme file at', join(folder, 'readme.md'));

  log('scaffolded application at ', folder);
  if( root.split(pathSeparator).pop() !== name) {
    log('cd into', name);
  }
  log('run `component install` to set everything up');
  log();
  log('after that you can start creating modules with');
  log('  $ ng2 module <module-name>');
  log();
}