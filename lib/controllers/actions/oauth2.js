'use strict';

/**
 * Oauth action
 */
module.exports = function (req, res){
  var params = req.params.all();
  if(params.state != req.session.csrf){
    return res.forbidden('Invalid state parameter.');
  }

  this.google.tokenExchange(params.code, accessTokenResponse);

  /**
   * [accessTokenResponse description]
   * @param  {[type]} error                  [description]
   * @param  {[type]} accessToken       [description]
   */
  function accessTokenResponse(error, accessToken){
    if (error && typeof accessToken !== 'undefined') {
      return res.serverError(error);
    } 
    
    var attr = {
        googleEmail: accessToken.id_token.email
    };

    if(req.session.authenticated){
      attr['user'] = req.session.user.id;
      waterlock.engine.attachAuthToUser(attr, req,session.user, userFound);
    }else{
      waterlock.engine.findOrCreateAuth({googleEmail: attr.googleEmail}, attr, userFound);
    }
  }

  /**
   * [userFoundOrCreated description]
   * @param  {[type]} err  [description]
   * @param  {[type]} user [description]
   * @return {[type]}      [description]
   */
  function userFound(err, user){
    if(err){
      waterlock.logger.debug(err);
      return waterlock.cycle.loginFailure(req, res, null, {error: 'trouble creating model'});
    }

    waterlock.cycle.loginSuccess(req, res, user);
  }
};