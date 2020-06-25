var Account = require('./models/account'),
    SessionCache = require('../_shared/auth/sessionCache'),
    eventHandler = require('../_shared/eventHandler'),
    command = require('../_shared/command'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    eventSubscriptions = require('./config/eventSubscriptions'),
    restful = require('../../restful');

/**
 *  logout
 */
module.exports.logout = function (req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    SessionCache() 
    .invalidateRefreshToken(req.token) // destroys session (token+refreshToken)
    .then(function() { // success, logout
      req.logout();
      return res.json({message:'logout successful'});
    })
    .fail(function(err) { // error 
      return res.status(500).json(errorObjBuilder('logout', 'Auth', 
        new Error("Error logging out")));
    });
  }
}

/**
 *  getAuthenticatedUser
 */
module.exports.getAuthenticatedUser = function(req, res) {  
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    SessionCache()
    .get(req.token)
    .then(function(account) { // success
      res.json({
        id: account.userId,
        username: account.username,
        email: account.email
      });
    })
    .fail(function(err) { // error
      return res.status(500).json(errorObjBuilder('getAuthenticatedUser', 'Auth', 
        new Error("Error getting authenticated user")));    
    });
  } 
}

/**
 *  refreshToken
 */
module.exports.refreshToken = function(req, res) { 
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    SessionCache()
    .refresh(req.token) // refresh auth_token
    .then(function(newToken) { // success
      res.json({oldToken: req.token, token: newToken});
    })
    .fail(function(err) { // error
      return res.status(500).json(errorObjBuilder('refreshToken', 'Auth', 
        new Error("Error refreshing the authentication token")));    
    });
  }
}

/**
 *  invalidateRefreshToken
 */
module.exports.invalidateRefreshToken = function(req, res) {  
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    SessionCache()
    .invalidateRefreshToken(req.token) // remove user session
    .then(function() { // success
      return res.json({message: 'user session removed'});
    })
    .fail(function(err) { // error
      return res.status(500).json(errorObjBuilder('invalidateRefreshToken', 'Auth', 
        new Error("Error invalidating the user session")));
    });
  }
}

/**
 *  updateAccount
 */
module.exports.updateAccount = function (req, res){
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var event = eventHandler(req, res, eventSubscriptions);
        return Account({
          user: req.user,
          txnId: txnId,
          data: event.formattedData
        })
        .save();
      },
      success: function(account) {
        res.json(account);
      },
      fail: function(err) {
        return res.status(500).json(errorObjBuilder('refreshToken', 'Auth', 
          new Error("Error updating account")));
      }
    });
  }
}