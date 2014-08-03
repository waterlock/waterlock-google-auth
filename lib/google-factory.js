'use strict';

var GoogleOAuth2 = require('./google-oauth2');

module.exports = function(){
  return new GoogleOAuth2(this.config.clientId, 
  this.config.clientSecret, this.waterlockConfig.baseUrl+'/auth/google_oauth2',
  this.googleConfig);
};