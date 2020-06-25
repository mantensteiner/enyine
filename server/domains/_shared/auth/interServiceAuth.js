var idGen = require('../../../utils/idGen'),
		AuthenticationError = require('../../../utils/errors').AuthenticationError,
		config = require('../../../config')(),
		_ = require('underscore'),
		q = require('q'),
		Token = require('./token'),
		internalAuthHeaderName = 'x-enyine-authentication-internal';


var buildTokenPayload = function(userData) {
  var now = Date.now();
  var expires = now + (1000 * 60); // 1 minute
  
  // could also encode the ip and later compare/decode for more security 
  var payload = { 
    // registered claims
    iss: 'enyine.com',
    exp: expires,
    // public claims
    userId: userData.id || userData.userId, 
    username: userData.username, 
    email: userData.email,
		transaction: idGen()
  };
  
  return payload;
}

module.exports.headerName = internalAuthHeaderName;

/**
 * 	use a standard JWT for internal service auth via custom 'X-Enyine-Authentication-Internal' header
 *  by using a JWT for internal communication checking for sessions is not neccessary, the token 
 *  contains all user data and can be validated.
 * 
 *  Important: Only use this way of authentication for inter-service communication after the caller was
 *  validated with the primary auth strategies in the first place (auth_token/user session, external_system auth)
 */
module.exports.setHeaderToken = function(tokenConfig, headers) {
	var defer = q.defer();
	
	if(!tokenConfig.user) 
		return q.fcall(function() { throw new Error('setHeaderToken tokenConfig no user set.') });
	
	Token.encode(buildTokenPayload(tokenConfig.user), config.auth.internalAuthSecret)
	.then(function(token) {
		if(!headers)
			headers = {};
		headers[internalAuthHeaderName] = token;
	 defer.resolve(headers);
	})
	.fail(function(err) {
		defer.reject(err);		
	});
	return defer.promise;
}

/**
 * 	verify the token 
 */
module.exports.verifyToken = function(token) {
	return Token.decode(token, config.auth.internalAuthSecret);
}

/**
 * 	check if the header for internal service auth is set
 */
module.exports.headersSet = function(headers) {
	if(!headers[internalAuthHeaderName])
		return false;
	return true;
}

/**
 * 	extract the token from the correct header
 */
module.exports.getTokenFromHeaders = function(headers) {
	if(!headers[internalAuthHeaderName])
		throw new Error('Header "'+internalAuthHeaderName+'" missing.');
	return headers[internalAuthHeaderName];
}

/**
 * 	verify the token and extract the content
 */
module.exports.verifyAndGetTokenContent = function(token) {
	var defer = q.defer();
	Token.decode(token, config.auth.internalAuthSecret)
	.then(function(tokenData) {
		if(Token.hasExpired(tokenData.exp))
			return defer.reject(new AuthenticationError('Token has expired.'));
		defer.resolve(tokenData);
	})
	.fail(function(err) {
		defer.reject(err);
	});
	return defer.promise;
}


/**
* For internal service communication - authentication, combined with a transaction id
* Special headers X-Enyine-Event, X-Enyine-Transaction, X-Enyine-Username are hashed with an internal secret
* Works like most webhooks auth
* 
* DEPRICATED: USE DEFAULT JWT LIKE ABOVE,
* 
* 
*/
/*
module.exports.setHeaders = function (config, headers) {
	if(!headers)
		headers = {};
	
	var xEnyineHeaders = {
		'X-Enyine-Event': config.event,
		'X-Enyine-Transaction': idGen(),
		'X-Enyine-Username': config.username,
	};
	
	_.extend(headers, xEnyineHeaders);
   
	// Calculate hash from body payload with space hook secret
  var hmac = crypto.createHmac('sha1', config.auth.internalAuthSecret);
  var hash = hmac.update(JSON.stringify(xEnyineHeaders)).digest('hex');
	headers['X-Hub-Signature'] = hash;
	
	return q.fcall(function () { return headers; });
}

module.exports.validate = function (req, enyineHeaders) {
	if(!req.headers || 
		!req.headers['X-Enyine-Transaction'] ||
	 	!req.headers['X-Enyine-Username'] || 
	 	!req.headers['X-Enyine-Event'] || 
		!req.headers['X-Hub-Signature']) {
			throw new AuthenticationError('InterServiceAuth: Failed to validate X-Enyine or X-Hub-Signature headers.');
		}
	
	var xEnyineHeaders = {
		'X-Enyine-Event': req.headers['X-Enyine-Event'],
		'X-Enyine-Transaction': req.headers['X-Enyine-Transaction'],
		'X-Enyine-Username': req.headers['X-Enyine-Username']
	};
	
	// Calculate hash from body payload with space hook secret
  var hmac = crypto.createHmac('sha1', config.auth.internalAuthSecret);
  var hash = hmac.update(JSON.stringify(xEnyineHeaders)).digest('hex');
	
	if(req.headers['X-Hub-Signature'] !== hash)
		return false;
		//throw new AuthenticationError('InterServiceAuth: X-Hub-Signature header not matching.');
	
	xEnyineHeaders['X-Hub-Signature'] = req.headers['X-Hub-Signature'];
	enyineHeaders = xEnyineHeaders;
	return true;
}
*/