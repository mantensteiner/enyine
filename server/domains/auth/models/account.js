var BaseModel = require('../../_shared/baseModel'),
    SessionCache = require('../../_shared/auth/sessionCache'),
    Token = require('../../_shared/auth/token'),
    eventNamespaces = require('../../_shared/eventNamespaces'),
    idGen = require('../../../utils/idGen'),
    AuthenticationError = require('../../../utils/errors').AuthenticationError,
    ValidationError = require('../../../utils/errors').ValidationError,
    moment = require('moment'),
    q = require('q'),
    config = require('../../../config')(),
    emailService = require('../../../utils/emailService'),
    cryptoService = require('../../../utils/cryptoService'),
    log = require('../../../utils/logger'),
    AccountStats = require('./accountStats');


module.exports = function(modelConfig) {
  // init 
  var model = BaseModel.create({
    index: "auth",
    type: "account",
    disableEventLog: true // see exceptions below
  }, modelConfig);
  
  // remove passwordHash from result
  model.afterCreate = function(data) {
    return q.fcall(function () { 
      delete data.passwordHash;
      return data; 
    });
  }
  
  // remove passwordHash from result
  model.afterSave = function(data) {
    return q.fcall(function () { 
      delete data.passwordHash;
      return data; 
    });
  }
  
  
  // model.accountIsActive
  model.isActive = function() {
    return (model.data.activated && model.data.activated === true) ? true : false;
  }
  
  // model.limitFailedLogins (5 minutes hard coded)
  model.isSuspended = function() {
    // Account suspended?
    if(model.data.failedLoginAttempts && 
      (model.data.failedLoginAttempts.nr >= 10 && 
       moment(model.data.failedLoginAttempts.date).add(5,'minutes') > moment()))
      return {isSuspended: true, message: 'Login denied for 5 minutes for security reasons'};
    return {isSuspended: false, message: 'ok'};
  }
  
  // model.newAccount
  model.newAccount = function(username, email, id) {
    var userId = id || idGen();
    return {
      id: userId,
      userId: userId, // using the same ids for the account & user domain simplifies things a lot
      username: username,
      name: username,
      email: email,
      activationToken: idGen(),
      activationTokenExpires: moment().add(config.auth.resetTokenExpiresMinutes, 'minutes').toISOString(),
      activated: false,
      createdOn: new Date()
    };
  }
  
  // model.validatePasswordForLogin
  model.validatePasswordForLogin = function(password) {
    var defer = q.defer();
   
    // compare password for login
    var isValid = false;
    cryptoService.compare(password, model.data.passwordHash) // compare password with hash
    .then(function(areEqual) { 
      if (!areEqual) { // not matching 
        model.data.failedLoginAttempts = !model.data.failedLoginAttempts ? { nr:0 } : model.data.failedLoginAttempts.nr++;
        model.data.failedLoginAttempts.date = new Date();
      }
      else { // matching, reset failed login counter
        if(model.data.failedLoginAttempts && model.data.failedLoginAttempts.nr > 0) {
          model.data.failedLoginAttempts.nr = 0;
        }
        isValid = true;
      }
      
      model.fields = ['failedLoginAttempts'];
      model.data = model.data;
      return model.save();
    })
    .then(function() {
      return defer.resolve(isValid);
    })
    .fail(function(err) {
      log.error(err, {name:'account.validatePasswordForLogin', data: model.data});      
      return defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // model.login
  model.login = function(loginConfig) {
    var defer = q.defer();
    
    if(!loginConfig.username) 
      return q.fcall(function () { throw new ValidationError('username missing.'); });
    else if(!loginConfig.password) 
      return q.fcall(function () { throw new ValidationError('password missing.'); });
    
    var account = null;
    var token = null;
    model.fields = null; // all fields here (hash needed)
    model.findOne({username: loginConfig.username}) // find user account
    .then(function(_account) { // create session in cache
      if(!_account)
        throw new AuthenticationError('User not found');
      account = _account;
      model.data = account;
        
      if(!model.isActive())
        throw new AuthenticationError('Account not activated');
        
      var suspendInfo = model.isSuspended();
      if(suspendInfo.isSuspended)
        throw new AuthenticationError(suspendInfo.message);
      
      return model.validatePasswordForLogin(loginConfig.password);
    })
    .then(function(isValid) {
      if(!isValid) 
        throw new AuthenticationError('Invalid Password');
      return SessionCache().create(account);
    })
    .then(function(_token) {  // create refresh-token
      token = _token;
      // allow long sessions while continously issuing new auth tokens
      return SessionCache().createRefreshToken(account)
    })
    .then(function() { // log login
      var accountStats = AccountStats({logEventOverride: model.logEvent, user: model.user});
      return accountStats.addLogin({
        accountId: account.id,
        ip: loginConfig.ip, 
        agent: loginConfig.agent
      });
    })
    .then(function() { // success
      account.token = token;
      delete account.passwordHash;
      defer.resolve(account);
    })
    .fail(function(err) { // error
      if(err instanceof AuthenticationError) {
        err.code = 401; // set error code to use in later handlers
        if(account) {
          model.loginFailed(loginConfig) // save failed login attempt is correct username
          .then(function() {
            return defer.reject(err);  // do not write log, user input error & prone to DOS                    
          })
          .fail(function(err) {
            log.error(err, {name:'accout.login', loginConfig: loginConfig.username});
            return defer.reject(err);   
          });
        }
        else {
          return defer.reject(err);  
        }
      }
      else {
        log.error(err, {name:'accout.login', loginConfig: loginConfig.username});
        defer.reject(err); 
      }
    });
    
    return defer.promise;
  }
  
  // model.loginFailed
  model.loginFailed = function(loginFailedConfig) {
    var defer = q.defer();
        
    model.findOne({username: loginFailedConfig.username}) // find user by username
    .then(function(account) { // log failed login
      return AccountStats({logEventOverride: model.logEvent, user: model.user})
      .addFailedLogin({
        accountId: account.id, 
        ip: loginFailedConfig.ip, 
        agent: loginFailedConfig.agent
      }); 
    })
    .then(function(result) { // success
        defer.resolve(result); 
    })
    .fail(function(err) { // error
      log.error(err, {name:'account.loginFailed', username: loginFailedConfig.username});
      defer.reject(err);
    });
    
    return defer.promise;  
  }
  
  model.logout = function(token) {
    var defer = q.defer();
    SessionCache() 
    .invalidateRefreshToken(token) // destroys session (token+refreshToken)
    .then(function() { // success, logout
      defer.resolve();       
    })
    .fail(function(err) { // error 
      log.error(err, {name:'account.logout', token: token});
      defer.reject(err);
    });
    return defer.promise;
  }
  
  // model.requestPasswordReset
  model.requestPasswordReset = function(requestPasswordResetConfig) {
    var defer = q.defer();
    var account = null;
    
    model.findOne({email: requestPasswordResetConfig.email}) // find account 
    .then(function(_account) { // generate & save activation token
      if(!_account) 
        throw new Error('Account with email "' + requestPasswordResetConfig.email + '" not found.');
        
      account = _account;
      model.fields = ['activationToken','activationTokenExpires'];      
      account.activationToken = idGen();
      account.activationTokenExpires = moment().add(config.auth.resetTokenExpiresMinutes, 'minutes').toISOString();
      model.data = account;
      return model.save();
    })
    .then(function(account) { // log password reset request
      var accountStats = AccountStats({logEventOverride: model.logEvent, user: model.user});
      return accountStats.addPasswordResetRequest({
        accountId: account.id, 
        action: 'request', 
        ip: requestPasswordResetConfig.ip, 
        agent: requestPasswordResetConfig.agent
      });
    })
    .then(function() { // send reset email
      return emailService.sendResetLink({
        token: account.activationToken, 
        email: account.email, 
        name: account.username
      });
    })
    .then(function() { // success
      defer.resolve(account);
    })
    .fail(function(err) { // error
      log.error(err, {name:'account.requestPasswordReset', email: requestPasswordResetConfig.email});
      defer.reject(err);
    });
    
    return defer.promise;  
  }
  
  // model.register username, email, password, ip, agent, additionalProperties
  model.register = function(registrationConfig) {
    var defer = q.defer();
    
    var account = null;
    model.findOne({username: registrationConfig.username}) // check if already registered
    .then(function(_account) { // hash password
      if(_account) 
        throw new Error('User "' + registrationConfig.username + '" is already registered.');
      return cryptoService.hashPassword(registrationConfig.password);
    })
    .then(function(hash) { // create account
      account = model.newAccount(registrationConfig.username, registrationConfig.email, registrationConfig.id);
      account.passwordHash = hash;  
      model.data = account;
      model.skipAuth = true;
      return model.create();
    })
    .then(function(_account) { // create account stats
      var accountStats = AccountStats({
          data: {
          accountId: _account.id,
          userId: _account.userId,
          username: _account.username
        },
        logEventOverride: model.logEvent,
        skipAuth:true,
        user: model.user
      });
      return accountStats.create();
    })
    .then(function() { // send activation email
      return emailService.sendActivationLink({
        token: account.activationToken,
        email: account.email, 
        name: account.username
      });
    })
    .then(function() { // success
      defer.resolve(account);
    })
    .fail(function(err) { // error
      log.error(err, {name:'account.register', username: registrationConfig.username});
      defer.reject(err);
    });
    
    return defer.promise;  
  }
  
  // model.activate
  model.activate = function(activationConfig) {
    var defer = q.defer();
    
    var account = null;
    model.findOne({activationToken: activationConfig.token}) // get account by activation_token
    .then(function(_account) { // set & save activation data on account
      if(!_account) 
        throw new Error('No pending activation found.');
        
      account = _account;
      model.fields = ['activationToken','activationTokenExpires', 'username','userId','email',
        'activated', 'activatedOn', 'activationIp', 'activationAgent'];    
      account.activationToken = null;
      account.activationTokenExpires = null;
      account.activated = true;
      account.activatedOn = new Date();
      account.activationIp = activationConfig.ip;
      account.activationAgent = activationConfig.agent;
      
      model.data = account;
      
      // important business event, eg. create user in user domain
      model.namespaces.push(eventNamespaces.accountActivated);
      model.disableEventLog = false;
      
      return model.save();
    })
    .then(function(result) {  // send activation confirmation email
        emailService.sendSignupConfirmation({email: account.email, name: account.username})
        .then(function() {
          return defer.resolve(result); // success
        })
        .fail(function(err) { // log error, but succeed (the model.save operation was a success)
          log.error(err, {name: 'account.activate.sendSignupConfirmation'});
          return defer.resolve(result); // notification failed, but succeed
        })
    })
    .fail(function(err) {
      log.error(err, {name:'account.activate', activationConfig: activationConfig});      
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // model.executePasswordReset
  model.executePasswordReset = function(executePasswordResetConfig) {
    var defer = q.defer();
    var account = null;
    model.findOne({activationToken: executePasswordResetConfig.token})
    .then(function(_account) {    
      if(!_account) 
        throw new Error('User "' + executePasswordResetConfig.username + '" not found.');  
      account = _account;
      // check if activation token is expired
      if(!moment().isBefore(moment(account.activationTokenExpires)))
        throw new Error('Reset-link expired for user '+ executePasswordResetConfig.username+', request a new one.');  
      
      // hash new password
      return cryptoService.hashPassword(executePasswordResetConfig.password);
    })
    .then(function(hash) { // save updated account 
      model.fields = ['activationToken','activationTokenExpires', 'password'];      
      account.activationToken = null;
      account.activationTokenExpires = null;
      account.passwordHash = hash;
      model.data = account;
      return model.save();
    })
    .then(function() {  // log password reset execution
      var accountStats = AccountStats({logEventOverride: model.logEvent, user: model.user});
      return accountStats.addPasswordResetRequest({
        accountId: account.id, 
        action: 'execute', 
        ip: executePasswordResetConfig.ip, 
        agent: executePasswordResetConfig.agent
      });
    })
    .then(function() { // send password reset confirm email
      emailService.sendResetConfirmation({email: account.email, name: account.username})
      .then(function() {
        return defer.resolve(account); // success
      })
      .fail(function(err) { // log error, but succeed (the model.save operation was a success)
        log.error(err, {name: 'account.executePasswordReset.sendResetConfirmation'});
        return defer.resolve(); // notification failed, but succeed
      });
    })
    .fail(function(err) {
      log.error(err, {name:'account.executePasswordReset', executePasswordResetConfig: executePasswordResetConfig});      
      defer.reject();
    });
    
    return defer.promise;
  }
  
  /*
      External
  */
  
  model.createExternalLogin = function(newAccount) {
    var defer = q.defer();
    
    // save new account sourcing from a external authentication provider
    model.skipAuth = true;
    model.data = newAccount;
    var account = null;
    model.create()
    .then(function(_account) {
      account = _account;
      var accountStats = AccountStats({logEventOverride: model.logEvent, user: model.user});
      accountStats.data = {
        accountId: newAccount.id,
        userId: newAccount.userId,
        username: newAccount.username
      };
      return accountStats.create();
    })
    .then(function(accountStats) { // send new account confirmation email
      emailService.sendSignupConfirmation({email: account.email, name: account.username})
      .then(function() {
        return defer.resolve(account); // success
      })
      .fail(function(err) { // log error, but succeed (the model.save operation was a success)
        log.error(err, {name: 'account.createExternalLogin.sendSignupConfirmation'});
        return defer.resolve(account); // notification failed, but succeed
      });
    })
    .fail(function(err) {
      log.error(err, {name:'account.createExternalLogin', newAccount: newAccount});      
      defer.reject();
    });
    
    return defer.promise;
  }
  
  // model.login
  model.loginExternal = function(loginConfig) {
    var defer = q.defer();
    
    if(!loginConfig.accessToken) 
      return q.fcall(function () { throw new ValidationError('accessToken missing.'); });
    else if(!loginConfig.provider) 
      return q.fcall(function () { throw new ValidationError('provider missing.'); });
    
    var account = null;
    var token = null;
    
    var accessTokenField = 'accessToken' + loginConfig.provider;
    var accessTokenQuery = {};
    accessTokenQuery[accessTokenField] = loginConfig.accessToken;
    model.fields = null; // all fields here (hash needed)
    model.findOne(accessTokenQuery) // find account by provider access token
    .then(function(_account) { // get account
      if(!_account) {
        // create temp random name to avoid conflicts, force unique username at first
        var username =  loginConfig.username;
        if(!username) {
          newAccount.hasTempUsername = true;       
          username = idGen();        
        }
        var email = loginConfig.email;
        var newAccount = model.newAccount(username, email, loginConfig.id);
        var providerAccessTokenField = 'accessToken'+loginConfig.provider;
        newAccount[providerAccessTokenField] = loginConfig.accessToken;
        newAccount.activated = true;
        newAccount.activatedOn = new Date();
        newAccount.name = loginConfig.name;
  
        // create new account & login
        return model.createExternalLogin(newAccount); // create account
      }
      else {
        return q.fcall(function () { return _account; }); // existing account
      }
    })
    .then(function(_account) { // create session in cache
      account = _account;
      model.data = account;
        
      if(!model.isActive())
        throw new AuthenticationError('Account not activated');
        
      var suspendInfo = model.isSuspended();
      if(suspendInfo.isSuspended)
        throw new AuthenticationError(suspendInfo.message);
      
      return SessionCache().create(account);
    })
    .then(function(_token) {  // create refresh-token
      token = _token;
      // allow long sessions while continously issuing new auth tokens
      return SessionCache().createRefreshToken(account)
    })
    .then(function() { // log login
      var accountStats = AccountStats({logEventOverride: model.logEvent, user: model.user});
      return accountStats.addLogin({
        accountId: account.id,
        ip: loginConfig.ip, 
        agent: loginConfig.agent
      });
    })
    .then(function() { // success
      account.token = token;
      if(account.passwordHash) // in case if also user authentication is activated
        delete account.passwordHash;
      defer.resolve(account);
    })
    .fail(function(err) { // error
      if(err instanceof AuthenticationError) {
        err.code = 401; // set error code to use in later handlers
        if(account) {
          model.loginFailed(loginConfig) // save failed login attempt is correct username
          .then(function() {
            return defer.reject(err);  // do not write log, user input error & prone to DOS                    
          })
          .fail(function(err) {
            log.error(err, {name:'accout.loginExternal', loginConfig: loginConfig.username});
            return defer.reject(err);   
          });
        }
        else {
          return defer.reject(err);  
        }
      }
      else {
        log.error(err, {name:'accout.loginExternal', loginConfig: loginConfig.username});
        defer.reject(err); 
      }
    });
    
    return defer.promise;
  }
  
    
  return model;
};