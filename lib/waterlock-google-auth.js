'use strict';

var _ = require('lodash');

module.exports = exports = WaterlockGoogleAuth;

function WaterlockGoogleAuth(){

  this.authType         = 'google';
  this.actions          = _.bind(this.actions, this)();
  this.model            = _.bind(this.model, this)();
  this.waterlockConfig  = _.bind(this.waterlockConfig, this)();
  this.config           = _.bind(this.config, this)();
  this.googleConfig     = _.bind(this.googleConfig, this)();
}

WaterlockGoogleAuth.prototype.actions = require('./controllers');

WaterlockGoogleAuth.prototype.model = require('./models');

WaterlockGoogleAuth.prototype.config = require('./config');

WaterlockGoogleAuth.prototype.waterlockConfig = require('./waterlock-config');

WaterlockGoogleAuth.prototype.googleFactory = require('./google-factory');

WaterlockGoogleAuth.prototype.googleConfig = require('./google-config');

WaterlockGoogleAuth.prototype.configFound = function(googleConfig){
  this.googleConfig   = googleConfig;
  this.google         = _.bind(this.googleFactory, this)();
};