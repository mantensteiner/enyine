var request = require('request'),
	  authRequestHeaders = require('../auth/requestHeaders'),
    config = require('../../../config')(),
    log = require('../../../utils/logger'),
    eventUrl = require('./eventUrl')(config),
    q = require('q');

// Register to eventstore 
module.exports = {  
	saveInternalSubscriptions: function(subscriptionConfig, headers) {
    var defer = q.defer();
        
    // HTTP POST
    var url = eventUrl.get('updateInternalSubscriptionsUrl');
    request.post({
      url:url, 
      body:subscriptionConfig, 
      headers: authRequestHeaders.setInternalAuthHeader(headers),
      json:true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        log.info({
          name: 'eventSubscriber.saveInternalSubscriptions', 
          subscriber: subscriptionConfig.subscriberKey,
          msg: 'Success'
        });
        return defer.resolve(body);
      }
      else {
        log.error(error, {name: 'eventSubscriber.saveInternalSubscriptions', subscriptionConfig: subscriptionConfig});
        return defer.reject(new Error('Error saving internal subscriptions to event service.'));
      }
    });
    
	  return defer.promise;
	},  
  
	saveSubscriptions: function(subscriptionConfig, headers) {
    var defer = q.defer();
        
    // HTTP POST
    var url = eventUrl.get('updateSubscriptionsUrl');
    request.post({
      url:url, 
      body:subscriptionConfig, 
      headers: headers,
      json:true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return defer.resolve(body);
      }
      else {
        return defer.reject(new Error('Error saving subscriptions to event service.'));
      }
    });
    
	  return defer.promise;
	}
}