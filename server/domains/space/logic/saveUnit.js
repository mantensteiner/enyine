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
  if(!config.unit) 
    return q.fcall(function () { throw new ValidationError('unit missing.'); }); 
    
  var defer = q.defer();

  var spaceConfig = {
    user: config.user,
    txnId: config.txnId,
    data: { id: config.spaceId }
  }
  
  var spaceUnits= [];
  // Avoid circular dependency by lazy loading the space model
  var Space = require('../models/space');
  var savedUnit = {};
  
  Space(spaceConfig)
  .getById(config.spaceId)
  .then(function(space) {
    if(space.units)
      spaceUnits = space.units;

    if(!config.unit.id) {
      // Create
      var newUnit = {
        id: idGen(),
        name: config.unit.name,
        symbol: config.unit.symbol,
        medium: config.unit.medium,
        factors: config.unit.factors
      };
      savedUnit = newUnit;
      spaceUnits.push(newUnit);
    }
    else {
      // Update
      var _unit = _.findWhere(spaceUnits, {id:config.unit.id});
      if(!_unit) {
        return defer.reject(new Error('Unit with id ' + config.unit.id + ' not found, unit update not possible.'));
      }
      
      if(_unit) {
        _unit.id = config.unit.id;
        _unit.name = config.unit.name;
        _unit.medium = config.unit.medium;
        _unit.factors = config.unit.factors;
        savedUnit = _unit;
      }
    }
    spaceConfig.data.units = spaceUnits;
    return Space(spaceConfig).save();
  })
  .then(function(result) {
    defer.resolve(savedUnit);
  })
  .fail(function(err) {
    defer.reject(err);
  });
  
  return defer.promise;
}
