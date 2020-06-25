var idGen = require('../../../utils/idGen'),
		AuthenticationError = require('../../../utils/errors').AuthenticationError,
		config = require('../../../config')(),
		_ = require('underscore'),
		q = require('q'),
		Token = require('./token'),
		externalAuthHeaderName = 'x-enyine-authentication-external',
		externalAuthHeaderSystemKeyName = 'x-enyine-authentication-external-systemkey';



var buildTokenPayload = function(payloadConfig) {
  var now = Date.now();
  var expires = now + (1000 * 60); // 1 minute
  
  // could also encode the ip and later compare/decode for more security 
  var payload = { 
    // registered claims
    iss: 'enyine.com',
    exp: expires,
    // public claims
    userId: payloadConfig.userId, 
    username: payloadConfig.username, 
    email: payloadConfig.email,
		// provide addtional usernames to match the same user with different accounts
		aliases: payloadConfig.aliases || null, 
		spaceId: payloadConfig.spaceId,
		transaction: idGen()
  };
  
  return payload;
}

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
	Token.encode(buildTokenPayload(tokenConfig.user), config.auth.internalAuthSecret)
	.then(function(token) {
		if(!headers)
			headers = {};
		headers[externalAuthHeaderName] = token;
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
 * 	check if the headers for external auth are set
 */
module.exports.headersSet = function(headers) {
	if(!headers[externalAuthHeaderName] || !headers[externalAuthHeaderSystemKeyName])
		return false;
	return true;
}

/**
 * 	extract the token from the correct header
 */
module.exports.getTokenFromHeaders = function(headers) {
	if(!headers[externalAuthHeaderName])
		throw new Error('Header "'+externalAuthHeaderName+'" missing.');
	return headers[externalAuthHeaderName];
}

/**
 * 	extract the systemKey header
 */
module.exports.getSystemKeyFromHeaders = function(headers) {
	if(!headers[externalAuthHeaderSystemKeyName])
		throw new Error('Header "'+externalAuthHeaderSystemKeyName+'" missing.');
	return headers[externalAuthHeaderSystemKeyName];
}

/**
 * 	ToDo: verify the token and extract the content for a specific system
 */
module.exports.verifyGetTokenContent = function(token, systemKey) {
	var defer = q.defer();
	
	// systemKey: Load from system-config-domain to get secret and permitted spaceIds
	return q.fcall(function() { throw new Error("Not Implemented") });
	
	Token.decode(token/*, SPECIFIC KEY FOR SYSTEM */)
	.then(function(content) {
		var tokenData = content;
		if(Token.hasExpired(tokenData.exp))
			return defer.reject(new AuthenticationError('Token has expired.'));
			
		if(!tokenData.userId || !tokenData.username) 
			return defer.reject(new AuthenticationError('UserId and Username must be set in token payload.'));
			
		if(!tokenData.spaceId) 
			return defer.reject(new AuthenticationError('spaceId must be set in token payload.'));
			
		// Validate spaceId agains system-config
			
		defer.resolve(tokenData);
	})
	.fail(function(err) {
		defer.reject(err);
	});
	return defer.promise;
}