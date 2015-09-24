# Waterlock Google Auth

[![Build Status](http://img.shields.io/travis/davidrivera/waterlock-google-auth.svg?style=flat)](https://travis-ci.org/davidrivera/waterlock-google-auth) [![NPM version](http://img.shields.io/npm/v/waterlock-google-auth.svg?style=flat)](http://badge.fury.io/js/waterlock-google-auth) [![Dependency Status](http://img.shields.io/gemnasium/davidrivera/waterlock-google-auth.svg?style=flat)](https://gemnasium.com/davidrivera/waterlock-google-auth)

waterlock-google-auth is a module for [waterlock](https://github.com/davidrivera/waterlock)
providing a google authentication method for users.

## Usage

```bash
npm install waterlock-google-auth
```

Set the following option in your `waterlock.json` config file.

 - allow is an optional
filter - if you omit it, all domains will be allowed.

 - redirectUri is also an optional property - use this if you want to override the computed redirectUri. This is useful for when you want to send an auth code to waterlock instead of having waterlock handle the entire auth flow for you. Useful for when you're developing an SPA which handles the authentication with something like Torii (EmberJs). See https://github.com/wayne-o/ember-waterlock-example waterlock will validate the auth code with the provider and retrieve an access token which can be used to setup a session and return the JWT to your app

```js
"authMethod":[
   {
      name: 'waterlock-google-auth',
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      allow: ['DOMAIN', 'USER@DOMAIN'],
      redirectUri: 'redirectUri'
    }
]
```

Direct your user to `/auth/login` to initiate the oauth request. The callback uri is `/auth/google_oauth2` if successfuly authenticated a user record will be created if a user is not found one will be created using the [waterlines](https://github.com/balderdashy/waterline) `findOrCreate` method
