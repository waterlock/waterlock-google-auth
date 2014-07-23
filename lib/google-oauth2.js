'use strict';

var request = require('request');
var querystring= require('querystring');
var crypto = require('crypto');
var _ = require('lodash');

exports = module.exports = GoogleOAuth2;

/**
 * Facebook OAuth2 object, make various requests
 * the the graphAPI
 * @param {string} clientId     the facebook app id
 * @param {string} clientSecret the facebook app secret
 * @param {string} redirectURL  the url facebook should use as a callback
 */
function GoogleOAuth2(clientId, clientSecret, redirectURL, config){
  this._clientId = clientId;
  this._clientSecret = clientSecret;
  this._redirectURL = redirectURL;
  this._config = config;
}

/**
 * returns the login uri
 * @return {string} login uri
 */
GoogleOAuth2.prototype.authenticationRequest = function(params){
  var csrf = this.getAntiForgeryToken();
  var params = {
    client_id: this._clientId,
    response_type: 'code',
    scope:'openid email',
    redirect_uri: this._redirectURL,
    state: csrf
  };

  return {
    url: this._config.authorization_endpoint + '?' + this.toQuery(params), 
    csrf:csrf
  };
};


GoogleOAuth2.prototype.getAntiForgeryToken = function(){
  return crypto.randomBytes(48).toString('hex');
}

/**
 * makes a request to the graph api to confirm the identity of a person trying
 * to login, prevents attackers from spoofing responses. Should be called
 * in the callback from the initial request.
 * @param  {string}   code encrypted string unique to each login request
 * @param  {Function} cb   the user defined callback when request is complete
 */
GoogleOAuth2.prototype.tokenExchange = function(code, cb){
  var params = {
    code: code,
    client_id: this._clientId,
    client_secret: this._clientSecret,
    redirect_uri: this._redirectURL,
    grant_type: 'authorization_code'
  };

  var accessTokenURI = this._config.token_endpoint;

  this._tokenCallback = cb;

  request.post(accessTokenURI, {form: params}, this._tokenExchangeCallback.bind(this));
};

/**
 * callback for the @confirmIdentity function, will trigger callback
 * @param  {object} err 
 * @param  {object} response
 * @param  {string} body
 */
GoogleOAuth2.prototype._tokenExchangeCallback = function(err, response, body){
  if(err){
    return this._tokenCallback(err);
  }

  try{
    var error = JSON.parse(body);
    if(error.error){
      return this._tokenCallback(error);
    }
  }catch(e){
    // we good
  }
  var body = JSON.parse(body);
  body.id_token = this.decryptRawToken(body.id_token);
  this.accessToken = body;
  return this._tokenCallback(null, this.accessToken);
};

/**
 * wrapper for querystring stringify
 * @param  {object} params 
 * @return {string}        query string
 */
GoogleOAuth2.prototype.toQuery = function(params){
  return querystring.stringify(params);
};

/**
 * wrapper for querystring parse
 * @param  {string} str query string
 * @return {object}     object
 */
GoogleOAuth2.prototype.toObject = function(str){
  return querystring.parse(str);
};

GoogleOAuth2.prototype.decryptRawToken = function(rawToken){
  var parts = rawToken.split('.');
  var alg = JSON.parse(this.base64Decode(parts[0]));
  var jwt = JSON.parse(this.base64Decode(parts[1]));
  var signature = this.unescape(parts[2]);

  var key = this.getKey(alg.kid);

  var _data =  [parts[0], parts[1]].join('.');
  //if(this.verify(_data, key, signature)){
    return jwt;
  //}
}

GoogleOAuth2.prototype.base64Decode = function(base){
  return new Buffer(base, 'base64').toString('ascii');
}

GoogleOAuth2.prototype.unescape = function(str) {
  str += Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

GoogleOAuth2.prototype.verify = function(data, key, signature){
  var alg;
  if(key.alg == 'RS256'){
    alg = crypto.createVerify("RSA-SHA256");  
  }
  
  alg.update(data);

  return alg.verify(key.n, providedSignature, 'base64');
}

GoogleOAuth2.prototype.getKey = function(kid){
  for(var i = 0; i < this._config.certs.keys.length; i++){
    if(this._config.certs.keys[i].kid == kid){
      return this._config.certs.keys[i];
    }
  }
}