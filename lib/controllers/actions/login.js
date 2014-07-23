'use strict';

/**
 * Login action
 */
module.exports = function(req, res){
  var request =  this.google.authenticationRequest();
  req.session.csrf = request.csrf;
  res.redirect(request.url);
};