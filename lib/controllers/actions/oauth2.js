'use strict';

/**
 * Oauth action
 */
module.exports = function(req, res) {
	var params = req.params.all();

	this.google.tokenExchange(params.code, accessTokenResponse);

	/**
	 * [accessTokenResponse description]
	 * @param  {[type]} error                  [description]
	 * @param  {[type]} accessToken       [description]
	 */
	function accessTokenResponse(error, accessToken) {
		if (error || typeof accessToken === 'undefined') {
			if (error.status) {
				return res.status(error.status)
					.json(error);
			} else {
				return res.serverError(error);
			}
		}

		var attr = {
			googleEmail: accessToken.id_token.jwt.email
		};

		if (req.session.authenticated) {
			attr['user'] = req.session.user.id;
			waterlock.engine.attachAuthToUser(attr, req.session.user, userFound);
		} else {
			waterlock.engine.findOrCreateAuth(attr, attr, userFound);
		}
	}

	/**
	 * [userFoundOrCreated description]
	 * @param  {[type]} err  [description]
	 * @param  {[type]} user [description]
	 * @return {[type]}      [description]
	 */
	function userFound(err, user) {
		if (err) {
			waterlock.logger.debug(err);
			return waterlock.cycle.loginFailure(req, res, null, {
				error: 'trouble creating model'
			});
		}

		waterlock.cycle.loginSuccess(req, res, user);
	}
};
