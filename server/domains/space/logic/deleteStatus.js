var _ = require('underscore'),
    q = require('q'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('spaceId missing.'); });
  if(!config.statusId) 
    return q.fcall(function () { throw new ValidationError('statusId missing.'); }); 
  
  var defer = q.defer();

  var spaceConfig = {
    user: config.user,
    txnId: config.txnId,
    data: { id: config.spaceId }
  }
  
  var Space = require('../models/space');

  Space(spaceConfig)
  .getById(config.spaceId)
  .then(function(space) {    
    var spaceStatus = [];
    if(space.status)
      spaceStatus = space.status;
    
    var _status = _.findWhere(spaceStatus, {id:config.statusId});
    if(_status) {
      spaceStatus = _.without(spaceStatus, _status);
      spaceConfig.data.status = spaceStatus;
      return Space(spaceConfig).save(); // save without status
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
}