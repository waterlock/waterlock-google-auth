'use strict';

var GoogleOAuth2 = require('./google-oauth2');
//var config = require('./config');

module.exports = function(){

  var redirectUrl = '', prefix = '';

  if (sails.config && sails.config.blueprints && sails.config.blueprints.prefix) {
    prefix = sails.config.blueprints.prefix;
  }

  if (this.config.redirectUri) {
    redirectUrl = this.config.redirectUri;
  }else {
    if (sails.config.waterlock.pluralizeEndpoints) {
      redirectUrl = 'http://dev.festivaltribe.co.uk:4200' + prefix + '/auths/google_oauth2';
    }
    else {
      redirectUrl = 'http://dev.festivaltribe.co.uk:4200' + prefix + '/auth/google_oauth2';
    }
  }

  return new GoogleOAuth2(this.config.clientId,
  this.config.clientSecret, redirectUrl,
  this.googleConfig);
};
