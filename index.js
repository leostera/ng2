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

    this.reporter.broadcast('info',"bootstrapping");

    if(this.config.root) {
      this.reporter.broadcast('error', 'ntropy has already been bootstrapped');
      this.reporter.broadcast('error', 'nirvana is near');
      return;
    }

    // where we're calling this from
    this.config.root = process.cwd();
    this.reporter.broadcast('info', 'ntropy summoned at '+this.config.root);

    // figure out if we're inside a module
    var component = path.join(this.config.root,'component.json');
    var modulesDir = path.join(this.config.root, 'modules');
    if(fs.existsSync(component) && !fs.existsSync(modulesDir)) {
      this.config.module = utils.readFileToObject(component);
      this.reporter.broadcast('info', 'we are in a module named "'+this.config.module.name.bold+'"');
    } else if (fs.existsSync(component) && fs.existsSync(modulesDir)) {
      this.reporter.broadcast('info', 'we should be at the app root');
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

    if(!/^(\w+)[-\/]{1}(\w+)$/ig.test(name)) {
      this.reporter.broadcast('error', 'make sure your name matches the pattern:\n\t* owner/module\n\t* owner-module\n\nyou can use underscores too in owner or module names');
    }

    var repo = name;
    name = name.replace(/[ \/-]/ig,'/').split('/').splice(1);
    name = name.join('-');

    var moduleDir;
    if(/\/modules$/.test(this.config.root)) {
      moduleDir = path.join(this.config.root,name);
    } else {
      moduleDir = path.join(path.join(this.config.root,'modules'),name);
    }

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
    this.reporter.broadcast('log', 'check `ntropy --help` for help on the generators');
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
          if(template === 'view') {
            file = file.split('.');
            file.pop();
            file = file.concat('js').join('.');
          }
          return path.join( template+'s', file );
        })
      )
    );
    utils.dumpObjectToFile(path.join(this.config.root,'component.json'),component);
    this.reporter.broadcast('info', 'updated component.json');

    this.reporter.broadcast('log', 'scaffolded '+name+' '+template);
  },

  /**
   * @name build
   * @description
   * Perform a build of all the local modules and component converting all
   * the local templates from html to js.
   */
  build: function () {
    // this.reporter.broadcast('error', 'this feature is not yet available');
    var Builder = require('component-builder')
      , str2js  = require('string-to-js');

    var convertTemplate = function (builder) {
      // hook into the "before scripts" event
      this.reporter.broadcast('info', 'setting up before scripts hook');
      builder.hook('before scripts', function (pkg, fn) {
        // check if we have .scripts in component.json
        var tmpls = pkg.config.scripts;
        if (!tmpls) return fn();

        this.reporter.broadcast('info', 'hook triggered with this build config');
        this.reporter.broadcast('info', pkg.config);

        // translate templates
        tmpls.forEach(function (file){
          // only .html files
          var ext = path.extname(file);
          if ('.html' != ext) return;

          // read the file
          file = pkg.path(file);
          var str = fs.readFileSync(file, 'utf8');
          var fn = str2js(str);

          newFile = file.replace(/.html/ig,'.js');
          this.reporter.broadcast('info', "Converting "+file+" to "+newFile+" as:");
          this.reporter.broadcast('info', fn);
          fs.writeFileSync(newFile, fn);
          pkg.addFile('scripts', newFile);
          pkg.removeFile('scripts', file);
        }.bind(this));

        fn();
      }.bind(this));
    }.bind(this);

    var start = new Date;

    var component = utils.readFileToObject('/Users/leostera/Repositories/leostera.com/component.json');

    if(!component) {
      this.reporter.broadcast('error', 'There\'s no component.json at '+this.config.root);
    }

    var local = component.local.map(function (l) {
      return this.config.root+'/modules/'+l;
    }.bind(this));

    this.reporter.broadcast('info', "Building local modules");
    this.reporter.broadcast('info', local);

    var dependencies = Object.keys(component.dependencies).map( function (d) {
      return this.config.root+'/components/'+d.replace(/\//ig,'-');
    }.bind(this));

    this.reporter.broadcast('info', "Building dependencies");
    this.reporter.broadcast('info', dependencies);

    dependencies = dependencies.concat(local);

    var builder = new Builder(this.config.root);
    this.reporter.broadcast('log', 'building '+this.config.root.split('/').pop().bold);
    this.reporter.broadcast('info', 'bootstrapped builder at '+this.config.root);

    component.paths.forEach(function (p) {
      builder.addLookup(path.join(this.config.root,p));
    }.bind(this));

    builder.use(convertTemplate);

    builder.copyAssetsTo(path.join(this.config.root,'build'));
    builder.build( function (err, obj) {
      if (err) this.reporter.broadcast('error', err);
      if(fs.exists(path.join(this.config.root,'build'))) {
        fs.rmdirSync(path.join(this.config.root,'build'));
      }
      fs.writeFileSync(path.join(this.config.root,'build/build.js'), obj.require + obj.js);
      if (obj.css) fs.writeFileSync(path.join(this.config.root,'build/build.css'), obj.css);
    }.bind(this));

    var duration = new Date - start;
    var time = '– '+duration+'ms';
    this.reporter.broadcast('log', 'build completed '+time)
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

    var component = {
      dependencies: {
        "leostera/angular.js": "*",
        "n-tropy/core": "*"
      },
      remotes: [],
      locals: [],
      paths: ["./modules"]
    };

    utils.dumpObjectToFile(path.join(folder,'component.json'), component);
    this.reporter.broadcast('info','crafted component.json at '+folder+'/component.json');

    var templatePath = path.join(path.join(__dirname,'templates'),'index.html');
    var object = {
      app: name
    };
    fs.writeFileSync(path.join(folder,'index.html'), utils.compileTemplate(templatePath,object));
    this.reporter.broadcast('info', 'crafted index.html at '+folder+'/index.html');

    var readme = ['# '+name+'\n',
      '> ntropy zero app',
      '',
      '### Install components using `component`',
      '',
      '### This readme is a WIP!'].join(' \n');

    fs.writeFileSync(path.join(folder,'README.md'), readme)
    this.reporter.broadcast('info','crafted readme file at '+folder+'/readme.md');

    this.reporter.broadcast('log','scaffolded application at '+folder);
    this.reporter.broadcast('log','cd into '+name);
    this.reporter.broadcast('log','run `component install` to set everything up');
  }
}