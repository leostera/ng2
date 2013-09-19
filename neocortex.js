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
        name: 'module'
      , deps: ['component', 'index']
      , shortcut: 'm'
      , folder: true
    }
  , { 
        name: 'controller'
      , deps: ['view']
      , shortcut: 'c'
      , folder: true
    }
    , { 
        name: 'directive'
      , shortcut: 'd'
      , folder: true
    }
  , { 
        name: 'filter'
      , shortcut: 'f'
      , folder: true
    }
  , { 
        name: 'provider'
      , shortcut: 'p'
      , folder: true
    }
  , { 
        name: 'service'
      , shortcut: 's'
      , folder: true
    }
  , { 
        name: 'view'
      , shortcut: 'v'
      , folder: true
    }
  , {
        name: 'index'
      , shortcut: false
      , folder: false
    }
  , {
        name: 'component'
      , shortcut: false
      , folder: false
    }
];

var addExt = function (template, name) {
  var r = name?name:template;
  if(template==='view') {
    r = r+'.html';
  } else if (template==='component') {
    r = r+'.json';
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
        obj.files = obj.files || "[]";
        obj.exports = obj.exports || "{}";
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

var updateIndexes = function (files) {
  var deferred = q.defer();

  var module = files[0].module;
  // read component.json
  var componentsFile = path.join(path.join(appPath,module),'component.json');
  fs.readFile(componentsFile, function (err, data) {
    if(err) throw err;
    var components = JSON.parse(data);
    components.scripts = files.map(function (f) {
      return addExt(f.template, f.module+'/'+f.name);
    });
    console.log(components.scripts);
    fs.writeFile(componentsFile, JSON.stringify(components), function (err) {
      if(err) throw err;
      deferred.resolve(null);
    })
  });
 
  return deferred.promise;
}

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
      d.top = d.top || false;
      var depsList = _.where(this.resources, {name: d.template});
      var filePath = appPath+'/'+d.module+'/'+((d.top)?'':d.template+'s/')+d.name;
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

    async.series(foos, function (err) {
      if(err) throw err;
      if(!data[0].deps) {
        console.log('Generated'.cyan,size.cyan,data[0].template.cyan+'s'.cyan,
          (data[0].template === 'controller') ? 'and their views'.cyan : '','✓','\n');
      }

      this.updateIndexes(data).then( function () {
        deferred.resolve(null);
      }, function (err) { 
        deferred.reject(err);
      });
      deferred.resolve(null);
    }.bind(this));

    return deferred.promise;
  }

  , exists: function (path) {
    var deferred = q.defer();
    fs.exists(path, function (fd) {
      return !fd ? deferred.resolve(null) : deferred.reject(fd);
    });

    return deferred.promise;
  }

  , cleanup: function (name) {
    var deferred = q.defer();
    name = path.join(appPath,name);
    fs.readdir(name, function (err, subfolders) {
      if(err) throw err;
      async.each(subfolders, function (sf, cb) {
        if(sf.split('.').length > 1) return;
        sf = path.join(name,sf);
        fs.readdir(sf, function (err, files) {
          if(!files.length) {
            return fs.rmdir(sf, function (err) {
              if(err) throw err;
              cb(null);
            });
          }
          cb(null);
        })
      }, function (err) {
        if(err) throw err;
        console.log('neocortex'.cyan.bold,'clean up complete'.bold);
        deferred.resolve(null);
      })
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
        var typePath = modulePath;
        if(res.name !== 'module' && res.folder) {
          typePath = path.join(typePath, res.name+'s');
          this.exists(typePath).then(function () {
            console.log('creating folder'.cyan,res.name.cyan+'s'.cyan,'at'.cyan,typePath.split('/').slice(4).join('/'));
            fs.mkdir(typePath, cb);
          }, function (err) {
            console.log('skipping'.yellow,res.name.yellow+'s'.yellow);
            cb(null);
          });
        } else if (res.deps) {
          var stuff = res.deps.map(function (d) {
            return {template: d, name: d, module: name, top: true};
          })
          this.generate(stuff).then(cb,cb);
        } else {
          cb(null);
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
