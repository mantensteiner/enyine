var Account = require('../models/account'),
    passport = require('passport'),
    log = require('../../../utils/logger'),
    restful = require('../../../restful'),
    AuthenticationError = require('../../../utils/errors').AuthenticationError;

/*
 Process user login
*/
module.exports.login = function(req, res) {
  restful(req, res, {
      post: handlePost 
  });
  
  function handlePost() {
    var redirect = req.query.redirect ? req.query.redirect : '/dash';
    
    passport.authenticate('local', function(err, account, info) {
      if(err) 
        return res.status(err.code).json({message: info.message});
    
      redirect = redirect ? redirect : '/#/dash';
      return res.json({ 
        user:{ 
          username: account.username,
          email: account.email, 
          name: account.name
        },
        token: account.token, 
        redirect: decodeURIComponent(redirect) 
      });
    })(req, res);  
  }
}

/*
 Create token for user password reset
*/
module.exports.reset = function(req, res) {
  restful(req, res, {
    post: handlePost 
  });
  
  function handlePost() {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];
    
    Account({unauthenticatedOperation: true})
    .requestPasswordReset({
      email: req.body.email, 
      ip: ip, 
      agent: agent
    })
    .then(function(account) {
      res.json(account);
    })
    .fail(function(err) {  
      res.status(500).json({message: 'Error resetting password for email ' + req.body.email});
    });
  }
}


/*
 Register new user
*/
module.exports.register = function (req,res) {
  restful(req, res, {
    post: handlePost 
  });
  
  function handlePost() {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];
    
    Account({unauthenticatedOperation: true})
    .register({
      username: req.body.username, 
      email: req.body.email, 
      password: req.body.password, 
      ip: ip, 
      agent: agent})
    .then(function(account) {
      return res.json(account);
    })
    .fail(function(err) {   
      return res.status(500).json({message: 'Error registering user ' + req.body.username});
    });
  }
}

/*
 Get user by token
*/
module.exports.getUserByToken = function(req, res) {
  restful(req, res, {
    post: handlePost 
  });
  
  function handlePost() {
    Account({unauthenticatedOperation: true})
    .findOne({activationToken:req.body.token})
    .then(function(account) {
      if(!account) 
        return res.status(404).json({message: "Activation link is not valid."});
        
      res.json({
        id: account.id,
        username: account.username,
        email: account.email,
        token: account.activationToken
      });
    })
    .fail(function(err) {
      return res.status(500).json({message: 'Error getting user by token ' + req.body.token});
    });
  }
}

/*
 Activate user account
*/
module.exports.activate = function(req, res) {
  restful(req, res, {
    post: handlePost 
  });
  
  function handlePost() {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];
    
    Account({unauthenticatedOperation: true})
    .activate({
      token: req.body.token, 
      ip: ip, 
      agent: agent
    })
    .then(function(account) {
      return res.json(account);
    })
    .fail(function(err) { 
      return res.status(500).json({message: 'Error activating user by token ' + req.body.token});
    });
  }  
}

/*
 Process user password reset
*/
module.exports.resetPassword = function(req, res) {
  restful(req, res, {
    post: handlePost 
  });
  
  function handlePost() {  
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];
    
    Account({unauthenticatedOperation: true})
    .executePasswordReset({
      username: req.body.username, 
      token: req.body.token, 
      password: req.body.password, 
      ip: ip, 
      agent: agent
    })
    .then(function(account) {
      return res.json(account);
    })
    .fail(function(err) {  
      return res.status(500).json({message:'Error resetting password for user ' + req.body.username});
    });
  }  
}
