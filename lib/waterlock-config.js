'use strict';

var path = require('path');

module.exports = function(){
  var configPath = path.normalize(__dirname+'/../../../config/waterlock.js');
  return require(configPath).waterlock;
};