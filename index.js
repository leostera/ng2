#!/usr/bin/env node

var neocortex = require('./neocortex')
  , commander = require('commander')
  , async = require('async')
  , colors = require('colors');

neocortex.root = process.cwd();

var generate = function () {
  console.log('neocortex'.cyan.bold, 'working...'.bold);

  if (!commander.module) {
    console.error('No module has specified!'.red.bold, '\nAssuming \'main\' module'.yellow.bold);
    commander.module = 'main';
  }
  neocortex.module(commander.module)
  .then(function () {
    var stuff = [];
    neocortex.resources.forEach( function (option) {
      var name = option.name;
      if(commander[name]) {
        if(name === 'module') return;
        stuff.push( function (done) {
          // make an array of this things!
          var things = commander[name].split(',').map(function (item) {
            return {
                template: name
              , name: item.trim()
              , module: commander.module
            };
          });
          // generate this things!
          neocortex.generate(things)
          .then(function (res) {
            done(null);
          }, function (err) {
            done(err);
          });
        });
      }
    });

    stuff.push(function (done) {
      neocortex.cleanup(commander.module)
      .then(done, done);
    });

    async.series(stuff, function (err) {
      console.log('neocortex'.cyan.bold, 'is HAPPY'.bold);
      if(err) throw err;
    });
  }, function (err) {
    throw err;
  });
};

commander
  .version('0.0.3')

neocortex.resources.forEach(function (r) {
  commander.option('-'+r.shortcut+' --'+r.name+' [name]', 'Create '+r.name+'s');
});

commander
  .command('generate')
  .description('generate the output')
  .action(generate);

commander
  .command('g')
  .description('generate the output')
  .action(generate);

commander.parse(process.argv);