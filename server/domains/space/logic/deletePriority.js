var _ = require('underscore'),
    q = require('q'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('spaceId missing.'); });
  if(!config.priorityId) 
    return q.fcall(function () { throw new ValidationError('priorityId missing.'); }); 
  
  var defer = q.defer();

  var spaceConfig = {
    user: config.user,    
    txnId: config.txnId,
    data: { id: config.spaceId }
  }
  
  // Avoid circular dependency by lazy loading the space model
  var Space = require('../models/space');

  Space(spaceConfig)
  .getById(config.spaceId)
  .then(function(space) {
    var pPriorities = [];
    if(space.priorities)
      pPriorities = space.priorities;
    
    var _priority = _.findWhere(pPriorities, {id:config.priorityId});
    if(_priority) {
      pPriorities = _.without(pPriorities, _priority);
      spaceConfig.data.priorities = pPriorities;
      return Space(spaceConfig).save(); // save without priority
    }
    return q.fcall(function() { return null; }); // do noting
  })
  .then(function(result) {
    defer.resolve(result);
  })
  .fail(function(err){
    defer.reject(err);
  });
  
  return defer.promise;
};
