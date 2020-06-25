var _ = require('underscore'),
    q = require('q'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError,
    idGen = require('../../../utils/idGen');

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('spaceId missing.'); });
  if(!config.priority) 
    return q.fcall(function () { throw new ValidationError('priority missing.'); }); 
    
  var defer = q.defer();

  var spaceConfig = {
    user: config.user,
    txnId: config.txnId,
    data: { id: config.spaceId }
  }
  
  var spacePriorities = [];
  // Avoid circular dependency by lazy loading the space model
  var Space = require('../models/space');
  var savedPriority = {};
  
  Space(spaceConfig)
  .getById(config.spaceId)
  .then(function(space) {
    if(space.priorities)
      spacePriorities = space.priorities;
    
    if(!config.priority.id) {
      // Create
      var newPriority = {
        id: idGen(),
        name: config.priority.name,
        order: config.priority.order ? config.priority.order : nr,
        active: config.priority.active ? config.priority.active : 1
      };
      savedPriority = newPriority;
      spacePriorities.push(newPriority);
    }
    else {
      // Update
      var _priority = _.findWhere(spacePriorities, {id:config.priority.id});
      if(!_priority) {
        return defer.reject(new Error('Priority with id ' + config.priority.id + ' not found, priority update not possible.'));
      }
      
      if(_priority) {
        _priority.id = config.priority.id;
        _priority.name = config.priority.name;
        _priority.order = config.priority.order;
        _priority.active = config.priority.active;
        savedPriority = _priority;
      }
    }
    spaceConfig.data.priorities = spacePriorities;
    return Space(spaceConfig).save();
  })
  .then(function(result) {
    defer.resolve(savedPriority);
  })
  .fail(function(err) {
    defer.reject(err);
  });
  
  return defer.promise;
}
