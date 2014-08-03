'use strict';

var request = require('request');
var defaultConfig = require('./google.json');
var GOOGLE_URL = 'https://accounts.google.com/.well-known/openid-configuration';

module.exports = function(){
  var self = this;
  request(GOOGLE_URL, function(err, res, body){
    var config = defaultConfig;
    if(!err){
      config = JSON.parse(body);
    }

    // now grab the certs
    request(config.jwks_uri.replace('v2','v1'), function(err, res, body){
      if(err){
        console.log(err);
      }else{
        config.certs = JSON.parse(body);
        self.configFound(config);
      }
    });
  });

  return defaultConfig;
};