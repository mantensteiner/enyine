var _ = require('underscore'),
    q = require('q'),
    log = require('../../../utils/logger'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(config) {
  if(!config.user) 
    return q.fcall(function () { throw new ValidationError('user missing.'); });
  if(!config.spaceId) 
    return q.fcall(function () { throw new ValidationError('spaceId missing.'); });
  if(!config.unitId) 
    return q.fcall(function () { throw new ValidationError('unitId missing.'); }); 
  
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
    var spaceUnits = [];
    if(space.units)
      spaceUnits = space.units;
    
    var _unit = _.findWhere(spaceUnits, {id:config.unitId});
    if(_unit) {
      spaceUnits = _.without(spaceUnits, _unit);
      spaceConfig.data.units = spaceUnits;
      return Space(spaceConfig).save(); // save without unit
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
