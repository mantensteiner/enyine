
module.exports = function(environment) {
	var config = {};
	
	var env = process.env.NODE_ENV || 'development';

	// Override environment if passed
	if(environment)
		env = environment;
			
	config.elasticsearch = {};	

	if(env === 'development_server') {
		config.elasticsearch.host = process.env.ELASTICSEARCH_URL;
		config.elasticsearch.logLevel = process.env.ELASTICSEARCH_LOG_LEVEL || 'info';
	}
	
	if(env === 'development') {
		config.elasticsearch.host = 'localhost:9200';
		config.elasticsearch.logLevel = 'info';
	}
	
	if(env === 'QA') {
		config.elasticsearch.host = process.env.ELASTICSEARCH_URL;
		config.elasticsearch.logLevel = 'warning';
	}
	
	if(env === 'production') {
		config.elasticsearch.host = process.env.ELASTICSEARCH_URL;
		config.elasticsearch.logLevel = 'warning';
	}
	
	return config;
}