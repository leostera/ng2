var fs    = require('fs')
  , path  = require('path')
  , _     = require('lodash')
  , _s    = require('underscore.string')
  , utils = require('./utils')
  , chokidar = require('chokidar')
  , connect = require('connect');

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
      moduleDir = path.join(this.config.root, name);
    } else {
      moduleDir = path.join(this.config.root, 'modules', name);
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

    var typeDir = path.join(this.config.root, template+'s');
    if(!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
      this.reporter.broadcast('info', 'created folder '+template.bold+' at '+typeDir);
    }

    var ext = template === 'view'
      ? '.html'
      : template === 'style'
        ? '.less'
        : '.js';

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
    if(this.config.module) {
      this.reporter.broadcast('error', 'trying to build from inside a module? don\'t');
    }

    if(/modules$/.test(this.config.root)) {
      this.reporter.broadcast('error', 'trying to build from the modules folder? don\'t');
    }

    if(this.building) {
      this.reporter.broadcast('info', 'aborting a build while still building');
      return;
    }

    this.building = true;

    if(!fs.existsSync(path.join(this.config.root,'build'))) {
      fs.mkdirSync(path.join(this.config.root,'build'));
    }

    var Builder = require('component-builder')
      , str2js  = require('string-to-js')
      , less    = require('less');

    var convertTemplate = function (builder) {
      // hook into the "before scripts" event
      this.reporter.broadcast('info', 'setting up convert-template before script hook');
      builder.hook('before scripts', function (pkg, fn) {
        // check if we have .scripts in component.json
        var tmpls = pkg.config.scripts;
        if (!tmpls || !tmpls.length) {
          this.reporter.broadcast('info', 'convert-template hook triggered without templates');
          return fn();
        }

        this.reporter.broadcast('info', 'convert-template hook triggered with this build config');
        this.reporter.broadcast('info', pkg.config);

        // translate templates
        tmpls.forEach(function (file){
          // only views
          if (!/views/ig.test(file)) return;

          var start = new Date;

          var ext = path.extname(file);
          var originalFile = file;
          var file = pkg.path(file);

          if(ext === '.js') {
            file = file.replace(/.js$/ig, '.html');
          }

          // read the file
          var str = fs.readFileSync(file, 'utf8');
          var fn = str2js(str);
          newFile = file.replace(/.html$/ig,'.js');

          fs.writeFileSync(newFile, fn);
          pkg.addFile('scripts', originalFile.replace(/.html$/ig,'.js'));
          pkg.removeFile('scripts', file);

          var duration = new Date - start;
          var time = ' – '+duration+'ms';
          this.reporter.broadcast('log', ' - processed '+originalFile+time);
          this.reporter.broadcast('info', "Converted "+file)
          this.reporter.broadcast('info', "to "+newFile+" as:");
          this.reporter.broadcast('info', fn);

        }.bind(this));

        fn();
      }.bind(this));
    }.bind(this);

    var compileLess = function (builder) {
      this.reporter.broadcast('info', 'setting up compile-less before script hook');
      builder.hook('before scripts', function (pkg, fn) {
        // check if we have .styles in component.json
        var styles = pkg.config.styles;
        if (!styles || !styles.length) {
          this.reporter.broadcast('info', 'compile-less hook triggered without styles');
          return fn();
        }

        this.reporter.broadcast('info', 'compile-less hook triggered with this build config');
        this.reporter.broadcast('info', pkg.config);

        // translate templates
        styles.forEach(function (file){
          // only styles
          if (!/styles/ig.test(file)) return;

          var start = new Date;

          var ext = path.extname(file);
          var originalFile = file;
          var file = pkg.path(file);
          if(ext === '.css') {
            file = file.replace(/.css$/ig, '.less');
          }

          // read the file
          var str = fs.readFileSync(file, 'utf8');
          newFile = file.replace(/.less$/ig,'.css');

          less.render(str, function (e, css) {
            if(e) this.reporter.broadcast('error', e);
            fs.writeFileSync(newFile, css);

            var duration = new Date - start;
            var time = ' – '+duration+'ms';
            this.reporter.broadcast('log', ' - processed '+originalFile+time);
            this.reporter.broadcast('info', "Converted "+file)
            this.reporter.broadcast('info', "to "+newFile+" as:");
            this.reporter.broadcast('info', css);
          }.bind(this));

        }.bind(this));

        fn();
      }.bind(this));
    }.bind(this);

    var start = new Date;

    var component = utils.readFileToObject(path.join(this.config.root,'component.json'));

    if(!component) {
      this.reporter.broadcast('error', 'There\'s no component.json at '+this.config.root);
    }

    this.reporter.broadcast('info', 'Reading component.json from '+this.config.root+'/component.json');

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

    builder.use(convertTemplate);
    builder.use(compileLess);

    component.paths.forEach(function (p) {
      builder.addLookup(path.join(this.config.root,p));
    }.bind(this));

    builder.copyAssetsTo(path.join(this.config.root,'build'));
    builder.build( function (err, obj) {
      if (err) this.reporter.broadcast('error', err);
      if (obj.js) fs.writeFileSync(path.join(this.config.root,'build/build.js'), obj.require + obj.js);
      if (obj.css) fs.writeFileSync(path.join(this.config.root,'build/build.css'), obj.css);
    }.bind(this));

    var duration = new Date - start;
    var time = '– '+duration+'ms';
    this.reporter.broadcast('log', 'build completed '+time)
    this.building = false;
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
        "leostera/angular.js": "*"
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
      '### This readme is a WIP!'].join(' \n');

    fs.writeFileSync(path.join(folder,'README.md'), readme)
    this.reporter.broadcast('info','crafted readme file at '+folder+'/readme.md');

    this.reporter.broadcast('log','scaffolded application at '+folder);
    this.reporter.broadcast('log','cd into '+name);
    this.reporter.broadcast('log','run `component install` to set everything up');
  },

  /**
   * @name watch
   * @description
   * Watch for file changes and rebuild the app.
   */
  watch: function () {
    this.reporter.broadcast('log', 'Watching ./modules/**/*');
    this.reporter.broadcast('log', 'Ignoring paths starting with a dot');

    var modulesDir = path.join(this.config.root,'modules');
    var watcher = chokidar.watch(modulesDir, {ignored: /^\./, persistent: true});

    this.reporter.broadcast('info', 'Actually watching '+path.join(this.config.root,'modules'));

    watcher
      .on('error', function(error) {
        this.reporter.broadcast('error', 'Error happened ' + error);
      }.bind(this))

    watcher.on('change', function(path, stats) {
      watcher.close();
      this.reporter.broadcast('log', 'File changed '+path);
      this.build();
      this.reporter.broadcast('log', '');
      watcher.add(modulesDir);
    }.bind(this));
  },

  /**
   * @name server
   * @description
   * Runs a development webserver while watching the files
   */
  server: function (port) {
    this.build();
    this.watch();
    connect()
      .use(connect.logger('dev'))
      .use(function (req, res, next) {
        this.reporter.broadcast('log', req.originalUrl);
        if(/^\/node_modules/.test(req.originalUrl) ||
          /^\/modules/.test(req.originalUrl) ||
          /^\/components/.test(req.originalUrl)) {
          res.writeHead(200);
          fs.createReadStream(path.join(this.config.root,'index.html')).pipe(res);
        } else {
          next();
        }
      }.bind(this))
      .use(connect.static(this.config.root))
      .use(function (req, res, next) {
        res.writeHead(200);
        fs.createReadStream(path.join(this.config.root,'index.html')).pipe(res);
      }.bind(this))
      .listen(port || 9000);
  }
}
