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
  if(!config.status) 
    return q.fcall(function () { throw new ValidationError('status missing.'); });
    
  var defer = q.defer();

  var spaceConfig = {
    user: config.user,
    txnId: config.txnId,
    data: { id: config.spaceId }
  }
  
  var spaceStatus = [];
  // Avoid circular dependency by lazy loading the space model
  var Space = require('../models/space');
  var savedStatus = {};
  
  Space(spaceConfig).getById(config.spaceId)
  .then(function(space) {
    if(space.status)
      spaceStatus = space.status;
    
    /*
     * Ignore the order for now and even allow duplicates until the usecase is clear
     * 
    if(config.status.order) {
      var orderAlreadyUsed = _.findWhere(spaceStatus, {order: config.status.order});
      if(orderAlreadyUsed.length) {
        return defer.reject({message: 'The order ' + config.status.order + ' is already in use.'});
      }
    }
    else {
      // Auto-set order to last 
      config.status.order = spaceStatus.length + 1;
    }
    */

    if(!config.status.id) {
      // Create
      var newStatus = {
        id: idGen(),
        name: config.status.name,
        order: config.status.order ? config.status.order : undefined,
        active: config.status.active ? config.status.active : 1,
        limit: config.status.limit ? config.status.limit : null
      };
      savedStatus = newStatus;
      spaceStatus.push(newStatus);
    }
    else {
      // Update
      var _status = _.findWhere(spaceStatus, {id:config.status.id});
      if(!_status) {
        return defer.reject(new Error('Status with id ' + config.status.id + ' not found, status update not possible.'));
      }
      
      if(_status) {
        _status.id = config.status.id;
        _status.name = config.status.name;
        _status.order = config.status.order;
        _status.active = config.status.active;
        _status.limit = config.status.limit ? config.status.limit : null;
        savedStatus = _status;
      }
    }
    spaceConfig.data.status = spaceStatus;
    return Space(spaceConfig).save();
  })
  .then(function(result) {
    defer.resolve(savedStatus);
  })
  .fail(function(err) {
    defer.reject(err);
  });
  
  return defer.promise;
}