var BaseModel = require('../../_shared/baseModel'),
    _ = require('underscore'),
    q = require('q');

module.exports = function(modelConfig) {
  // init 
  var model = BaseModel.create({
    index: "auth",
    type: "accountStats",
    disableEventLog: true // logins are logged in accountStats
  }, modelConfig);
  
  // limit length of persisted lists 
  function limitedList(list, nrOfElements) {
    var listLength = list.length;
    if(listLength >= nrOfElements) {
      return _.last(list, listLength - 1);
    }
    return list;
  }
  
  // model.addLogin
  model.addLogin = function(addLoginConfig) {
    var defer = q.defer();
    
    model.findOne({accountId: addLoginConfig.accountId}) // find accountStats
    .then(function(accountStats) { // save login info, limit to 25 entries
      model.fields = ['logins'];
      accountStats.logins = !accountStats.logins ? [] : limitedList(accountStats.logins, 25);
      accountStats.logins.push({
        ip: addLoginConfig.ip,
        date: new Date(),
        agent: addLoginConfig.agent
      });
      
      model.data = accountStats;
      return model.save();
    })
    .then(function() { // success
      defer.resolve();
    })
    .fail(function(err) { // error
      // hence this model is meant to be called from the account model,
      // we do not log here to avoid log duplication
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  // model.addFailedLogin
  model.addFailedLogin = function(addFailedLoginConfig) {
    var defer = q.defer();
    
    model.findOne({id: addFailedLoginConfig.accountId}) // find accountStats
    .then(function(accountStats) { // save login failure info, limit to 50 entries
      model.fields = ['failedLogins'];
      accountStats.failedLogins = !accountStats.failedLogins ? [] : limitedList(accountStats.failedLogins, 50);
      accountStats.failedLogins.push({
        ip: addFailedLoginConfig.ip,
        date: new Date(),
        agent: addFailedLoginConfig.agent,
        message: addFailedLoginConfig.message
      });
      
      model.data = accountStats;
      return model.save();
    })
    .then(function() { // success
      defer.resolve();
    })
    .fail(function(err) { // error
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
    
  // model.addPasswordResetRequest
  model.addPasswordResetRequest = function(addPasswordResetRequestConfig) {
    var defer = q.defer();
    
    model.findOne({accountId: addPasswordResetRequestConfig.accountId})  // find accountStats
    .then(function(accountStats) { // save password reset info, limit to 20 entries
      model.fields = ['passwordResets'];
      accountStats.passwordResets = !accountStats.passwordResets ? [] : limitedList(accountStats.passwordResets, 20);
      accountStats.passwordResets.push({
        date: new Date(),
        ip: addPasswordResetRequestConfig.ip,
        agent: addPasswordResetRequestConfig.agent,
        action: addPasswordResetRequestConfig.action
      })
      
      model.data = accountStats;
      return model.save();
    })
    .then(function() { // success
      defer.resolve();
    })
    .fail(function(err) { // error
      defer.reject(err);
    });
    
    return defer.promise;
  }
    
  return model;
};