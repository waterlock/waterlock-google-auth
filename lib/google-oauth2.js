'use strict';

var request = require('request');
var querystring= require('querystring');
var crypto = require('crypto');
var _ = require('lodash');
var GoogleOAuth2Crypto = require('./google-oauth2-crypto');

exports = module.exports = GoogleOAuth2;

/**
 * Google OAuth2 object, make various requests
 * the the graphAPI
 * @param {string} clientId     the google app id
 * @param {string} clientSecret the google app secret
 * @param {string} redirectURL  the url google should use as a callback
 * @param {string} config       the google-specific configuration
 * @param {string} allow        the allow list
 */
function GoogleOAuth2(clientId, clientSecret, redirectURL, config, allow, waterlockConfigGoogle){
  this._clientId = clientId;
  this._clientSecret = clientSecret;
  this._redirectURL = redirectURL;
  this._config = config;
  this._allow = allow;
  this._waterlockConfigGoogle = waterlockConfigGoogle;
}

/**
 * returns the login uri
 * @return {string} login uri
 */
GoogleOAuth2.prototype.authenticationRequest = function(){
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
};

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

GoogleOAuth2.prototype._getMe = function(){
  request.get(this._config.userinfo_endpoint + '?access_token=' +  this.accessToken.access_token, null, this._getMeCallback.bind(this));
};

GoogleOAuth2.prototype._getMeCallback = function(err, response, body){
  if(err){
    return this._tokenCallback(err);
  }
  var result = {
    accessToken: this.accessToken,
    me:  JSON.parse(body)
  };

  if(this.authorize(this.accessToken.id_token.jwt.email)) {
    return this._tokenCallback(null,result);
  }
  else {
    return this._tokenCallback({status: 403, message: 'Insufficient access privileges.'});
  }
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

  body = JSON.parse(body);

  if(body.id_token) {
    body.id_token = this.decryptRawToken(body.id_token);
    this.accessToken = body;

    if (this._waterlockConfigGoogle.fieldMap !== undefined) {
       this._getMe();
    }else {
      if(this.authorize(this.accessToken.id_token.jwt.email)) {
        return this._tokenCallback(null, {
          accessToken: this.accessToken
        });
      }
      else {
        return this._tokenCallback({status: 403, message: 'Insufficient access privileges.'});
      }
    }

  }
  else {
    return this._tokenCallback(body);
  }
};

GoogleOAuth2.prototype.authorize = function(email) {

  // will need to warn the user that the default here is
  // to allow all
  if(!this._waterlockConfigGoogle.allow || this._waterlockConfigGoogle.allow === 0) {
    return true;      // allow all
  }

  var foundMatch = false;
  _.forEach(this._waterlockConfigGoogle.allow, function(allow) {
    var index = allow.indexOf('@');
    if(index <= 0 && _.endsWith(email, allow)) {
      foundMatch = true;    // match on domain or subdomain
    }
    else if(email.toLowerCase() === allow.toLowerCase()) {
      foundMatch = true;    // match on email
    }
  });

  return foundMatch;
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

  var token = {
    alg: JSON.parse(this.base64Decode(parts[0])),
    jwt: JSON.parse(this.base64Decode(parts[1])),
    signature: this.unescape(parts[2])
  };

  var key = this.getKey(token.alg.kid);
  var cert = this.buildPublicKey(key);
  var _data =  [parts[0], parts[1]].join('.');

  if(this.verify(_data, token, cert)){
    return token;
  }
};

GoogleOAuth2.prototype.base64Decode = function(base){
  return new Buffer(base, 'base64').toString('ascii');
};

GoogleOAuth2.prototype.unescape = function(str) {
  str += new Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
};

GoogleOAuth2.prototype.verify = function(_data, token, cert){
  var verifier;
  if(token.alg.alg === 'RS256'){
    verifier = crypto.createVerify('RSA-SHA256');
  }

  verifier.update(_data);
  return verifier.verify(cert, token.signature, 'base64');
};

GoogleOAuth2.prototype.getKey = function(kid){
  var keys = this._config.certs.keys;
  for(var i = 0; i < keys.length; i++) {
    if(keys[i].kid === kid) {
      return keys[i];
    }
  }
  return {};
};

GoogleOAuth2.prototype.buildPublicKey = function(key) {
  if(key && key.use && key.use === 'sig') {
    var googleCrypto = new GoogleOAuth2Crypto(key.n, key.e);
    return googleCrypto.toPemEncodedPublicKey();
  }
};
