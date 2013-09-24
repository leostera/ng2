var fs    = require('fs')
  , path  = require('path')
  , _     = require('lodash')
  , _s    = require('underscore.string')
  , utils = require('./utils');

module.exports = {
  reporter: false,

  config: {
    root: '',
    module: false
  },

  /**
   * @name bootstrap
   * @description
   * Gather information about our current whereabouts
   */
  bootstrap: function () {
    if(!this.reporter) {
      throw 'ntropy needs a reporter';
    }

    if(this.config.root) {
      this.reporter.broadcast('error', 'ntropy has already been bootstrapped');
      this.reporter.broadcast('error', 'nirvana is near');
      return;
    }

    // where we're calling this from
    this.config.root = process.cwd();
    this.reporter.broadcast('info', 'ntropy summoned at '+this.config.root);

    // figure out if we're inside a module
    var module = path.join(this.config.root,'component.json');
    if(fs.existsSync(module)) {
      this.config.module = utils.readFileToObject(module);
      this.reporter.broadcast('info', 'we are in a module named "'+this.config.module.name.bold+'"');
    }
  },

  /**
   * @name module
   * @description
   * Scaffold a module using ntropy-template
   * @param  {Object} opts some options you can pass
   */
  module: function (name) {
    if(this.config.module) {
      this.reporter.broadcast('error', 'trying to create a module inside a module? don\'t');
    }
    var repo = name;
    name = name.replace(/[ \/-]/ig,'/').split('/').splice(1);
    name = name.join('-');
    var moduleDir = path.join(this.config.root,name);
    if(fs.existsSync(moduleDir)) {
      this.reporter.broadcast('info', 'there\'s a module with that name already');
      this.reporter.broadcast('info', 'cd into it and use any of the other generators');
      this.reporter.broadcast('error', moduleDir+' exists');
    }

    fs.mkdirSync(moduleDir);
    this.reporter.broadcast('info', 'created module folder at '+moduleDir);

    var templatesDir = path.join(__dirname,'templates');
    var component = utils.readFileToObject(path.join(templatesDir, 'component.json'));
    component.name = name;
    component.repo = repo;
    component.scripts = ['index.js'];
    component.styles = [];
    utils.dumpObjectToFile(path.join(moduleDir,'component.json'), component);
    this.reporter.broadcast('info', 'created component.json at '+moduleDir);

    fs.writeFileSync(path.join(moduleDir,'index.js'),'// auto-exports //');
    this.reporter.broadcast('info', 'created index.js at '+moduleDir);

  },

  /**
   * @name scaffold
   * @description
   * Create a resource.
   * @param  {String} template the resource template
   * @param  {String} name     the resource name
   */
  scaffold: function (template, name) {
    if(!this.config.module) {
      this.reporter.broadcast('error', 'trying to scaffold outside a module? don\'t');
    }

    var typeDir = path.join(this.config.root, template+'s');
    if(!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
      this.reporter.broadcast('info', 'created folder '+template.bold+' at '+typeDir);
    }

    var filePath = path.join(typeDir, _s.dasherize(name));
    filePath += template === 'view' ? '.html' : '.js';

    var templatePath = path.join(path.join(__dirname,'templates'),template);
    templatePath += template === 'view' ? '.html' : '.js';

    var object = {
      module: this.config.module.name,
      name: name
    };

    fs.writeFileSync(filePath, utils.compileTemplate(templatePath,object));
    this.reporter.broadcast('info', 'created file '+_s.dasherize(name)+' at '+filePath);

    var component = utils.readFileToObject(path.join(this.config.root,'component.json'));
    component.scripts = _.unique(
      component.scripts.concat(
        fs.readdirSync(typeDir).map(function (file) {
          return path.join(template+'s',file);
        })
      )
    );
    utils.dumpObjectToFile(path.join(this.config.root,'component.json'),component);
    this.reporter.broadcast('info', 'updated component.json');

    this.reporter.broadcast('log', 'scaffolded '+name);
  },

  /**
   * @name start
   * @description
   * Scaffold a barebones app.
   */
  start: function (name) {
    var folder;
    if(name === '.' || name === './') {
      name = process.cwd().split('/').pop();
      folder = process.cwd();
      this.reporter.broadcast('info','using current working directory as app name: '+name);
    } else {
      folder = path.join(process.cwd(),name);
      this.reporter.broadcast('info','using current working directory as app root: '+folder);
      if(!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        this.reporter.broadcast('info','created app root at '+folder);
      } else {
        this.reporter.broadcast('error','app root at '+folder+' not empty!');
      }
    }
    if(!fs.existsSync(path.join(folder, 'modules'))) {
      fs.mkdirSync(path.join(folder,'modules'));
      this.reporter.broadcast('info','created modules folder at '+folder+'/modules');
    } else {
      this.reporter.broadcast('info','using modules folder at '+folder+'/modules');
    }

    fs.writeFileSync(path.join(folder,'.gitignore'), 'components\nnode_modules');
    this.reporter.broadcast('info','crafted git ignore at '+folder+'/.gitignore');

    var readme = ['# '+name+'\n',
      '> ntropy scaffolded this app for you, everything\'s stable now',
      '',
      '### Install components using `component`',
      '',
      '### This readme is a WIP!'].join(' \n');

    fs.writeFileSync(path.join(folder,'README.md'), readme)
    this.reporter.broadcast('info','crafted readme file at '+folder+'/readme.md');

    this.reporter.broadcast('log','scaffolded application at '+folder+'\n\n');
    this.reporter.broadcast('log','make sure you have component installed');
    this.reporter.broadcast('log','and then just go component install to get new components');
  }
}