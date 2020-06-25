var request = require('request'),
    config = require('../../../config')(),
    eventUrl = require('./eventUrl')(config),
    q = require('q');

// Write to eventstore
module.exports = {
	send: function(eventConfig, headers) {
    var defer = q.defer();
    
    // operation, namespace, recordId, description, sourceData, sourceConfig[type,excludeFieldsFromEventlog]
    if(!eventConfig.operation) 
      return q.fcall(function () { throw new Error('operation missing.'); });
    else if(!eventConfig.namespace) 
      return q.fcall(function () { throw new Error('namespace missing.');});   
    else if(!eventConfig.recordId) 
      return q.fcall(function () { throw new Error('recordId missing.'); });   
    else if(!eventConfig.sourceData) 
      return q.fcall(function () { throw new Error('sourceData missing.'); });   
    else if(!eventConfig.sourceConfig || !eventConfig.sourceConfig.type) 
      return q.fcall(function () { throw new Error('sourceConfig missing.'); });
    
    // HTTP POST
	  var url = eventUrl.get('writeEventUrl');
    request.post({
      url:url, 
      body:eventConfig, 
      headers:headers, 
      json:true
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return defer.resolve(body);
      }
      else {
        return defer.reject(new Error('Error writing to event service.'));
      }
    });
	  return defer.promise;
	}
}