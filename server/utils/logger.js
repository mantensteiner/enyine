var bunyan = require('bunyan'),
		config = require('../config')();

var logger = function() {
	var bunyanLog = bunyan.createLogger({
	    name: 'enyine',
		streams: [{
		  level: 'info',
		  stream: process.stdout // log INFO and above to stdout
		}],
		/*{
		  level: 'warn',
		  stream: process.stderr // log WARN and above to stderr
		}]*/
	});
	
	function execLog(log, level) {
		bunyanLog[level](log);
	}
	
	function execErrLog(err, log) {
		if(!err)
			bunyanLog.error(log);
		else 
			bunyanLog.error(err, log);
	}
	
	return {
		debug: function(log) {
			execLog(log, 'debug');	
		},
		
		info: function(log) {
			execLog(log, 'info');	
		},
		
		warning: function(log) {
			execLog(log, 'warn');				
		},	
		
		error: function(err, log) {
			execErrLog(err, log);
		}
	};
}

module.exports = logger();