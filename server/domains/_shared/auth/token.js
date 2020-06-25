var config = require('../../../config')(),
	// this module works sync - ToDo: find a better (async) alternative
	jwt = require('jwt-simple'), 
	Q = require('q'),
	logger = require('../../../utils/logger');


module.exports = {
	hasExpired: function(expDate) {
	    var now = Date.now();
		if(now >= expDate)
			return true;
		return false;
	},
	
	// encode to a JWT 
	encode: function(data, secret) {
		try {
  		var token = jwt.encode(data, secret || config.auth.tokenSecret);
			return Q.fcall(function () {
			    return token;
			});
		} catch(err) {
			var msg = 'Could not encode jwt token';
			logger.error(err, {msg:msg});
			return Q.fcall(function () { throw new Error(msg); });
		}
	},
	
	// extract content & verify token by signature part
	decode: function(data, secret) {
		try {
			var token = jwt.decode(data, secret || config.auth.tokenSecret);
			return Q.fcall(function () {
			    return token;
			});
		} catch(err) {
			var msg = 'Could not decode jwt token';
			logger.error(err, {msg:msg});
			return Q.fcall(function () { throw new Error(msg); });
		}
	},
	
	extractContent: function(token) {
		var parts = token.split('.');
		var headers = new Buffer(parts[0], 'base64').toString('utf8');
		var payload = new Buffer(parts[1], 'base64').toString('utf8');
		return {
			headers: JSON.parse(headers),
			payload: JSON.parse(payload)
		}
	},
	
	// little helper to extract the token only from the header string
	parseBearerFromHeader: function(bearerToken) {
		var key = 'bearer';
		var parts = bearerToken.split(' ');
		  
		if (parts.length === 2 && parts[0].toLowerCase() === key) 
			return Q.fcall(function () { return parts[1]; });
		
		return Q.fcall(function () { throw new Error('only RFC6750 bearer token supported'); });
	}
}