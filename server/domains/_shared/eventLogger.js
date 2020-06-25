var q = require('q'),
    eventDispatcher = require('./event/eventDispatcher'),
    interServiceAuth = require('./auth/interServiceAuth'),
    transactionHeader = require('./transactionHeader'),
    config = require('../../config')(),
    sessionCache = require('./auth/sessionCache'),
    requestHeaders = require('./auth/requestHeaders');


module.exports = function(eventConfig, user) {
  var defer = q.defer();
  
  /*
  * Authentication from this point on is done via inter-service-auth.
  * A special internal token, secured by a internal secret, is used.
  * This token is self contained an carries all neccessary user info
  * for all further request.
  *
  * With this way calling the session-cache all over the place 
  * to get the user session is avoided and also user-impersonation
  * from request by external, automated services (no user session is active)
  * is possible.
  */
  
  // Build authentication header from current user-session
  var interServiceAuthHeaders = null;
  interServiceAuth.setHeaderToken({
     event: eventConfig.namespace,
     user: user
  })
  .then(function(headers) {
    if(eventConfig.txnId)
      transactionHeader.set(headers, eventConfig.txnId);
    interServiceAuthHeaders = headers;
    return eventDispatcher.send(eventConfig, interServiceAuthHeaders);
  })
  .then(function(event) {
    defer.resolve(event);
  })
  .fail(function(err) {
    defer.reject(err);    
  });
  
  return defer.promise;
}