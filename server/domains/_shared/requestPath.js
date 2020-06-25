var config = require('../../config')();

// URL builder helper
module.exports = function(path) {
	
	if(path.indexOf('http') === 0) { // full URL?
		return path;
	} else {
		var baseUrl = config.web.hostUrl + ":" + config.web.port;
		return baseUrl + path; 
	}
}