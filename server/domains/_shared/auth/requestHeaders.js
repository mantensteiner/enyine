var config = require('../../../config')(),
		ValidationError = require('../../../utils/errors').ValidationError;

// helper to build HTTP request headers 
module.exports = {
	setInternalAuthHeader: function(headers) {
		if(!config.auth.internalApiKey)
			throw new ValidationError('config.auth.internalApiKey');
		
		if(!headers) {
			return {
			  'Authorization': 'Bearer ' + config.auth.internalApiKey
			}
		}
		else {
			headers.Authorization = 'Bearer ' + config.auth.internalApiKey;
			return headers;
		}
	},	
	setAuthHeader: function(token, headers) {
		if(!headers) {
			return {
			  'Authorization': 'Bearer ' + token
			}
		}
		else {
	 		headers.Authorization = 'Bearer ' + token;
			return headers;
		}
	}
} 