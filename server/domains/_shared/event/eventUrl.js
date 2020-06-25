var ValidationError = require('../../../utils/errors').ValidationError;

// URL builder helper
module.exports = function(config) {
	if(!config || !config.eventRegistry)
		throw new ValidationError('config.eventRegistry');
		
	return {
		get: function(path) {			
		  return buildUrl(config.eventRegistry[path]);
			
			function buildUrl(configUrl) {
			 if(configUrl.indexOf('http') === 0) { // full URL?
			   return configUrl;
			  } else {
			    // use same server with relative path if no full URL provided     
			    return config.eventRegistry.baseUrl + configUrl; 
			  }
			}
	  }
	}
}