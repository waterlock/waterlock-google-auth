# Waterlock Google Auth

[![Build Status](http://img.shields.io/travis/davidrivera/waterlock-google-auth.svg?style=flat)](https://travis-ci.org/davidrivera/waterlock-google-auth) [![NPM version](http://img.shields.io/npm/v/waterlock-google-auth.svg?style=flat)](http://badge.fury.io/js/waterlock-google-auth) [![Dependency Status](http://img.shields.io/gemnasium/davidrivera/waterlock-google-auth.svg?style=flat)](https://gemnasium.com/davidrivera/waterlock-google-auth)

waterlock-google-auth is a module for [waterlock](https://github.com/davidrivera/waterlock)
providing a google authentication method for users.

## Usage

```bash
npm install waterlock-google-auth
```

set the following option in your `waterlock.json` config file

```js
"authMethod":[
   {
      name: 'waterlock-google-auth',
      clientId: 'CLIENT_ID', 
      clientSecret: 'CLIENT_SECRET'
    }
]
```

Direct your user to `/auth/login` to initiate the oauth request. The callback uri is `/auth/google_oauth2` if successfuly authenticated a user record will be created if a user is not found one will be created using the [waterlines](https://github.com/balderdashy/waterline) `findOrCreate` method
