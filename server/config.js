module.exports = function(settings) {
	var config = {
		envName: 'development',
		isApiTest: false
	};

	// Override environment if passed
	if(settings && settings.environment) {
		config.envName = settings.environment;
	}
	else {
		if(process.env.NODE_ENV) {
			config.envName = process.env.NODE_ENV;
		}
	}

	console.log('ENV: ' + config.envName);
			
	config.elasticsearch = {};
	config.sendgrid = {};
	config.mail = {};
	config.redis = {};
	config.web = {};
	config.google = {};
	
	// restrict to useful and non-security critical domains for global search
	config.globalSearchDomainsWhitelist = [
		'item','itemtype','note','space','value'
	];
	
	// relative URLs will use the baseUrl as hostname
	config.eventRegistry = {
		baseUrl: '', // built after 'env' section
		updateInternalSubscriptionsUrl: '/event/updateInternalSubscriptions',
		updateSubscriptionsUrl: '/event/updateSubscriptions',
		writeEventUrl: '/event/write',
		callInternalSubscribersUrl: '/event/callInternalSubscribers'
	};
	
	// authentication
	config.auth = { 
		ttl: 3600000 * 12, // 12 hour, token expiration
		resetTokenExpiresMinutes: 20, // account activate token expiration
		refreshTokenExpiresDays: 7, // refresh token expiration
		tokenSecret: '',
		internalAuthSecret: '',
		internalApiKey: '',
		systemUser: {
			id: '10000010000000100000000100000001',
			username: 'SYSTEM',
			email: 'system@enyine.com'
		},
		testUser: {
			username: '',
			email: '',
			password: ''
		}
	};
	
	if(config.envName === 'development_server') {
		config.elasticsearch.host =  process.env.ELASTICSEARCH_URL;
		config.elasticsearch.logLevel = process.env.ELASTICSEARCH_LOG_LEVEL || 'info';
		config.sendgrid.apiKey = '';
		config.mail.supportAddress = process.env.MAIL_SUPPORT_ADDRESS || '';
		config.mail.supportPassword = process.env.MAIL_SUPPORT_PASSWORD || '';
		config.redis.host = process.env.REDIS_HOST;
		config.redis.port = process.env.REDIS_PORT || 6379;
		config.redis.password = process.env.REDIS_PASSWORD || '';
		config.web.hostUrl = process.env.HOST_URL;
		config.web.port = process.env.PORT || 3000;
		config.web.baseUrl = config.web.hostUrl + ':' + config.web.port;
		config.web.port_eventstore = process.env.PORT_EVENTSTORE || 3001;
		config.web.eventUrl = config.web.hostUrl + ':' + config.web.port_eventstore;
		config.google.clientId = process.env.GOOGLE_CLIENT_ID || '';
		config.google.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
	}
	
	if(config.envName === 'development') {
		config.elasticsearch.host = '';
		config.elasticsearch.logLevel = 'info';		
		config.sendgrid.apiKey = '';		
		config.mail.supportAddress = '';
		config.mail.supportPassword = '';		
		config.redis.host = 'localhost';
		config.redis.port = 6379;		
		config.web.hostUrl = 'http://localhost';				
		config.web.port = process.env.PORT || 3000;
		config.web.baseUrl = config.web.hostUrl + ':' + config.web.port;
		config.web.port_eventstore = process.env.PORT_EVENTSTORE || 3001;
		config.web.eventUrl = config.web.hostUrl + ':' + config.web.port_eventstore;		
		config.google.clientId = '';
		config.google.clientSecret = '';
	}
	
	config.web.hostUrl_eventStore = process.env.HOST_URL_EVENTSTORE || config.web.hostUrl;
	config.eventRegistry.baseUrl = config.web.hostUrl_eventStore + ':' + config.web.port_eventstore;
	
	// Determine if we're in a integration test scenario
	// (may be helpful to e.g. setup different databases)
	config.getIndex = function(indexName) {
		var indexNameToUse = indexName;
		if(config.isApiTest) {
			indexNameToUse = indexNameToUse + '_test.1';
		}
		
		console.log(`Index ${indexNameToUse}`);
		return indexNameToUse;
	}
	
	
	return config;
};