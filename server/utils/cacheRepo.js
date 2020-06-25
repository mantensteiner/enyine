var q = require('q'),
    redis = require("redis"),
    config = require('../config')(),
    redisClient = redis.createClient(config.redis.port, config.redis.host, {auth_pass: config.redis.password}),
    RedisCacheError = require('./errors').RedisCacheError,
    log = require('./logger');

redisClient.on("error", function (err) {
  log.error(err, {name: 'redisRepo', 
    msg: "error event - " + redisClient.host + ":" + redisClient .port + " - " + err});
});

module.exports = {
  set: function(key, value) {
    var defer = q.defer();
    
    redisClient.set(key, value, function(err) {
      if(err) return defer.reject(err);
      defer.resolve(value);
    });
    
    return defer.promise;
  },
  get: function(key) {
    var defer = q.defer();
    
    redisClient.get(key, function(err, content) {
      if(err) return defer.reject(err);
      if(!content) return defer.reject(new RedisCacheError('key not found'));
      
      defer.resolve(content);
    });
    
    return defer.promise;
  },
  delete: function(key) {
    var defer = q.defer();
    
    redisClient.del(key, function(err, deletedKeyCount) {
      if(err) return defer.reject(err);
      defer.resolve(deletedKeyCount);
    });
    
    return defer.promise;
  }
}