var q = require('q'),
    _ = require('underscore'),
    idGen = require('../../utils/idGen'),
    log = require('../../utils/logger'),
    Command = require('../command/models/command'),
    transactionHeader = require('./transactionHeader'),
    commmandStatusOpen = 'open',
    commandStatusSuccess = 'success',
    commandStatusError = 'error';

/**
 *  Command creation/delegation
 *  Creates a command record if HTTP header not set, and confirms on success 
 *  or just passes the transacation id to the handler (which is responsible to delegate furthe)
 */
module.exports = function (req, res, handlerConfig) {
  var self = this;
  this.log = function() {
    var defer = q.defer();
    
    // check if already part of a transaction, just return txnId if so
    if(transactionHeader.isSet(req.headers)) {
      return q.fcall(function() { return transactionHeader.getTransactionId(req.headers); });
    }
    
    // new transaction   
    var txnId = idGen();
    transactionHeader.set(req.headers, txnId);
        
    var commandData = {
      id: txnId,
      url: req.url,
      method: req.method,
      headers: (req.headers && !_.isEmpty(req.headers)) ? JSON.stringify(req.headers) : null,
      body: (req.body && !_.isEmpty(req.body))? JSON.stringify(req.body) : null,
      query: (req.query && !_.isEmpty(req.query))? JSON.stringify(req.query) : null,
      params: (req.params && !_.isEmpty(req.params)) ? JSON.stringify(req.params) : null,
      user: {
        id: req.user.userId,
        username: req.user.username
      },
      timestamp: new Date(),
      status: commmandStatusOpen
    }
    
    Command({user: req.user, data: commandData})
    .create()
    .then(function(result) {
      defer.resolve(result.id); // just return command/transaction id
    })
    .fail(function(err) {
      log.error(err, {data: commandData, name: 'command.log'});
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  this.confirm = function(requestData) {
    var defer = q.defer();
    
    var txnId = transactionHeader.getTransactionId(req.headers);
    
    // overwrite body with null on confirm to save disk space
    Command({user: req.user, data: {id: txnId, status: commandStatusSuccess, headers: null, body: null}})
    .save()
    .then(function(result) {
      defer.resolve(requestData); // return the input data, not the command data
    })
    .fail(function(err) {
      log.error(err, {txnId: txnId, name: 'command.confirm'});
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  this.fail = function(err) {
    var defer = q.defer();
    
    var txnId = transactionHeader.getTransactionId(req.headers);

    Command({user: req.user, data: {id: txnId, status: commandStatusError}})
    .save()
    .then(function(result) {
      defer.resolve(result);
    })
    .fail(function(err) {
      log.error(err, {txnId: txnId, name: 'command.fail'});
      defer.reject(err);
    });
    
    return defer.promise;
  }
  
  
  self.log()
  .then(function(cmdId) {
    return handlerConfig.handler(cmdId); 
  })
  .then(function(result) {
    return self.confirm(result);
  })
  .then(function(result) {
    handlerConfig.success(result);
  })
  .fail(function(err) {
    self.fail(err)
    .then(function(cmd) {
      handlerConfig.fail(err);      
    })
    .fail(function(err) {
      handlerConfig.fail(err);
    });
  }); 
  
}