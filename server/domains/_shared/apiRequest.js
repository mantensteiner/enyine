var log = require('../../utils/logger'),
    ValidationError = require('../../utils/errors').ValidationError,
    NetworkRequestError = require('../../utils/errors').NetworkRequestError,
    q = require('q'),
    request = require('request');

module.exports = {
  request: function(config) {
    var defer = q.defer();
    
    if(!config.targetUrl || !config.targetMethod) {
      var err = new ValidationError('Config fields "targetUrl","targetMethod" mandatory.');
      log.error(err, {config: config,  name:'apiRequest.request'});
      return q.fcall(function () { throw err; });
    }
    
    this.execRequest(config)
    .then(function(resp) {
      defer.resolve(resp);
    })
    .fail(function(err) {
      log.error(err, {name:'apiRequest.request', code: err.code});
      defer.reject(err);
    });
    
    return defer.promise;
  },
  
  // executeRequest
  execRequest: function(config) {
    var defer = q.defer();
    
    var requestConfig = {
      url: config.targetUrl,
      headers: config.headers ? config.headers : null,
      json: true
    };
    
    if(config.targetMethod.toLowerCase() == 'post' || config.targetMethod.toLowerCase() == 'put')
      requestConfig.body = config.payload;
    
    request[config.targetMethod.toLowerCase()](requestConfig, 
      function (error, response, body) {
        if(error) {
          if(response)
            error.code = response.statusCode;
          return defer.reject(error);
        }
        
        return defer.resolve({
          headers: response.headers,
          body: response.body
        });
    });
    
    return defer.promise;
  }  
}