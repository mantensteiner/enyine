var domainApis = {},
    apiRequest = require('./apiRequest'),
    q = require('q'),
    interServiceAuth = require('./auth/interServiceAuth'),
    config = require('../../config')();

/**
 * Used for querying other domains, usesfollowing conventions 
 * for simplicity:
 * 
 * APIs must register in their api-config
 * Possible handlers: get, getById, search
 * 
 * apiConfig: {
 *  handlers: {
 *    get: '/api/user/get', (get)
 *    getById: '/api/user/getById/:id', (get)
 *    search: '/api/user/search', (post)
 *  }
 * }
 * 
 * caller experience:
 * apiRegistry.getDomain('user').search('token:'+modelData.token).then(function(result) {...})
 * 
 */
 
module.exports.register = function (name, apiConfig) {
  if (!domainApis[name]) {
      domainApis[name] = apiConfig;
  }
};

module.exports.remove = function (name) {
  delete domainApis[name];
};

module.exports.getDomain = function (name, user) {
  var api = domainApis[name];
  
  return {
    // search
    search: function(query) {
      if(!api.handlers.search)
        return q.fcall(function() { throw new Error('api-handler "search" not registered for domain ' + name) });
      
      var defer = q.defer();
      interServiceAuth.setHeaderToken({
        user: user,
        event: name + '.search'
      })
      .then(function(authHeaders) { 
        return apiRequest.request({
          targetUrl: config.web.baseUrl + api.handlers.search,
          targetMethod: 'post',
          headers: authHeaders,
          payload: {
            query: query
          }
        });  
      })
      .then(function(response) {
        // do something with headers: response.headers
        defer.resolve(response.body);
      })
      .fail(function(err) {
        err.source = name;
        defer.reject(err);
      });
      return defer.promise;
    },
    
    // get
    get: function() {
      if(!api.handlers.search)
        return q.fcall(function() { throw new Error('api-handler "get" not registered for domain ' + name) });
        
      var defer = q.defer();
      interServiceAuth.setHeaderToken({
        user: user,
        event: name + '.get'
      })
      .then(function(authHeaders) {
        return apiRequest.request({
          targetUrl: api.handlers.get,
          targetMethod: 'get',
          headers: authHeaders
       });
      })
      .then(function(response) {
        // do something with headers: response.headers
        defer.resolve(response.body);
      })
      .fail(function(err) {
        err.source = name;
        defer.reject(err);
      });
      return defer.promise;
    },
    
    // getById
    getById: function(id) {
      if(!api.handlers.getById)
        return q.fcall(function() { throw new Error('api-handler "getById" not registered for domain ' + name) });
        
      var defer = q.defer();
      var url = api.handlers.getById.replace(':id', id);
      interServiceAuth.setHeaderToken({
        user: user,
        event: name + '.getById'
      })
      .then(function(authHeaders) {
        return apiRequest.request({
          targetUrl: url,
          targetMethod: 'get',
          headers: authHeaders
        });
      })
      .then(function(response) {
        // do something with headers: response.headers
        defer.resolve(response.body);
      })
      .fail(function(err) {
        err.source = name;
        defer.reject(err);
      });
      return defer.promise;
    }
  }
}