
'use strict';

/* global wlconfig */
module.exports = function(){
	var config = {};

  if(typeof this.waterlockConfig.authMethod[0] === 'object'){
    for(var i = 0; i < this.waterlockConfig.authMethod.length; i++){
      if(this.waterlockConfig.authMethod[i].name === 'waterlock-google-auth'){
        config = this.waterlockConfig.authMethod[i];
      }
    }
  }else{
    config = wlconfig.authMethod;
  }

  return config;
};