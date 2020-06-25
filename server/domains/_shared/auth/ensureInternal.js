var SessionCache = require('./sessionCache'),
    Token = require('./token'),
    log = require('../../../utils/logger'),
    AuthenticationError = require('../../../utils/errors').AuthenticationError,
    config = require('../../../config')();

// Secure internal API-calls (like domain event registration)
// This is hard-wired in the controllers
module.exports = function (options) {
  return function(req, res, next) {
    if(!req.headers.authorization)
      return res.status(401).json({message: "not authenticated"});
      
    Token.parseBearerFromHeader(req.headers.authorization)
    .then(function(token) {
      if(token !== config.auth.internalApiKey) {
        var err = new AuthenticationError('auth_token and internalApiKey do not match');
        log.error(err, {name: 'ensureInternal.compareInternalKey', reqHeader: req.headers.authorization});
        return res.status(401).json({message: err.message});
      }
      else {
        req.user = config.auth.systemUser,
        req.token = token;
        next();
      }
    })
    .fail(function(err) {
      log.error(err, {name: 'ensureInternal.parseBearerFromHeader', reqHeader: req.headers.authorization});
      return res.status(500).json({message: 'internal authentication error'});
    });
    
  }
}