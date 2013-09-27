var fs = require('fs')
  , _  = require('lodash')
  , _s = require('underscore.string');

module.exports = {
  readFileToObject: function (source) {
    return JSON.parse(fs.readFileSync(source).toString()) || false;
  },

  dumpObjectToFile: function (dest, object) {
    return fs.writeFileSync(dest, JSON.stringify(object,null,2));
  },

  compileTemplate: function (template, object) {
    object._ = _;
    object._s = _s;
    return _.template(fs.readFileSync(template).toString())(object) || false;
  }
}