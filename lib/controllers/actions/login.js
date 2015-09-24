'use strict';

/**
 * Login action
 */
module.exports = function(req, res){
  var request =  this.google.authenticationRequest();
  res.redirect(request.url);
};
