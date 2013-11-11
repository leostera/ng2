var fs    = require('fs')
  , path  = require('path')
  , _     = require('lodash')
  , _s    = require('underscore.string')
  , utils = require('./utils')
  , chokidar = require('chokidar')
  , connect = require('connect');

var resolveToRoot = function (folder) {
  if(fs.existsSync(path.join(folder, 'modules'))
    && fs.existsSync(path.join(folder, 'components'))
    && fs.existsSync(path.join(folder, 'component.json'))) {
    return folder;
  }
  return resolveToRoot(path.join(folder, '..'));
}

module.exports = {
  reporter: false,
  building: false,

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
      throw 'ng2 needs a reporter';
    }

    this.reporter.broadcast('info',"bootstrapping");

    if(this.config.root) {
      this.reporter.broadcast('error', 'ng2 has already been bootstrapped');
      this.reporter.broadcast('error', 'nirvana is near');
      return;
    }

    // where we're calling this from
    this.config.root = process.cwd();
    this.reporter.broadcast('info', 'ng2 summoned at '+this.config.root);

    // figure out if we're inside a module
    var component = path.join(this.config.root,'component.json');
    var modulesDir = path.join(this.config.root, 'modules');
    if(fs.existsSync(component) && !fs.existsSync(modulesDir)) {
      this.config.module = utils.readFileToObject(component);
      this.reporter.broadcast('info', 'we are in a module named "'+this.config.module.name.bold+'"');
    } else if (fs.existsSync(component) && fs.existsSync(modulesDir)) {
      this.reporter.broadcast('info', 'we should be at the app root');
    } else if(!fs.existsSync(component) && /modules$/.test(this.config.root)) {
      this.reporter.broadcast('info', 'we are at the modules folder');
    } else if(!fs.existsSync(component)) {
      this.reporter.broadcast('error', 'There really should be a component.json file for this command to work.');
    }
  },

  /**
   * @name module
   * @description
   * Scaffold a module using ng2-template
   * @param  {Object} opts some options you can pass
   */
  module: function (name) {
    if(this.config.module) {
      this.reporter.broadcast('info', 'creating a module from inside a module');
      this.config.root = resolveToRoot(this.config.root);
    }

    if(/modules$/.test(this.config.root)) {
      this.reporter.broadcast('info', 'creating a module from the modules folder');
      this.config.root = resolveToRoot(this.config.root);
    }

    if(!/^(\w+)[-\/]{1}(\w+)$/ig.test(name)) {
      this.reporter.broadcast('error', 'make sure your name matches the pattern:\n\t* owner/module\n\t* owner-module\n\nyou can use underscores too in owner or module names');
    }

    var repo = name;
    name = name.replace(/[ \/-]/ig,'/').split('/').splice(1);
    name = name.join('-');

    var moduleDir = path.join(this.config.root, 'modules', name);

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

    fs.writeFileSync(path.join(moduleDir,'index.js'),'// auto-exports //\n\nvar app = angular.module(\''+name+'\', [\'ngRoute\']);');
    this.reporter.broadcast('info', 'created index.js at '+moduleDir);

    // Now let's update the locals at the top-most component.json
    component = null;
    component = utils.readFileToObject(path.join(this.config.root, 'component.json'));
    component.local = _.unique(component.local.concat([name]));
    utils.dumpObjectToFile(path.join(this.config.root, 'component.json'), component);

    this.reporter.broadcast('log', 'module scaffolded at '+moduleDir);
    this.reporter.broadcast('log', 'cd into it and use any of the other generators freely');
    this.reporter.broadcast('log', 'check `ng2 --help` for help on the generators');
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

    var typeDir =  this.config.root;
    if(template!=='script') {
      typeDir = path.join(typeDir, template+'s');
      if(!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir);
        this.reporter.broadcast('info', 'created folder '+template.bold+' at '+typeDir);
      }
    }

    var ext = template === 'view'
      ? '.html'
      : template === 'style'
        ? '.less'
        : '.js';


    name = name.replace(new RegExp(ext,'ig'),'');

    var filePath = path.join(typeDir, _s.dasherize(name));
    filePath += ext;

    var templatePath = path.join(__dirname,'templates',template);
    templatePath += ext;

    var object = {
      module: this.config.module.name,
      name: name
    };

    fs.writeFileSync(filePath, utils.compileTemplate(templatePath,object));
    this.reporter.broadcast('info', 'created file '+_s.dasherize(name)+' at '+filePath);

    var component = utils.readFileToObject(path.join(this.config.root,'component.json'));
    component[template === 'style' ? "styles" : "scripts"] = _.unique(
      component[template === 'style' ? "styles" : "scripts"].concat(
        fs.readdirSync(typeDir).map(function (file) {
          if(template === 'view') {
            file = file.replace(/.html$/ig, '.js');
          } else if (template === 'style') {
            file = file.replace(/.less$/ig, '.css');
          } else if (template === 'script') {
            return path.join(file);
          }
          return path.join( template+'s', file );
        })
      )
    );
    utils.dumpObjectToFile(path.join(this.config.root,'component.json'),component);
    this.reporter.broadcast('info', 'updated component.json');

    this.reporter.broadcast('log', 'scaffolded '+name+' '+template);
  }

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
    this.reporter.broadcast('log', 'starting app...');
    if(!fs.existsSync(path.join(folder, 'modules'))) {
      fs.mkdirSync(path.join(folder,'modules'));
      this.reporter.broadcast('info','created modules folder at '+folder+'/modules');

      var sh = require('execSync');
      this.reporter.broadcast('log', 'installing ng2 core module...');
      this.reporter.broadcast('info','cloning ng2/core module into '+folder+'/modules/ng2-core');
      sh.run('git clone --depth 1 https://github.com/ng2/core.git '+folder+'/modules/ng2-core');
    } else {
      this.reporter.broadcast('info','using modules folder at '+folder+'/modules');
    }

    fs.writeFileSync(path.join(folder,'.gitignore'), 'components\nnode_modules');
    this.reporter.broadcast('info','crafted git ignore at '+folder+'/.gitignore');

    var component = {
      dependencies: {
        "componentizr/angular": "*",
        "componentizr/angular-route": "*"
      },
      remotes: [],
      local: ["ng2-core"],
      paths: ["./components", "./modules"]
    };

    utils.dumpObjectToFile(path.join(folder,'component.json'), component);
    this.reporter.broadcast('info','crafted component.json at '+folder+'/component.json');

    var templatePath = path.join(__dirname,'templates','index.html');
    var object = {
      app: name
    };
    fs.writeFileSync(path.join(folder,'index.html'), utils.compileTemplate(templatePath,object));
    this.reporter.broadcast('info', 'crafted index.html at '+folder+'/index.html');

    var readme = ['# '+name+'\n',
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
      '### This readme is a WIP!'].join(' \n');

    fs.writeFileSync(path.join(folder,'README.md'), readme)
    this.reporter.broadcast('info','crafted readme file at '+folder+'/readme.md');

    this.reporter.broadcast('log','scaffolded application at '+folder);
    this.reporter.broadcast('log','cd into '+name);
    this.reporter.broadcast('log','run `component install` to set everything up');
  }
}
