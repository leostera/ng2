var fs    = require('fs')
  , path  = require('path')
  , q     = require('q')
  , async = require('async')
  , colors = require('colors')
  , _  = require('lodash')
  , _s = require('underscore.string');

var root = process.cwd();
var appName = root.split('/').pop();
var appPath = path.join(root,'app');

var resources = [
    { 
      name:'module'
    , deps: []
    , shortcut: 'm'}
  , { 
      name:'controller'
    , deps: ['view']
    , shortcut: 'c'}
  , { 
      name:'directive'
    , shortcut: 'd'}
  , { 
      name:'filter'
    , deps: []
    , shortcut: 'f'}
  , { 
      name:'provider'
    , deps: []
    , shortcut: 'p'}
  , { 
      name:'service'
    , deps: []
    , shortcut: 's'}
  , { 
      name:'view'
    , deps: []
    , shortcut: 'v'}
];

var addExt = function (template, name) {
  var r = name?name:template;
  if(template==='view') {
    r = r+'.html';
  } else {
    r = r+'.js';
  }
  return r;
}

var parseTemplate = function (template, obj) {
  var deferred = q.defer();

  var filePath = path.join(root,'templates');
  
  filePath = path.join(filePath, template);
  fs.exists(filePath, function (fd) {
    if(fd) {
      fs.readFile(filePath, function (err, data) {
        if(err) throw err;
        obj._s = _s;
        obj._ = _;
        obj.app = appName;
        var res = _.template(data.toString())(obj);
        deferred.resolve(res);
      });
    } else {
      throw 'Template not found!';
      deferred.reject(fd);
    }
  });

  return deferred.promise;
};

var createFile = function (template, obj, dest) {
  var deferred = q.defer();

  parseTemplate(addExt(template), obj)
    .then(function (html) {
      var p = addExt(template, dest);
      console.log('\t',p.split('/').splice(-5).join('/'));
      fs.writeFile(p, html, function (err) {
        if(err) throw err;
        deferred.resolve(null);
      });
    }, function (err) {
      throw err;
    });

  return deferred.promise;
};

module.exports = {
  resources: resources,
  generate: function (data) {
    var deferred = q.defer();

    if (!data.length) {
      throw 'Dude! I need some data!'.red.bold;
    }

    var foos = [];

    var size;
    if(!data[0].deps) {
      console.log('Generating '.cyan+data[0].template.cyan+'s'.cyan);
      size = String(data.length);
    }


    data.forEach(function (d) {
      if (d.name === 'module') {
        throw 'to generate a module use neocortex.module(name)';
      }
      d.name = _s.dasherize(d.name);
      var depsList = _.where(this.resources, {name: d.template});
      var filePath = appPath+'/'+d.module+'/'+d.template+'s/'+d.name;
      foos.push(function (done) {
        createFile(d.template, d, filePath)
          .then(function (weGood) {
            var deps;
            if(depsList.length && depsList[0].deps && depsList[0].deps.length) {
              deps = depsList.map(function (depType) {
                if(!depType.deps.length) return;
                return depType.deps.map(function (depName) {
                  return {template: depName, name: d.name, module: d.module, deps: d.template};
                });
              });
            } else {
              return done(weGood);
            }
            return this.generate(deps[0]).then(function (res) {
              done(res);
            }, function (err) {
              done(err);
            });
          }.bind(this), function (err) {
            done(err);
          });
      }.bind(this));
    }.bind(this));

    async.parallel(foos, function (err) {
      if(err) throw err;
      if(!data[0].deps) {
        console.log('Generated'.cyan,size.cyan,data[0].template.cyan+'s'.cyan,
          (data[0].template === 'controller') ? 'and their views'.cyan : '','✓','\n');
      }
      deferred.resolve(null);
    });

    return deferred.promise;
  }

  , exists: function (path) {
    var deferred = q.defer();
    fs.exists(path, function (fd) {
      return !fd ? deferred.resolve(null) : deferred.reject(fd);
    });

    return deferred.promise;
  }

  , module: function (name) {
    var deferred = q.defer();

    if(!fs.existsSync(appPath)) fs.mkdirSync(appPath);

    var modulePath = path.join(appPath,name);

    var scaffoldResources = function (modulePath) {
      var scaffoldDeferred = q.defer();

      async.each(this.resources , function (res, cb) {
        var typePath = path.join(modulePath,res.name+'s');
        if(res.name !== 'module') {
          this.exists(typePath).then(function () {
            console.log('creating folder'.cyan,res.name.cyan+'s'.cyan,'at'.cyan,typePath.split('/').slice(4).join('/'));
            fs.mkdir(typePath, cb);
          }, function (err) {
            console.log('skipping'.yellow,res.name.yellow+'s'.yellow);
            cb(null);
          });
        } else {
          cb(null)
        }
      }.bind(this)
      , function (err) {
          console.log('neocortex'.cyan.bold,'folders are good, starting scaffolding'.bold);
          if(err) throw err;
          scaffoldDeferred.resolve(null);
        }
      );

      return scaffoldDeferred.promise;
    }.bind(this);


    this.exists(modulePath)
      .then(function (result) {
        console.log('ok, no module, building one');
        fs.mkdir(modulePath, function (err) {
          deferred.resolve(scaffoldResources(modulePath));
        }.bind(this));
      }, function (err) {
        console.log('ok, there\'s a module with this name, using it'.yellow);
        deferred.resolve(scaffoldResources(modulePath));
      });

    return deferred.promise;
  }
};
