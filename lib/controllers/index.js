'use strict';

module.exports = function(){
  var self = this;

  return {
    login: require('./actions/login').bind(self),

    logout: require('./actions/logout'),

    extras: {
      google_oauth2: require('./actions/oauth2').bind(self)
    }
  };
};