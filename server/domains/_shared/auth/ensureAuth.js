var SessionCache = require('./sessionCache'),
    Token = require('./token'),
    log = require('../../../utils/logger'),
    config = require('../../../config')(),
    interServiceAuth = require('./interServiceAuth'),
    externalServiceAuth = require('./externalServiceAuth');

module.exports = function (options) {
  return function(req, res, next) {
      
    // header for token-auth provided
    if(req.headers.authorization) {
      Token.parseBearerFromHeader(req.headers.authorization)
      .then(function(token) {
        // load the account from the session cache 
        SessionCache()
        .get(token)
        .then(function(account) { 
          if(!account)
            return res.status(401).json(new Error("auth_token not valid"));
            
          // ok
          req.user = account;
          req.token = token;
          next();
        })
        .fail(function(err) { // error
          if(err.code && err.code === 401) {
            return res.status(401).json(new Error(err.message));
          }  
          return res.status(500).json(new Error('authentication error'));
        });
      })
      .fail(function(err) {
        log.error(err, {name: 'ensureAuth.parseBearerFromHeader', reqHeader: req.headers.authorization});
        return res.status(500).json(new Error('authentication error'));
      });
    }
    // if no standard authentication header set, try inter-service or exteral-service authentication
    else {
        
      // Internal service communication (headers are created on follow-up requests after successful user-or-system auth)
      if(interServiceAuth.headersSet(req.headers)) {
        try {
          var token = interServiceAuth.getTokenFromHeaders(req.headers);
          interServiceAuth.verifyAndGetTokenContent(token)
          .then(function(tokenData) {
            
            if(!tokenData || !tokenData.userId)
              throw new Error("incorrect userdata in token");
            
            var user = {
              id : tokenData.userId,
              username: tokenData.username,
              email: tokenData.email
            };
            
            // By using a self contained Token for interServiceAuth, a verified token can be trusted
            // with no need for additional Session-Checks (which would also not work for user-impersonation
            // by third party systems as used in externalServiceAuth-requests)
            
            req.user = user;
            req.token = token;
            next();
          })
          .fail(function(err) {
            log.error(err, {name: 'ensureAuth.interServiceAuth.verifyGetTokenContent', headers: req.headers});         
            return res.status(500).json(new Error('authentication error'));
          })
        }
        catch(err) {
          log.error(err, {name: 'ensureAuth.interServiceAuth.getTokenFromHeader', headers: req.headers});
          return res.status(500).json(err);
        }
      }
      
      // External system authentication 
      // Use a shared-secret for validation, a secret is stored for each external system on both sides
      // (in enyine in the system-config domain)
      // The shared secret is also used by enyine on webhooks back to the external system
      else if(externalServiceAuth.headersSet(req.headers)) {
        try {
          // token, generated by the external system (a JWT token with the shared secret of the system)
          var externalToken = externalServiceAuth.getTokenFromHeaders(req.headers);
          // identifier of the external system
          var systemKey = externalServiceAuth.getSystemKeyFromHeaders(req.headers);
          externalServiceAuth.verifyAndGetTokenContent(externalToken, systemKey)
          .then(function(tokenData) {
            var user = {
              id : tokenData.userId,
              username: tokenData.username,
              email: tokenData.email
            };
            
            // with this valid credentials the follow up-requests will switch to inter-service-auth 
            // in the name of the user provided in the token payload
            
            req.user = user;
            req.token = token;
            next();
          })
          .fail(function(err) {
            log.error(err, {name: 'ensureAuth.externalServiceAuth.verifyAndGetTokenContent', headers: req.headers});         
            return res.status(500).json(new Error('authentication error'));
          })
        }
        catch(err) {
          log.error(err, {name: 'ensureAuth.externalServiceAuth.getTokenFromHeaders', headers: req.headers});
          return res.status(500).json(err);
        }
      }
      else {
        return res.status(401).json({message: "not authenticated"});
      }
    }
  }
}