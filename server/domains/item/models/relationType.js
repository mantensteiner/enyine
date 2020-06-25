var BaseModel = require('../../_shared/baseModel'),
    spacePolicies = require('../../_shared/spacePolicies'),
    log = require('../../../utils/logger'),
    q = require('q'),
    modelDefinition = require('../config/mapping').item.properties,
    modelShaper = require('../../_shared/modelShaper'),
    ValidationError = require('../../../utils/errors').ValidationError;

module.exports = function(modelConfig) {
  
  this.new = function() {
    var self = this;
    var model = BaseModel.create({
      index: "item",
      type: "relationType",
      policy: spacePolicies.spaceMemberPolicy,
    }, modelConfig);
    
    // model.validate
    model.validate = function(modelData) {
      if(!modelData.spaceId && !modelData.userId) 
        return q.fcall(function () { throw new ValidationError('SpaceId missing.'); });
        
      return q.fcall(function () { return modelShaper({definition: modelDefinition, data: modelData}); });
    }
    
    // model.validateSave
    model.validateSave = function(modelData) {
      var defer = q.defer();
      
      model.validate(modelData)
      .then(function(data) {
        model.data = data;
        return model.save();
      })
      .then(function(result) {
        return defer.resolve(result);
      })
      .fail(function(err) {
        log.error(err, {name: 'relationType.validateSave', modelData: modelData});
        return defer.reject(err);
      });
      
      return defer.promise;
    }
  
    return model;
  }
  
  return this.new();
};
