# Waterlock Google Auth

[![Build Status](http://img.shields.io/travis/waterlock/waterlock-google-auth.svg?style=flat)](https://travis-ci.org/waterlock/waterlock-google-auth) [![NPM version](http://img.shields.io/npm/v/waterlock-google-auth.svg?style=flat)](http://badge.fury.io/js/waterlock-google-auth) [![Dependency Status](http://img.shields.io/gemnasium/davidrivera/waterlock-google-auth.svg?style=flat)](https://gemnasium.com/davidrivera/waterlock-google-auth)

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

### Grabbing Google field values

By default, waterlock-google-auth stores the user's `googleEmail` in the Auth model. By providing waterlock with some field maps you can hydrate the user object with extended information. The cost of this is a second call to [google's /me api](https://developers.google.com/+/web/api/rest/openidconnect/getOpenIdConnect)
To grab and store this, you will need to modify the attribute fields in your `Auth.js` model...

```js
// api/models/Auth.js
module.exports = {
	attributes: require('waterlock').models.auth.attributes({
		firstName: 'string',
		lastName: 'string',
		gender: 'string',
		timezone: 'number'
	})
}
```

...and then add a `fieldMap` object within the google authMethod in your `waterlock.js` config file which matches your model's fields to google's fields.

```js
authMethod: [
	{
		name: 'waterlock-google-auth',
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      allow: ['DOMAIN', 'USER@DOMAIN'],
      redirectUri: 'redirectUri'
		fieldMap: {
			// <model-field>: <google-field>,
			'firstName': 'given_name',
			'lastName': 'family_name',
			'gender': 'gender'
		}
	}
]
```
