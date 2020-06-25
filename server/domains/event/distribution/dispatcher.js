var log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError,
    NetworkRequestError = require('../../../utils/errors').NetworkRequestError,
    requestPath = require('../../_shared/requestPath'),
    q = require('q'),
    request = require('request');

module.exports = {
  // config: targetUrl, targetMethod, headers, payload
  request: function(config) {
    var defer = q.defer();
    
    if(!config.targetUrl || !config.targetMethod || !config.payload) {
      var err = new ValidationError('Config fields "targetUrl","targetMethod","payload" mandatory.');
      log.error(err, {config: config,  name:'dispatcher.request'});
      return q.fcall(function () { throw err; });
    }
    
    if(config.targetMethod.toLowerCase() !== 'post' && config.targetMethod.toLowerCase() !== 'put') {
      var err = new ValidationError('Only POST and PUT methods allowed.');
      log.error(err, {config: config,  name:'dispatcher.request'});
      return q.fcall(function () { throw err; });
    }
    
    this.execRequest(config)
    .then(function(resp) {
      defer.resolve(resp);
    })
    .fail(function(err) {
      log.error(err, {name:'dispatcher.request', code: err.code});
      defer.reject(err);
    });
    
    return defer.promise;
  },
  
  // executeRequest
  execRequest: function(config) {
    var defer = q.defer();
    
    var url = requestPath(config.targetUrl);
    
    request[config.targetMethod.toLowerCase()]({
      url: url,
      body: config.payload,
      headers: config.headers ? config.headers : null,
      json:true
    }, function (error, response, body) {
      if(error) {
        return defer.reject(error);
      }
      if(response && response.statusCode !== 200) {
        return defer.reject({code: response.statusCode, message: response.statusMessage});
      }
      
      return defer.resolve({
        headers: response.headers,
        body: response.body
      });
    });
    
    return defer.promise;
  }  
}