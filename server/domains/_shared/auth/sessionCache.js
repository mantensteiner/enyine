var q = require('q'),
    moment = require('moment'),
    cacheRepo = require("../../../utils/cacheRepo"),
    config = require('../../../config')(),
    log = require('../../../utils/logger'),
    AuthenticationError = require('../../../utils/errors').AuthenticationError,
    Token = require('./token');

module.exports = function() {

  var sessionCache = {};
  
  /*  
      Authentication token
  */
  
  // use JWT format for payload
  sessionCache.buildTokenPayload = function(account) {
    var now = Date.now();
    var expires = now + config.auth.ttl;
    
    // could also encode the ip and later compare/decode for more security 
    var payload = { 
      // registered claims
      iss: 'enyine.com',
      exp: expires,
      // public claims
      userId: account.id || account.userId, 
      username: account.username, 
      email: account.email
    };
    
    return payload;
  }
  
  // key of the session in the cache, contains the username
  sessionCache.buildUserSessionKey = function(account) {
    return 'session+' + account.username;
  }
  
  // util method to build the session key
  sessionCache.getUsernameFromSessionKey = function(sessionKey) {
    var parts = sessionKey.split('+');
    return parts[1];
  }
  
  // sessionCache.create
  sessionCache.create = function(account) {
    var defer = q.defer();
    
    var sessionKey = sessionCache.buildUserSessionKey(account);
    var tokenPayload = sessionCache.buildTokenPayload(account);
    cacheRepo.set(sessionKey, JSON.stringify(tokenPayload))
    .then(function() {
      return Token.encode(tokenPayload); 
    })
    .then(function(token) {
      return defer.resolve(token); 
    })
    .fail(function(err) {
      log.error(err, {sessionKey: sessionKey, account:account, name:'sessionCache.create'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // sessionCache.get
  sessionCache.get = function(token) {
    var defer = q.defer();   
    
    var tokenAccountData = null;
    var sessionKey = '';
    Token.decode(token)
    .then(function(_tokenAccountData) {
      tokenAccountData = _tokenAccountData;
      sessionKey = sessionCache.buildUserSessionKey(tokenAccountData);
      return cacheRepo.get(sessionKey);
    })
    .then(function(contentFromSession) {
      var sessionData = JSON.parse(contentFromSession);
      // Additional validation of the provided token with the token from the session cache
      if(sessionData.exp != tokenAccountData.exp)
        throw new AuthenticationError('Provided token and SessionToken do not match, invalid session.');
        
      // what to do if the token is expired?
      // the client must assure it has a valid token
      if(Token.hasExpired(sessionData.exp)) {
        var msg = "Authentication token has expired";
        var err = new Error(msg);
        err.code = 401;
        log.error(err, {sessionData:sessionData, name:'sessionCache.cacheRepo.get'});
        return defer.reject(err);
      }
      return defer.resolve(sessionData);
    })
    .fail(function(err) {
      log.error(err, {sessionKey: sessionKey, name:'sessionCache.cacheRepo.get'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // sessionCache.getByUsername
  sessionCache.getByUsername = function(username, doNotExtractData) {
    var defer = q.defer();
    
    // rebuild sessionKey from username
    var sessionKey = sessionCache.buildUserSessionKey({username:username});
    
    cacheRepo.get(sessionKey) 
    .then(function(contentFromSession) { // get session content
      if(!doNotExtractData) {
        var sessionData = JSON.parse(contentFromSession);
        return defer.resolve(sessionData);
      }
      else {
        return defer.resolve(contentFromSession);
      }
    })
    .fail(function(err) {
      log.error(err, {sessionKey: sessionKey, name:'sessionCache.cacheRepo.getByUsername'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // sessionCache.destroy
  sessionCache.destroy = function(token) {
    var defer = q.defer();
    
    if(!token)
      return q.fcall(function () {  return new Error('No token provided'); });
    
    var sessionKey = null;
    Token.decode(token) // decode token
    .then(function(accountData) { // delete session
      var sessionKey = sessionCache.buildUserSessionKey(accountData);
      return cacheRepo.delete(sessionKey)
    })
    .then(function(deletedKeyCount) { // success
        return defer.resolve();
    })
    .fail(function(err) {
      log.error(err, {sessionKey: sessionKey, name:'sessionCache.destroy'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  
  /*
      Refresh token
  */
  
  sessionCache.buildUserRefreshTokenKey = function(account) {
    return 'session_refresh+' + account.username;
  }
  
  sessionCache.buildRefreshTokenPayload = function(account) {
    var now = Date.now();
    var expires = now + (config.auth.refreshTokenExpiresDays * (3600 * 1000) * 24);
    
    var payload = { 
      iss: 'enyine.com',
      exp: expires,
      userId: account.userId, 
      username: account.username, 
      email: account.email
    };
    
    return JSON.stringify(payload);
  }
  
  sessionCache.deserializeRefreshTokenContent = function(content) {
    return JSON.parse(content);
  }
  
  // sessionCache.createRefreshToken
  sessionCache.createRefreshToken = function(account) {
    var defer = q.defer();
    
    var refreshKey = sessionCache.buildUserRefreshTokenKey(account);
    cacheRepo.set(refreshKey, sessionCache.buildRefreshTokenPayload(account))
    .then(function() {
      return defer.resolve(refreshKey);
    })
    .fail(function(err) {
      log.error(err, {sessionKey: refreshKey, account:account, name:'sessionCache.createRefreshToken'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // sessionCache.refresh
  sessionCache.refresh = function(token) {
    var defer = q.defer();
    var accountData = null;
    
    Token.decode(token)
    .then(function(accountData) {
      var refreshKey = sessionCache.buildUserRefreshTokenKey(accountData);
      return cacheRepo.get(refreshKey)
    })
    .then(function(content) { // validate refresh_token & create new auth_token
      var refreshTokenContent = sessionCache.deserializeRefreshTokenContent(content);
      
      if(!Token.hasExpired(refreshTokenContent.exp)) {
        return sessionCache.create(accountData);
      }
      // just give back existing token, because a renewal of the refresh token is necessary (re-login) 
      // ToDo
      // What to do? Destroy the session and force hard re-login is really bad UX
      return q.fcall(function () { return token; });
    })
    .then(function(token) { // success, renewed session
      return defer.resolve(token);
    })
    .fail(function(err) { // error
      log.error(err, {name: 'sessionCache.refresh'});
      return defer.reject(err);
    })
    
    return defer.promise;
  }
  
  // sessionCache.invalidateRefreshToken
  sessionCache.invalidateRefreshToken = function(token) {
    var defer = q.defer();
    
    //var accountData = Token.extractContent(token).payload;
    //var refreshKey = sessionCache.buildUserRefreshTokenKey(accountData);
    var tokenAccountData = null;
    var refreshKey = null;
    
    Token.decode(token)
    .then(function(_tokenAccountData) {
      tokenAccountData = _tokenAccountData;
      refreshKey = sessionCache.buildUserRefreshTokenKey(tokenAccountData);
      return cacheRepo.get(refreshKey)
    })
    .then(function(content) { // validate & delete refresh token
      var refreshTokenContent = sessionCache.deserializeRefreshTokenContent(content);
      // Validation of the account
      if(refreshTokenContent.username !== tokenAccountData.username) 
        throw new AuthenticationError("User mismatch when invalidating the refreshToken.");
      
      return cacheRepo.delete(refreshKey)
    })
    .then(function(deletedKeyCount) {  // also destroy current session
      return sessionCache.destroy(token);
    })
    .then(function(account) { // success
      return defer.resolve();
    })
    .fail(function(err) { // error
      log.error(err, {name: 'sessionCache.invalidateRefreshToken'});
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  return sessionCache;
};